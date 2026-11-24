import { APP_CONFIG } from "@/lib/constants";

/**
 * Data identitas situs yang boleh diubah superadmin dari dashboard.
 *
 * File ini sengaja tidak mengimpor apa pun dari server (database, `next/cache`)
 * supaya aman dipakai komponen klien. Nilai di sini adalah *bawaan*; nilai
 * sebenarnya dibaca dari tabel `site_settings` oleh `lib/settings.ts`.
 */
export interface SiteSettings {
  brandName: string;
  tagline: string;
  description: string;
  emailPrimary: string;
  emailSupport: string;
  /** Hanya angka, format internasional tanpa "+", mis. 6282312945365. */
  whatsappNumber: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterHandle: string;
  logoUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  /** Pesan yang sudah terisi saat tombol WhatsApp diklik. */
  consultMessage: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: APP_CONFIG.NAME,
  tagline: APP_CONFIG.TAGLINE,
  description:
    "Jasa pembuatan CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio profesional. Desain rapi, siap kerja.",
  emailPrimary: APP_CONFIG.EMAIL,
  emailSupport: APP_CONFIG.EMAIL_GMAIL,
  whatsappNumber: APP_CONFIG.WHATSAPP,
  instagramUrl: APP_CONFIG.SOCIAL.INSTAGRAM,
  linkedinUrl: APP_CONFIG.SOCIAL.LINKEDIN,
  twitterHandle: APP_CONFIG.SOCIAL.TWITTER,
  logoUrl: APP_CONFIG.ASSETS.LOGO,
  heroHeadline: "Jasa Pembuatan CV & Resume ATS-friendly.",
  heroSubheadline:
    "CV ATS-friendly, resume, surat lamaran, dan cover letter yang disusun tenaga profesional — bahasa Indonesia maupun Inggris.",
  consultMessage: APP_CONFIG.CONSULT_MESSAGE,
};

/** Turunan yang aman dikirim ke komponen klien (tanpa fungsi). */
export interface SiteLinks {
  whatsapp: string;
  consult: string;
  email: string;
  emailSupport: string;
  instagram: string;
  linkedin: string;
}

export function getSiteLinks(settings: SiteSettings): SiteLinks {
  const digits = settings.whatsappNumber.replace(/\D/g, "");

  return {
    whatsapp: `https://wa.me/${digits}`,
    consult: `https://wa.me/${digits}?text=${encodeURIComponent(settings.consultMessage)}`,
    email: `mailto:${settings.emailPrimary}`,
    emailSupport: `mailto:${settings.emailSupport}`,
    instagram: settings.instagramUrl,
    linkedin: settings.linkedinUrl,
  };
}

/** Satu kartu screenshot chat WhatsApp di section testimoni. */
export interface Testimonial {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/** Label singkat untuk tombol/atribut tanpa memaksa brand selalu huruf besar. */
export function brandInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return "CV";
  if (clean.length <= 2) return clean.toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}
