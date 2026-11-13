import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * Redis dipakai untuk kuota, tiket upload, dan status job.
 * Kalau env belum diisi, tool akan mengembalikan error yang jelas alih-alih
 * diam-diam berjalan tanpa pembatasan.
 */
export function getRedis(): Redis {
  if (client === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    client = url && token ? new Redis({ url, token }) : null;
  }

  if (!client) {
    throw new Error("UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN belum diisi.");
  }

  return client;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
