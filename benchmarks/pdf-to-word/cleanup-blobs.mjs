import { del, list } from "@vercel/blob";

process.loadEnvFile(".env.local");

if (process.env.CONFIRM_PDF_TO_WORD_CLEANUP !== "yes") {
  console.error(
    "Ditolak: set CONFIRM_PDF_TO_WORD_CLEANUP=yes untuk menghapus blob pdf-to-word.",
  );
  process.exit(1);
}

const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
const prefix = "pdf-to-word/";

const blobs = [];
let cursor;
do {
  const page = await list({ prefix, cursor, token, limit: 1000 });
  blobs.push(...page.blobs);
  cursor = page.cursor;
} while (cursor);

if (blobs.length === 0) {
  console.log("tidak ada blob untuk dihapus");
  process.exit(0);
}

console.log(`menghapus ${blobs.length} blob uji:`);
for (const blob of blobs) console.log(`- ${blob.pathname}`);

await del(
  blobs.map((blob) => blob.url),
  { token },
);

const remaining = await list({ prefix, token });
console.log(`sisa blob setelah cleanup: ${remaining.blobs.length}`);
