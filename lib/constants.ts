export const APP_CONFIG = {
  NAME: "CIVITA",
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
    PDF_MERGER: "/dashboard/pdf-merger",
    PDF_COMPRESSOR: "/dashboard/pdf-compressor",
  },
};