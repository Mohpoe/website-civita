export const APP_CONFIG = {
  NAME: "CIVITA",
  TAGLINE: "Bantu kamu lolos kerja!",
  VERSION: "1.2",
  SUPPORT_EMAIL: "civitakerja@gmail.com",
  WHATSAPP: "6282312945365",
  LINKS: {
    HOMEPAGE: "https://civita.id",
    HOMEPAGE_PLAIN: "civita.id",
    WHATSAPP: "https://wa.me/6282312945365",
    INSTAGRAM: "https://www.instagram.com/bikincivita/",
    LINKEDIN: "https://www.linkedin.com/company/bikin-civita/",
    EMAIL: "mailto:civitakerja@gmail.com",
    EMAIL_LOGO: "https://mohpoe.github.io/pundiku_logo_white.png",
  },
};

export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  TERMS: "/terms-of-service",
  POLICY: "/privacy-policy",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  FORGOT_PASSWORD: "/auth/classic-mistake",
  VERIFY: "/auth/verify",
  AUTH: {
    HOME: "/auth",
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/classic-mistake",
    VERIFY: "/auth/verify",
  },
  DASHBOARD: {
    HOME: "/dashboard",
    PROFILE: "/dashboard/profile",
    ACCOUNTS: "/dashboard/accounts",
    TRANSACTIONS: "/dashboard/transactions",
    WISHLIST: "/dashboard/wishlist",
    CATEGORIES: "/dashboard/categories",
    ALLOCATIONS: "/dashboard/allocations",
    REPORTS: "/dashboard/reports",
    HELP: "/dashboard/help",

    // old version
    // REKENING: "/dashboard/rekening",
    // TAMBAH_TRANSAKSI: "/dashboard/tambah-transaksi",
    // USERS: "/dashboard/users",
    // PRODUCTS: "/dashboard/products",
    // UI: "/dashboard/ui",
    // PRELINE: "/dashboard/preline",
  },
  API: {
    VERIFY_NEW_USER: "/api/verify-new-user",
    VERIFY_EDIT_EMAIL: "/api/verify-edit-email",
    // RESET_PASSWORD: "/api/verify-reset-password",
  },
  EXTERNAL: {
    MOHPOE: "https://www.mohpoe.com",
    INSTAGRAM: "https://www.instagram.com/mohpoe"
  },
};