// Nilai dasar ditulis sekali di sini, lalu link/URL lain diturunkan darinya.
const BRAND_NAME = "CIVITA";
const SITE_URL = "https://www.civita.id";
const SITE_URL_NON_WWW = "https://civita.id";
const SITE_DOMAIN = "www.civita.id";
const WHATSAPP_NUMBER = "6282312945365";
const EMAIL_PRIMARY = "admin@civita.id";
const EMAIL_GMAIL = "civitakerja@gmail.com";
const INSTAGRAM_URL = "https://www.instagram.com/bikincivita/";
const LINKEDIN_URL = "https://www.linkedin.com/company/bikin-civita/";
const TWITTER_HANDLE = "@bikincivita";
const ASSET_HOST = "qaupjj2m3j2vqts9.public.blob.vercel-storage.com";
const ASSET_BASE_URL = `https://${ASSET_HOST}/assets`;

export const APP_CONFIG = {
  NAME: BRAND_NAME,
  ALTERNATE_NAMES: ["CIVITA.ID", "Civita"],
  TAGLINE: "Bantu kamu lolos kerja!",
  VERSION: "1.2",
  EMAIL: EMAIL_PRIMARY,
  EMAIL_GMAIL,
  EMAIL_SENDER: "products-delivery-no-reply@civita.id",
  WHATSAPP: WHATSAPP_NUMBER,
  URL: SITE_URL,
  DOMAIN: SITE_DOMAIN,
  CONSULT_MESSAGE: `Halo admin ${BRAND_NAME}, saya ingin konsultasi terkait pembuatan CV yang ATS-friendly.`,
  ASSETS: {
    HOST: ASSET_HOST,
    BASE: ASSET_BASE_URL,
    LOGO: `${ASSET_BASE_URL}/Icon.svg`,
    NO_PROFILE: `${ASSET_BASE_URL}/no-profile.svg`,
  },
  SOCIAL: {
    INSTAGRAM: INSTAGRAM_URL,
    LINKEDIN: LINKEDIN_URL,
    TWITTER: TWITTER_HANDLE,
  },
  LINKS: {
    HOMEPAGE: SITE_URL,
    HOMEPAGE_NON_WWW: SITE_URL_NON_WWW,
    HOMEPAGE_PLAIN: SITE_DOMAIN,
    WHATSAPP: `https://wa.me/${WHATSAPP_NUMBER}`,
    WHATSAPP_CHAT: (chat: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(chat)}`,
    INSTAGRAM: INSTAGRAM_URL,
    LINKEDIN: LINKEDIN_URL,
    EMAIL: `mailto:${EMAIL_PRIMARY}`,
    EMAIL_GMAIL: `mailto:${EMAIL_GMAIL}`,
  },
};

export const ROUTES = {
  ROOT: "/",
  TERMS: "/terms-of-service",
  POLICY: "/privacy-policy",
  DASHBOARD: {
    HOME: "/dashboard",
    INVENTORY: "/dashboard/inventory",
    ADMIN: "/dashboard/admin",
    CATEGORY: "/dashboard/admin/category",
    REPORT: "/dashboard/admin/report",
    USERS: "/dashboard/admin/users",
    HELP: "/dashboard/help",
  },
  PDF_TOOLS: {
    PDF_MERGER: "/pdf-merger",
    PDF_SPLITTER: "/pdf-splitter",
    PDF_COMPRESSOR: "/pdf-compressor",
    PDF_TO_IMAGE: "/pdf-to-image",
    IMAGE_TO_PDF: "/image-to-pdf",
  },
};

/** Menu utama yang dipakai bersama oleh navbar desktop dan drawer mobile. */
export const PUBLIC_NAV_LINKS = [
  { label: "Beranda", href: ROUTES.ROOT },
  { label: "Alat PDF", href: "/#tools" },
] as const;
