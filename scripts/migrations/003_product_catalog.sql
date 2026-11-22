-- 003: katalog produk publik
--
-- Menambah alamat publik (slug) dan informasi berkas opsional untuk halaman
-- detail produk. Jalankan manual di Neon SQL Editor untuk production.
--
-- Urutan aman: jalankan migrasi ini lebih dulu, baru deploy kode yang
-- membaca/menulis kolom baru.

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug varchar(120);
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_format varchar(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_size varchar(40);

-- Isi slug produk lama dari judul. Judul yang tidak menghasilkan huruf/angka
-- (misalnya hanya simbol) memakai id produk supaya tetap punya alamat unik.
WITH base AS (
  SELECT
    id,
    created_at,
    COALESCE(
      NULLIF(
        trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      id
    ) AS base_slug
  FROM products
  WHERE slug IS NULL OR slug = ''
),
numbered AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY created_at, id) AS rn
  FROM base
)
UPDATE products p
SET slug = CASE
  WHEN n.rn = 1 THEN n.base_slug
  ELSE n.base_slug || '-' || n.rn
END
FROM numbered n
WHERE p.id = n.id;

-- Satu slug hanya boleh dipakai satu produk. Index unik tetap mengizinkan
-- beberapa baris NULL untuk data lama yang belum sempat diisi.
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON products (slug);
