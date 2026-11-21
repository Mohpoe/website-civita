-- 002_services_orders_chat.sql
-- Modul layanan jasa berkas lamaran: katalog layanan, pesanan jasa (SVC-),
-- dan chat in-app antara klien dan admin.
--
-- Migrasi ini idempoten dan aman dijalankan berulang di Neon SQL Editor.
-- Jalankan di branch development lebih dulu, lalu di production.

BEGIN;

-- #region Katalog layanan
CREATE TABLE IF NOT EXISTS services (
  id          varchar(64)  PRIMARY KEY,
  slug        varchar(80)  NOT NULL UNIQUE,
  name        varchar(120) NOT NULL,
  description text         NOT NULL DEFAULT '',
  price       integer      NOT NULL CHECK (price >= 0),
  languages   jsonb        NOT NULL DEFAULT '["id","en"]'::jsonb,
  is_active   boolean      NOT NULL DEFAULT true,
  sort_order  integer      NOT NULL DEFAULT 0,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_active_order_idx
  ON services (is_active, sort_order, name);
-- #endregion

-- #region Pesanan jasa
CREATE TABLE IF NOT EXISTS service_orders (
  order_id         varchar(64)  PRIMARY KEY,
  user_id          varchar(128) NOT NULL,
  email            varchar(200),
  service_id       varchar(64)  REFERENCES services(id) ON DELETE SET NULL,
  -- Nama layanan disalin saat order dibuat supaya riwayat tetap utuh
  -- walau katalog berubah atau layanan dihapus.
  service_name     varchar(160) NOT NULL,
  service_slug     varchar(80),
  language         varchar(8)   NOT NULL DEFAULT 'id',
  amount           integer      NOT NULL CHECK (amount > 0),
  status           varchar(20)  NOT NULL DEFAULT 'pending',
  brief            text,
  source_file_url  text,
  source_file_name varchar(200),
  result_file_url  text,
  result_file_name varchar(200),
  admin_notes      text,
  delivered_at     timestamptz,
  snap_token       varchar(255),
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_orders_user_idx
  ON service_orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS service_orders_status_idx
  ON service_orders (status, created_at DESC);
-- #endregion

-- #region Chat in-app
CREATE TABLE IF NOT EXISTS service_messages (
  id          varchar(64)  PRIMARY KEY,
  order_id    varchar(64)  NOT NULL REFERENCES service_orders(order_id) ON DELETE CASCADE,
  sender_id   varchar(128) NOT NULL,
  sender_role varchar(20)  NOT NULL,
  body        text         NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_messages_order_idx
  ON service_messages (order_id, created_at ASC);
-- #endregion

-- #region Seed katalog awal
-- Harga bisa diubah superadmin dari dashboard. `ON CONFLICT` menjaga migrasi
-- tetap idempoten dan tidak menimpa harga yang sudah disesuaikan.
INSERT INTO services (id, slug, name, description, price, languages, is_active, sort_order)
VALUES
  (
    'cv-ats', 'cv-ats', 'CV ATS Friendly',
    'Format satu kolom tanpa tabel dan grafik, mudah dibaca sistem ATS dan tetap enak dilihat recruiter.',
    75000, '["id","en"]'::jsonb, true, 10
  ),
  (
    'resume-ats', 'resume-ats', 'Resume ATS Friendly',
    'Versi ringkas yang menonjolkan pencapaian dan skill paling relevan dengan posisi yang dilamar.',
    65000, '["id","en"]'::jsonb, true, 20
  ),
  (
    'surat-lamaran', 'surat-lamaran', 'Surat Lamaran',
    'Surat lamaran formal yang disesuaikan dengan perusahaan dan posisi, bukan template pasaran.',
    45000, '["id","en"]'::jsonb, true, 30
  ),
  (
    'cover-letter', 'cover-letter', 'Cover Letter',
    'Cover letter bahasa Inggris dengan tone profesional untuk lamaran lokal maupun internasional.',
    55000, '["id","en"]'::jsonb, true, 40
  ),
  (
    'cv-kreatif', 'cv-kreatif', 'CV Kreatif',
    'Layout visual yang menonjol untuk industri kreatif, agensi, startup, dan posisi yang butuh portofolio.',
    100000, '["id","en"]'::jsonb, true, 50
  ),
  (
    'cv-basic', 'cv-basic', 'CV Basic',
    'Pilihan hemat untuk melamar cepat dengan struktur rapi, jelas, dan tetap ramah ATS.',
    45000, '["id","en"]'::jsonb, true, 60
  ),
  (
    'surat-resign', 'surat-resign', 'Surat Pengunduran Diri',
    'Surat resign yang sopan dan profesional, disesuaikan dengan perusahaan serta alasan pengunduran diri.',
    35000, '["id","en"]'::jsonb, true, 70
  ),
  (
    'invoice-berkas', 'invoice-berkas', 'Invoice & Berkas Lain',
    'Desain invoice, paklaring, dan dokumen pendukung lamaran lain yang ingin kamu rapikan.',
    50000, '["id","en"]'::jsonb, true, 80
  )
ON CONFLICT (id) DO NOTHING;
-- #endregion

COMMIT;
