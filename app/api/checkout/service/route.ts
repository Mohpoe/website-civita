import { getPrimaryEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { createSnapToken } from "@/lib/midtrans-snap";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServiceById, servicePriceForLanguage } from "@/lib/service-catalog";
import { generateServiceOrderId } from "@/lib/service-access";
import { sql } from "@/lib/utils";
import { del } from "@vercel/blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60; // detik
const MAX_CHECKOUT_PER_WINDOW = 6; // per user per menit
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;

function isPrivateBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Lampiran brief hanya boleh dari folder `service-source/`. */
function isServiceSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return isPrivateBlobUrl(value) && url.pathname.startsWith("/service-source/");
  } catch {
    return false;
  }
}

interface AttachmentInput {
  url: string;
  name: string;
  size: number;
}

/** Validasi lampiran dari klien; URL wajib menunjuk ke PRIVATE_BLOB. */
function parseAttachments(raw: unknown): AttachmentInput[] {
  if (!Array.isArray(raw)) return [];

  const items: AttachmentInput[] = [];
  for (const candidate of raw.slice(0, MAX_ATTACHMENTS)) {
    if (!candidate || typeof candidate !== "object") continue;

    const record = candidate as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url : "";
    if (!isServiceSourceUrl(url)) continue;

    const name = typeof record.name === "string" ? record.name.trim().slice(0, 200) : "";
    const size = Number(record.size);
    items.push({
      url,
      name: name || "Lampiran",
      size: Number.isFinite(size) && size > 0 ? Math.min(Math.round(size), MAX_ATTACHMENT_SIZE) : 0,
    });
  }

  return items;
}

/** Nomor WhatsApp disimpan dalam bentuk digit dengan awalan + opsional. */
function normalizeWhatsapp(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  const hasPlus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "").slice(0, 20);
  if (digits.length < 8) return "";
  return `${hasPlus ? "+" : ""}${digits}`;
}

async function deleteUploadedBlobs(urls: string[]) {
  await Promise.allSettled(
    urls.map((url) =>
      del(url, {
        storeId: process.env.PRIVATE_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      }),
    ),
  );
}

async function replaceAttachments(orderId: string, attachments: AttachmentInput[]) {
  if (attachments.length === 0) return;

  const previous = (await sql`
    SELECT file_url FROM service_order_attachments WHERE order_id = ${orderId}
  `) as { file_url: string }[];

  await sql`DELETE FROM service_order_attachments WHERE order_id = ${orderId}`;

  for (const attachment of attachments) {
    await sql`
      INSERT INTO service_order_attachments (id, order_id, file_url, file_name, file_size)
      VALUES (
        ${randomUUID()}, ${orderId}, ${attachment.url}, ${attachment.name},
        ${attachment.size > 0 ? attachment.size : null}
      )
    `;
  }

  // Bersihkan blob lampiran lama yang tidak dipakai lagi (best effort).
  const keep = new Set(attachments.map((item) => item.url));
  const obsolete = previous.map((item) => item.file_url).filter((url) => !keep.has(url));
  if (obsolete.length > 0) {
    await deleteUploadedBlobs(obsolete);
  }
}

interface PendingServiceOrderRow {
  order_id: string;
  amount: number;
  snap_token: string | null;
}

