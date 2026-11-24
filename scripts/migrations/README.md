# Migrasi Database

Folder ini berisi migrasi SQL idempoten untuk Neon. Jalankan **berurutan** dan
selalu di branch development lebih dulu, lalu di production.

| File | Isi |
| --- | --- |
| `001_site_settings_testimonials.sql` | Tabel `site_settings` + `testimonials` (identitas situs & testimoni landing page). |
| `002_services_orders_chat.sql` | Tabel `services`, `service_orders`, `service_messages` + seed 8 layanan jasa. |
| `003_product_catalog.sql` | Kolom `slug`, `file_format`, `file_size` pada `products` + isi slug produk lama dan unique index. |
| `004_service_pricing_attachments.sql` | Harga per bahasa (`services.prices`), nomor WhatsApp klien, tabel `service_order_attachments`, dan lampiran pada `service_messages`. |
| `005_service_visuals.sql` | Kolom `icon`, `accent`, dan `tags` (maks. 2) pada `services` + backfill visual 8 layanan seed. |

## Menjalankan di development

```powershell
node --env-file=.env.local scripts/run-migration.mjs 001_site_settings_testimonials.sql
node --env-file=.env.local scripts/run-migration.mjs 002_services_orders_chat.sql
node --env-file=.env.local scripts/run-migration.mjs 003_product_catalog.sql
node --env-file=.env.local scripts/run-migration.mjs 004_service_pricing_attachments.sql
node --env-file=.env.local scripts/run-migration.mjs 005_service_visuals.sql
```

Skrip membaca `NEONDB_DATABASE_URL` dari `.env.local`. Driver HTTP Neon
menjalankan satu statement per transaksi, jadi `BEGIN`/`COMMIT` di file SQL
dilewati otomatis oleh skrip (tetap aman saat dijalankan manual).

## Menjalankan di production (Neon SQL Editor)

1. Buka dashboard Neon, pilih **branch production** (bukan development).
2. Buka **SQL Editor**.
3. Salin seluruh isi `001_site_settings_testimonials.sql`, jalankan.
4. Salin seluruh isi `002_services_orders_chat.sql`, jalankan.
5. Salin seluruh isi `003_product_catalog.sql`, jalankan.
6. Salin seluruh isi `004_service_pricing_attachments.sql`, jalankan.
7. Salin seluruh isi `005_service_visuals.sql`, jalankan.
8. Verifikasi:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('site_settings', 'testimonials', 'services', 'service_orders', 'service_messages', 'service_order_attachments');

SELECT slug, name, price, prices, icon, accent, tags, is_active FROM services ORDER BY sort_order;

SELECT count(*) FILTER (WHERE slug IS NULL OR slug = '') AS produk_tanpa_slug,
       count(*) AS total_produk
FROM products;
```

Hasil terakhir harus menunjukkan `produk_tanpa_slug = 0`.

Ketiganya memakai `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, dan `ON CONFLICT DO NOTHING`,
sehingga aman diulang tanpa menimpa harga atau pengaturan yang sudah diubah
superadmin.

## Catatan

- Sebelum migrasi dijalankan, situs tetap tampil memakai nilai bawaan
  `lib/constants.ts`, katalog statis di `lib/services.ts`, dan testimoni kosong.
- Harga seed (bisa diubah dari dashboard superadmin): CV ATS 75.000, Resume ATS
  65.000, Surat Lamaran 45.000, Cover Letter 55.000, CV Kreatif 100.000, CV
  Basic 45.000, Surat Resign 35.000, Invoice & Berkas Lain 50.000.
- Webhook Midtrans memilih tabel berdasarkan awalan `order_id`: `SVC-` untuk
  pesanan jasa, sisanya pesanan produk digital.
