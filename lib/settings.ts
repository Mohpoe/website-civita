import { unstable_cache } from "next/cache";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site-config";
import { sql } from "@/lib/utils";

/** Tag revalidasi; dipakai server action setelah superadmin menyimpan. */
export const SITE_SETTINGS_TAG = "site-settings";

export interface SiteSettingsRow {
  brand_name: string | null;
  tagline: string | null;
  description: string | null;
  email_primary: string | null;
  email_support: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  logo_url: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  consult_message: string | null;
}

function pick(value: string | null | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

/**
 * Gabungkan baris database dengan nilai bawaan.
 *
 * Tujuannya supaya kolom yang belum diisi (atau tabel yang belum ada) tidak
 * membuat situs kehilangan nama brand, email, dan nomor WhatsApp.
 */
export function normalizeSiteSettings(
  row?: Partial<SiteSettingsRow> | null,
): SiteSettings {
  const fallback = DEFAULT_SITE_SETTINGS;

  if (!row) return fallback;

  const whatsapp = pick(row.whatsapp_number, fallback.whatsappNumber).replace(/\D/g, "");

  return {
    brandName: pick(row.brand_name, fallback.brandName),
    tagline: pick(row.tagline, fallback.tagline),
    description: pick(row.description, fallback.description),
    emailPrimary: pick(row.email_primary, fallback.emailPrimary),
    emailSupport: pick(row.email_support, fallback.emailSupport),
    whatsappNumber: whatsapp || fallback.whatsappNumber,
    instagramUrl: pick(row.instagram_url, fallback.instagramUrl),
    linkedinUrl: pick(row.linkedin_url, fallback.linkedinUrl),
    twitterHandle: pick(row.twitter_handle, fallback.twitterHandle),
    logoUrl: pick(row.logo_url, fallback.logoUrl),
    heroHeadline: pick(row.hero_headline, fallback.heroHeadline),
    heroSubheadline: pick(row.hero_subheadline, fallback.heroSubheadline),
    consultMessage: pick(row.consult_message, fallback.consultMessage),
  };
}

/**
 * Baca pengaturan situs langsung dari database (tanpa cache).
 * Dipakai halaman dashboard supaya superadmin selalu melihat nilai terbaru.
 */
export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = (await sql`
      SELECT
        brand_name, tagline, description,
        email_primary, email_support, whatsapp_number,
        instagram_url, linkedin_url, twitter_handle,
        logo_url, hero_headline, hero_subheadline, consult_message
      FROM site_settings
      WHERE id = 'default'
      LIMIT 1
    `) as SiteSettingsRow[];

    return normalizeSiteSettings(rows[0]);
  } catch (error) {
    console.error("[Settings] gagal membaca site_settings, memakai bawaan:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Baca pengaturan situs (cached).
 *
 * Kalau database sedang tidak bisa dihubungi, nilai bawaan dipakai supaya
 * halaman publik tetap bisa dirender — termasuk saat `next build`.
 */
const loadSiteSettings = unstable_cache(readSiteSettings, ["site-settings"], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 300,
});

export function getSiteSettings(): Promise<SiteSettings> {
  return loadSiteSettings();
}
