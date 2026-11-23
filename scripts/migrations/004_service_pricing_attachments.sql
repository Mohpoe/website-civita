-- 004_service_pricing_attachments.sql
-- Harga per bahasa, nomor WhatsApp klien, banyak lampiran pesanan, dan
-- lampiran pada chat. Migrasi ini idempoten dan aman dijalankan berulang.
--
-- `services.price` tetap disimpan sebagai harga terendah supaya sorting,
-- kartu katalog, dan JSON-LD tidak perlu tahu detail bahasa. Harga yang
-- benar-benar ditagihkan selalu diambil dari `services.prices[language]`.

BEGIN;

-- #region Harga per bahasa
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS prices jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill dari harga tunggal yang lama untuk setiap bahasa yang aktif.
UPDATE services AS s
SET prices = COALESCE(
  (
    SELECT jsonb_object_agg(lang, s.price)
    FROM jsonb_array_elements_text(s.languages) AS lang
  ),
  '{}'::jsonb
)
WHERE s.prices = '{}'::jsonb;

-- Jaga `price` tetap sama dengan harga terendah.
UPDATE services AS s
SET price = sub.min_price
FROM (
  SELECT id, MIN(value::numeric)::int AS min_price
  FROM services, LATERAL jsonb_each_text(prices) AS p(key, value)
  GROUP BY id
) AS sub
WHERE s.id = sub.id
  AND sub.min_price > 0
  AND s.price <> sub.min_price;
-- #endregion

-- #region Kontak klien
ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS whatsapp varchar(32);
-- #endregion

-- #region Lampiran pesanan (banyak berkas)
CREATE TABLE IF NOT EXISTS service_order_attachments (
  id          varchar(64) PRIMARY KEY,
  order_id    varchar(64) NOT NULL REFERENCES service_orders(order_id) ON DELETE CASCADE,
  file_url    text        NOT NULL,
  file_name   varchar(200),
  file_size   bigint,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_order_attachments_order_idx
  ON service_order_attachments (order_id, created_at ASC);

-- Pindahkan lampiran tunggal versi lama supaya riwayat tetap bisa diunduh
-- lewat daftar lampiran yang baru.
INSERT INTO service_order_attachments (id, order_id, file_url, file_name, created_at)
SELECT
  'att-' || md5(o.order_id || ':' || o.source_file_url),
  o.order_id,
  o.source_file_url,
  o.source_file_name,
  o.created_at
FROM service_orders AS o
WHERE o.source_file_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM service_order_attachments AS a
    WHERE a.order_id = o.order_id
      AND a.file_url = o.source_file_url
  );
-- #endregion

-- #region Lampiran chat
ALTER TABLE service_messages
  ADD COLUMN IF NOT EXISTS attachment_url  text,
  ADD COLUMN IF NOT EXISTS attachment_name varchar(200),
  ADD COLUMN IF NOT EXISTS attachment_size bigint;
-- #endregion

COMMIT;
