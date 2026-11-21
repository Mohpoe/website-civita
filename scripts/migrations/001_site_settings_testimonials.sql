-- =============================================================================
-- CIVITA — Migrasi 001: pengaturan situs + testimoni
--
-- Aman dijalankan berulang (idempoten) dan hanya MENAMBAH objek baru.
-- Tidak ada tabel lama yang diubah.
--
-- Cara pakai di branch production:
--   1. Buka Neon Console → branch production → SQL Editor.
--   2. Tempel seluruh isi file ini, lalu Run.
--   3. Ulangi untuk branch development bila belum dijalankan.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- site_settings
-- Satu baris saja (id = 'default'). Nilai yang kosong akan diisi bawaan dari
-- lib/constants.ts oleh aplikasi, jadi tabel ini boleh kosong.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id                text PRIMARY KEY DEFAULT 'default',
  brand_name        text,
  tagline           text,
  description       text,
  email_primary     text,
  email_support     text,
  whatsapp_number   text,
  instagram_url     text,
  linkedin_url      text,
  twitter_handle    text,
  logo_url          text,
  hero_headline     text,
  hero_subheadline  text,
  consult_message   text,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  updated_by        text
);

-- -----------------------------------------------------------------------------
-- testimonials
-- Screenshot chat WhatsApp yang tampil di landing page. Gambar disimpan di
-- PUBLIC_BLOB; kolom image_url menyimpan URL publiknya.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   text NOT NULL,
  alt_text    text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  text
);

CREATE INDEX IF NOT EXISTS testimonials_active_order_idx
  ON testimonials (is_active, sort_order, created_at DESC);
