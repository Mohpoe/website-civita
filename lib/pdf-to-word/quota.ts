import { PDF_TO_WORD_QUOTA } from "./config";
import type { PdfToWordIdentity } from "./identity";
import { getRedis } from "./redis";
import type { PdfToWordQuotaInfo } from "./types";

const DAY_TTL_SECONDS = 60 * 60 * 48;
const MONTH_TTL_SECONDS = 60 * 60 * 24 * 40;

/**
 * Batas kuota mengikuti zona waktu Indonesia, bukan UTC, supaya reset harian
 * terjadi tengah malam WIB.
 */
function jakartaPeriod(): { day: string; month: string } {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return { day, month: day.slice(0, 7) };
}

function keys(identity: PdfToWordIdentity) {
  const { day, month } = jakartaPeriod();

  return {
    day,
    month,
    guestDay: `p2w:quota:guest:${identity.ownerId}:d:${day}`,
    guestMonth: `p2w:quota:guest:${identity.ownerId}:m:${month}`,
    userMonth: `p2w:quota:user:${identity.ownerId}:m:${month}`,
    ipUploads: `p2w:abuse:ip:${identity.ipHash}:d:${day}`,
    ipConversionsDay: `p2w:abuse:convert:${identity.ipHash}:d:${day}`,
    ipConversionsMonth: `p2w:abuse:convert:${identity.ipHash}:m:${month}`,
    globalMonth: `p2w:quota:global:m:${month}`,
  };
}

async function bump(key: string, ttlSeconds: number): Promise<number> {
  const redis = getRedis();
  const value = await redis.incr(key);
  if (value === 1) await redis.expire(key, ttlSeconds);
  return value;
}

async function decrement(key: string): Promise<void> {
  const redis = getRedis();
  // Jangan biarkan counter turun di bawah nol kalau refund terjadi dua kali.
  await redis.eval(
    `local value = tonumber(redis.call('GET', KEYS[1]) or '0')
     if value > 0 then return redis.call('DECR', KEYS[1]) end
     return 0`,
    [key],
    [],
  );
}

async function readCounter(key: string): Promise<number> {
  const value = await getRedis().get<string | number>(key);
  return Number(value ?? 0);
}

function limitFor(identity: PdfToWordIdentity): number {
  if (identity.kind === "admin") return Number.POSITIVE_INFINITY;
  if (identity.kind === "buyer") return PDF_TO_WORD_QUOTA.buyerMonthly;
  if (identity.kind === "user") return PDF_TO_WORD_QUOTA.userMonthly;
  return PDF_TO_WORD_QUOTA.guestMonthly;
}

function buildInfo(
  identity: PdfToWordIdentity,
  used: number,
  daily?: { used: number },
): PdfToWordQuotaInfo {
  const limit = limitFor(identity);

  return {
    kind: identity.kind,
    limit: Number.isFinite(limit) ? limit : 0,
    used,
    remaining: Number.isFinite(limit) ? Math.max(0, limit - used) : 0,
    period: "month",
    unlimited: !Number.isFinite(limit),
    ...(identity.kind === "guest"
      ? {
          daily: {
            limit: PDF_TO_WORD_QUOTA.guestDaily,
            used: daily?.used ?? 0,
            remaining: Math.max(
              0,
              PDF_TO_WORD_QUOTA.guestDaily - (daily?.used ?? 0),
            ),
          },
        }
      : {}),
  };
}

export async function getQuotaInfo(
  identity: PdfToWordIdentity,
): Promise<PdfToWordQuotaInfo> {
  if (identity.kind === "admin") {
    return buildInfo(identity, 0);
  }

  const k = keys(identity);

  if (identity.kind === "guest") {
    const [monthUsed, dayUsed] = await Promise.all([
      readCounter(k.guestMonth),
      readCounter(k.guestDay),
    ]);
    return buildInfo(identity, monthUsed, { used: dayUsed });
  }

  return buildInfo(identity, await readCounter(k.userMonth));
}

export type QuotaReservation = { keys: string[] };

export type ConsumeQuotaResult =
  | { ok: true; reservation: QuotaReservation; info: PdfToWordQuotaInfo }
  | { ok: false; message: string; info: PdfToWordQuotaInfo };

/**
 * Potong kuota sebelum konversi dimulai. Kalau job gagal, pemanggil wajib
 * memanggil `refundQuota` dengan reservation yang dikembalikan di sini.
 */
