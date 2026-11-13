const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Verifikasi token Turnstile. Kalau secret belum diisi, permintaan ditolak
 * dengan pesan yang jelas agar fitur tidak terbuka tanpa perlindungan.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      error: "Verifikasi keamanan belum dikonfigurasi. Hubungi admin CIVITA.",
    };
  }

  if (!token) {
    return { ok: false, error: "Selesaikan verifikasi keamanan terlebih dahulu." };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return { ok: false, error: "Verifikasi keamanan sedang tidak tersedia. Coba lagi." };
    }

    const json = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (json.success) return { ok: true };

    return {
      ok: false,
      error: "Verifikasi keamanan gagal atau kedaluwarsa. Muat ulang lalu coba lagi.",
    };
  } catch {
    return { ok: false, error: "Verifikasi keamanan tidak dapat dihubungi. Coba lagi." };
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}
