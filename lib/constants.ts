export const APP_CONFIG = {
  NAME: "CIVITA",
  NAME_SECOND: "CIVITA.ID",
  TAGLINE: "Bantu kamu lolos kerja!",
  VERSION: "1.2",
  EMAIL: "admin@civita.id",
  EMAIL_GMAIL: "civitakerja@gmail.com",
  EMAIL_SENDER: "products-delivery-no-reply@civita.id",
  WHATSAPP: "6282312945365",
  LINKS: {
    HOMEPAGE: "https://www.civita.id",
    HOMEPAGE_PLAIN: "www.civita.id",
    WHATSAPP: "https://wa.me/6282312945365",
    WHATSAPP_CHAT: (chat: string) => `https://wa.me/6282312945365?text=${encodeURIComponent(chat)}`,
    INSTAGRAM: "https://www.instagram.com/bikincivita/",
    LINKEDIN: "https://www.linkedin.com/company/bikin-civita/",
    EMAIL: "mailto:admin@civita.id",
    EMAIL_GMAIL: "mailto:civitakerja@gmail.com",
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