/**
 * Buat pesanan jasa dan token Snap.
 *
 * Order disimpan lebih dulu; kalau Midtrans gagal, baris dan blob lampiran
 * yang baru diunggah dihapus lagi supaya tidak ada pesanan menggantung.
 */
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userEmail = getPrimaryEmail(user);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Akun Anda belum memiliki email. Lengkapi profil terlebih dahulu." },
        { status: 400 },
      );
    }

    const rateLimit = await checkRateLimit(
      `checkout-service:ratelimit:${user.id}`,
      MAX_CHECKOUT_PER_WINDOW,
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi sebentar lagi." },
        { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW) } },
      );
    }

    const body = await req.json().catch(() => null);
    const serviceId = typeof body?.serviceId === "string" ? body.serviceId : "";
    const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, 5000) : "";
    const requestedLanguage = typeof body?.language === "string" ? body.language : "";
    const whatsapp = normalizeWhatsapp(body?.whatsapp);

    // Lampiran baru berupa array. `sourceFileUrl` lama tetap diterima agar
    // tidak ada klien yang terlanjur memakai payload versi sebelumnya.
    const attachments = parseAttachments(body?.attachments);
    if (attachments.length === 0 && typeof body?.sourceFileUrl === "string") {
      const legacyUrl = body.sourceFileUrl;
      if (isServiceSourceUrl(legacyUrl)) {
        attachments.push({
          url: legacyUrl,
          name:
            typeof body?.sourceFileName === "string"
              ? body.sourceFileName.trim().slice(0, 200) || "Lampiran"
              : "Lampiran",
          size: 0,
        });
      }
    }

    if (!serviceId) {
      return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 400 });
    }
    if (brief.length < 10) {
      return NextResponse.json(
        { error: "Ceritakan kebutuhanmu minimal 10 karakter agar admin bisa mengerjakan dengan tepat." },
        { status: 400 },
      );
    }
    if (!whatsapp) {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi agar admin bisa menghubungi Anda." },
        { status: 400 },
      );
    }

    const service = await getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Layanan tidak ditemukan atau sedang tidak tersedia." },
        { status: 404 },
      );
    }

    if (requestedLanguage && !service.languages.includes(requestedLanguage)) {
      return NextResponse.json(
        { error: "Bahasa untuk layanan ini tidak tersedia." },
        { status: 400 },
      );
    }

    const language = requestedLanguage || service.languages[0] || "id";

    const price = servicePriceForLanguage(service, language);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Harga untuk bahasa ini belum diatur. Hubungi admin." },
        { status: 400 },
      );
    }

    const customer = { firstName: user.firstName, email: userEmail };
    const primaryAttachment = attachments[0] ?? null;

    // #region Lanjutkan pesanan pending
    // Pesanan pending hanya dipakai ulang kalau nominalnya sama. Jika klien
    // berganti bahasa dan harganya berbeda, pesanan baru dibuat supaya
    // Midtrans tidak menerima gross_amount yang berubah untuk order_id lama.
    const pendingRows = (await sql`
      SELECT order_id, amount, snap_token
      FROM service_orders
      WHERE user_id = ${user.id} AND service_id = ${service.id} AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `) as PendingServiceOrderRow[];

    if (pendingRows.length > 0 && Number(pendingRows[0].amount) === price) {
      const pending = pendingRows[0];
      const ensured = await createSnapToken({
        orderId: pending.order_id,
        grossAmount: price,
        item: { id: service.id, name: `${service.name} (${language.toUpperCase()})`, price },
        customer,
      });

      if (ensured.ok) {
        await sql`
          UPDATE service_orders
          SET snap_token = ${ensured.token}, brief = ${brief},
              language = ${language}, whatsapp = ${whatsapp},
              updated_at = now()
          WHERE order_id = ${pending.order_id}
        `;

        if (attachments.length > 0) {
          await replaceAttachments(pending.order_id, attachments);
          await sql`
            UPDATE service_orders
            SET source_file_url = ${primaryAttachment?.url ?? null},
                source_file_name = ${primaryAttachment?.name ?? null}
            WHERE order_id = ${pending.order_id}
          `;
        }

        return NextResponse.json({
          token: ensured.token,
          orderId: pending.order_id,
          amount: price,
          reused: true,
        });
      }
      // Token gagal dibuat ulang (mis. order Midtrans sudah tidak aktif);
      // lanjut membuat pesanan baru di bawah.
    }
    // #endregion

    const orderId = generateServiceOrderId();

    await sql`
      INSERT INTO service_orders (
        order_id, user_id, email, service_id, service_name, service_slug,
        language, amount, status, brief, whatsapp,
        source_file_url, source_file_name, snap_token
      )
      VALUES (
        ${orderId}, ${user.id}, ${userEmail}, ${service.id}, ${service.name}, ${service.slug},
        ${language}, ${price}, 'pending', ${brief}, ${whatsapp},
        ${primaryAttachment?.url ?? null}, ${primaryAttachment?.name ?? null}, NULL
      )
    `;

    try {
      await replaceAttachments(orderId, attachments);
    } catch (error) {
      console.error("Gagal menyimpan lampiran pesanan:", error);
      await sql`DELETE FROM service_orders WHERE order_id = ${orderId}`;
      return NextResponse.json({ error: "Gagal menyimpan lampiran pesanan." }, { status: 500 });
    }

    const created = await createSnapToken({
      orderId,
      grossAmount: price,
      item: { id: service.id, name: `${service.name} (${language.toUpperCase()})`, price },
      customer,
    });

    if (!created.ok) {
      await sql`DELETE FROM service_orders WHERE order_id = ${orderId}`;
      return NextResponse.json({ error: created.message }, { status: 502 });
    }

    await sql`
      UPDATE service_orders SET snap_token = ${created.token} WHERE order_id = ${orderId}
    `;

    return NextResponse.json({ token: created.token, orderId, amount: price });
  } catch (error) {
    console.error("Checkout layanan error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
