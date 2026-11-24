-- 005_service_visuals.sql
-- Metadata visual layanan: ikon, warna aksen, dan tag.
--
-- Admin boleh mengosongkan ikon/aksen; aplikasi akan memilih fallback
-- deterministik dari hash id/slug. Migrasi ini mengisi nilai awal untuk
-- layanan seed supaya tampilan yang sudah ada tidak berubah.

BEGIN;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS icon   varchar(40),
  ADD COLUMN IF NOT EXISTS accent varchar(16),
  ADD COLUMN IF NOT EXISTS tags   jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE services SET
  icon = COALESCE(icon, 'file-check'),
  accent = COALESCE(accent, 'coral'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["ID & EN", "ATS"]'::jsonb ELSE tags END
WHERE id = 'cv-ats';

UPDATE services SET
  icon = COALESCE(icon, 'scroll-text'),
  accent = COALESCE(accent, 'sage'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["ID & EN", "1 halaman"]'::jsonb ELSE tags END
WHERE id = 'resume-ats';

UPDATE services SET
  icon = COALESCE(icon, 'mail'),
  accent = COALESCE(accent, 'butter'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["Custom", "Formal"]'::jsonb ELSE tags END
WHERE id = 'surat-lamaran';

UPDATE services SET
  icon = COALESCE(icon, 'pen-line'),
  accent = COALESCE(accent, 'sky'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["English", "Profesional"]'::jsonb ELSE tags END
WHERE id = 'cover-letter';

UPDATE services SET
  icon = COALESCE(icon, 'palette'),
  accent = COALESCE(accent, 'lilac'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["Visual", "Portofolio"]'::jsonb ELSE tags END
WHERE id = 'cv-kreatif';

UPDATE services SET
  icon = COALESCE(icon, 'file-text'),
  accent = COALESCE(accent, 'butter'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["Hemat", "Rapi"]'::jsonb ELSE tags END
WHERE id = 'cv-basic';

UPDATE services SET
  icon = COALESCE(icon, 'log-out'),
  accent = COALESCE(accent, 'sage'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["Resign", "Formal"]'::jsonb ELSE tags END
WHERE id = 'surat-resign';

UPDATE services SET
  icon = COALESCE(icon, 'receipt'),
  accent = COALESCE(accent, 'coral'),
  tags = CASE WHEN tags = '[]'::jsonb THEN '["Desain", "Pendukung"]'::jsonb ELSE tags END
WHERE id = 'invoice-berkas';

-- Tag disimpan sebagai array string, maksimal dua.
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_tags_max_two;
ALTER TABLE services ADD CONSTRAINT services_tags_max_two
  CHECK (
    jsonb_typeof(tags) = 'array'
    AND jsonb_array_length(tags) <= 2
  );

COMMIT;