export async function consumeQuota(
  identity: PdfToWordIdentity,
): Promise<ConsumeQuotaResult> {
  const k = keys(identity);

  // Pengaman global: berlaku juga untuk admin agar kuota Adobe tidak habis
  // tanpa peringatan.
  const globalUsed = await bump(k.globalMonth, MONTH_TTL_SECONDS);
  if (globalUsed > PDF_TO_WORD_QUOTA.globalMonthlyCap) {
    await decrement(k.globalMonth);
    return {
      ok: false,
      message:
        "Layanan konversi sedang penuh bulan ini. Silakan coba lagi bulan depan.",
      info: buildInfo(identity, 0),
    };
  }

  const reserved: string[] = [k.globalMonth];

  if (identity.kind === "admin") {
    return {
      ok: true,
      reservation: { keys: reserved },
      info: buildInfo(identity, 0),
    };
  }

  if (identity.kind === "guest") {
    const ipDayUsed = await bump(k.ipConversionsDay, DAY_TTL_SECONDS);
    reserved.push(k.ipConversionsDay);

    if (ipDayUsed > PDF_TO_WORD_QUOTA.guestIpDailyConversions) {
      await refundQuota({ keys: reserved });
      return {
        ok: false,
        message:
          "Batas konversi dari jaringan ini sudah tercapai hari ini. Coba lagi besok atau masuk dengan akun CIVITA.",
        info: buildInfo(identity, await readCounter(k.guestMonth), {
          used: await readCounter(k.guestDay),
        }),
      };
    }

    const ipMonthUsed = await bump(k.ipConversionsMonth, MONTH_TTL_SECONDS);
    reserved.push(k.ipConversionsMonth);

    if (ipMonthUsed > PDF_TO_WORD_QUOTA.guestIpMonthlyConversions) {
      await refundQuota({ keys: reserved });
      return {
        ok: false,
        message:
          "Batas konversi dari jaringan ini sudah tercapai bulan ini. Masuk dengan akun CIVITA untuk kuota pribadi.",
        info: buildInfo(identity, await readCounter(k.guestMonth), {
          used: await readCounter(k.guestDay),
        }),
      };
    }

    const dayUsed = await bump(k.guestDay, DAY_TTL_SECONDS);
    reserved.push(k.guestDay);

    if (dayUsed > PDF_TO_WORD_QUOTA.guestDaily) {
      await refundQuota({ keys: reserved });
      return {
        ok: false,
        message:
          "Kuota tamu hari ini sudah habis. Masuk dengan akun CIVITA untuk mendapatkan 5 konversi per bulan.",
        info: buildInfo(identity, await readCounter(k.guestMonth), {
          used: PDF_TO_WORD_QUOTA.guestDaily,
        }),
      };
    }

    const monthUsed = await bump(k.guestMonth, MONTH_TTL_SECONDS);
    reserved.push(k.guestMonth);

    if (monthUsed > PDF_TO_WORD_QUOTA.guestMonthly) {
      await refundQuota({ keys: reserved });
      return {
        ok: false,
        message:
          "Kuota tamu bulan ini sudah habis. Masuk dengan akun CIVITA atau beli produk digital untuk kuota lebih besar.",
        info: buildInfo(identity, PDF_TO_WORD_QUOTA.guestMonthly, {
          used: await readCounter(k.guestDay),
        }),
      };
    }

    return {
      ok: true,
      reservation: { keys: reserved },
      info: buildInfo(identity, monthUsed, { used: dayUsed }),
    };
  }

  const monthUsed = await bump(k.userMonth, MONTH_TTL_SECONDS);
  reserved.push(k.userMonth);
  const limit = limitFor(identity);

  if (monthUsed > limit) {
    await refundQuota({ keys: reserved });
    return {
      ok: false,
      message:
        identity.kind === "buyer"
          ? "Kuota pembeli bulan ini sudah habis. Kuota direset setiap awal bulan."
          : "Kuota gratis bulan ini sudah habis. Beli produk digital CIVITA untuk mendapatkan 30 konversi per bulan.",
      info: buildInfo(identity, limit),
    };
  }

  return {
    ok: true,
    reservation: { keys: reserved },
    info: buildInfo(identity, monthUsed),
  };
}

export async function refundQuota(
  reservation: QuotaReservation | null | undefined,
): Promise<void> {
  if (!reservation?.keys.length) return;

  await Promise.allSettled(reservation.keys.map((key) => decrement(key)));
}

/**
 * Batas unggahan per IP, terpisah dari kuota konversi. Tujuannya mencegah
 * penyalahgunaan storage oleh tamu yang menghapus cookie.
 */
export async function consumeUploadSlot(
  identity: PdfToWordIdentity,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (identity.kind !== "guest") return { ok: true };

  const k = keys(identity);
  const used = await bump(k.ipUploads, DAY_TTL_SECONDS);

  if (used > PDF_TO_WORD_QUOTA.guestIpDailyUploads) {
    await decrement(k.ipUploads);
    return {
      ok: false,
      message:
        "Terlalu banyak unggahan dari jaringan ini hari ini. Coba lagi besok atau masuk dengan akun CIVITA.",
    };
  }

  return { ok: true };
}
