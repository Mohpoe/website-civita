// Menjalankan file SQL migrasi ke database pada NEONDB_DATABASE_URL.
// Pemakaian: node --env-file=.env.local scripts/run-migration.mjs <nama-file>
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const file = process.argv[2];
if (!file) {
  console.error("Sebutkan nama file migrasi, mis. 001_site_settings_testimonials.sql");
  process.exit(1);
}

const sql = neon(process.env.NEONDB_DATABASE_URL);
const content = await readFile(new URL(`./migrations/${file}`, import.meta.url), "utf8");

// Buang komentar baris penuh, lalu pecah per statement.
// Driver HTTP Neon menjalankan tiap statement pada transaksi sendiri, jadi
// BEGIN/COMMIT dilewati. File migrasi tetap menyertakannya agar aman saat
// dijalankan manual di Neon SQL Editor.
const TRANSACTION_CONTROL = /^(begin|commit|rollback)$/i;

const statements = content
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((part) => part.trim())
  .filter((part) => part && !TRANSACTION_CONTROL.test(part));

for (const statement of statements) {
  await sql.query(statement);
  console.log("OK:", statement.split("\n")[0].slice(0, 70));
}

console.log(`Selesai: ${statements.length} statement.`);
