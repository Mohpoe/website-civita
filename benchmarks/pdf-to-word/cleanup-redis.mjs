import { Redis } from "@upstash/redis";

process.loadEnvFile(".env.local");

if (process.env.CONFIRM_PDF_TO_WORD_CLEANUP !== "yes") {
  console.error(
    "Ditolak: set CONFIRM_PDF_TO_WORD_CLEANUP=yes untuk menghapus key p2w:*.",
  );
  process.exit(1);
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const keys = await redis.keys("p2w:*");

if (keys.length === 0) {
  console.log("tidak ada key p2w:*");
  process.exit(0);
}

console.log(`menghapus ${keys.length} key uji:`);
for (const key of keys) console.log(`- ${key}`);

await redis.del(...keys);

const remaining = await redis.keys("p2w:*");
console.log(`sisa key setelah cleanup: ${remaining.length}`);
