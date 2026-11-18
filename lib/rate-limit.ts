import { Redis } from "@upstash/redis";

/**
 * Rate limit berbasis Upstash Redis (fixed window).
 *
 * Bersifat fail open: kalau Redis belum dikonfigurasi atau sedang bermasalah,
 * permintaan tetap dilayani supaya pengguna sah tidak ikut terblokir.
 */
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn("Upstash Redis tidak tersedia, rate limit dimatikan:", error);
}

export interface RateLimitResult {
  allowed: boolean;
  /** Sisa kuota pada jendela waktu yang sedang berjalan. */
  remaining: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  if (!redis) {
    return { allowed: true, remaining: limit };
  }

  try {
    const current = await redis.incr(key);

    // Pasang masa berlaku hanya saat hitungan pertama.
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (error) {
    console.warn("Rate limit check gagal, permintaan dilanjutkan:", error);
    return { allowed: true, remaining: limit };
  }
}
