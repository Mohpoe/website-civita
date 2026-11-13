import { list } from "@vercel/blob";

process.loadEnvFile(".env.local");

const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
const secret = process.env.CRON_SECRET;

const withoutAuth = await fetch(`${BASE}/api/cron/pdf-to-word-cleanup`);
console.log("[cron tanpa auth]", withoutAuth.status);

const withAuth = await fetch(`${BASE}/api/cron/pdf-to-word-cleanup`, {
  headers: { authorization: `Bearer ${secret}` },
});
console.log("[cron dengan auth]", withAuth.status, await withAuth.text());

const blobs = await list({
  prefix: "pdf-to-word/",
  token: process.env.PRIVATE_BLOB_READ_WRITE_TOKEN,
});

console.log("\n[blob saat ini]");
for (const blob of blobs.blobs) {
  console.log(`${blob.pathname} | ${blob.size} bytes | ${blob.uploadedAt.toISOString()}`);
}
