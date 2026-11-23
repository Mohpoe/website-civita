import { idID } from "@clerk/localizations";
import type { ClerkAppearanceTheme } from "@clerk/nextjs/types";
import { neobrutalism } from "@clerk/ui/themes";
import { APP_CONFIG, ROUTES } from "@/lib/constants";

/**
 * Beberapa placeholder formulir belum diterjemahkan oleh locale `idID`
 * bawaan Clerk, sehingga jatuh kembali ke bahasa Inggris.
 * Tambalan ini melengkapi string yang paling sering terlihat pada alur auth.
 */
export const civitaLocalization = {
  ...idID,
  formFieldInputPlaceholder__emailAddress: "Masukkan alamat email",
  formFieldInputPlaceholder__emailAddress_username: "Masukkan email atau nama pengguna",
  formFieldInputPlaceholder__firstName: "Masukkan nama depan",
  formFieldInputPlaceholder__lastName: "Masukkan nama belakang",
  formFieldInputPlaceholder__password: "Masukkan kata sandi",
  formFieldInputPlaceholder__phoneNumber: "Masukkan nomor telepon",
  formFieldInputPlaceholder__signUpPassword: "Buat kata sandi",
  formFieldInputPlaceholder__username: "Masukkan nama pengguna",
};

const ink = "var(--ink)";
const inkSoft = "var(--ink-soft)";
const paper = "var(--paper)";
const paper2 = "var(--paper-2)";
const coral = "var(--coral)";
const coralDeep = "var(--coral-deep)";
const onAccent = "var(--on-accent)";
const borderSoft = "color-mix(in oklab, var(--ink) 40%, transparent)";
const line = "color-mix(in oklab, var(--ink) 15%, transparent)";
const ring = "color-mix(in oklab, var(--ink) 20%, transparent)";
const backdrop = "color-mix(in srgb, #000 55%, transparent)";

/**
 * Tombol neo-brutalis yang sama dengan `.nb-sm nb-press` di landing page:
 * border 2px, bayangan keras 2px, lalu "tertekan" saat hover/aktif.
 */
const pressable = {
  border: `2px solid ${ink} !important`,
  borderRadius: "0.375rem",
  boxShadow: `2px 2px 0 0 ${ink} !important`,
  fontWeight: 700,
  transition:
    "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
  "&:hover": {
    boxShadow: "none !important",
    transform: "translate(1px, 1px)",
  },
  "&:active": {
    boxShadow: "none !important",
    transform: "translate(1px, 1px)",
  },
} as const;

/**
 * Input mengikuti `components/ui/input.tsx`: border 2px, tanpa bayangan,
 * dan ring tipis saat fokus.
 */
const inputBase = {
  backgroundColor: paper,
  border: `2px solid ${borderSoft} !important`,
  borderRadius: "0.375rem",
  color: ink,
  fontWeight: 500,
  minHeight: "2.75rem",
  padding: "0.625rem 0.875rem",
  boxShadow: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  "&::placeholder": {
    color: inkSoft,
    opacity: 1,
  },
  "&:hover": {
    border: `2px solid ${borderSoft} !important`,
  },
  "&:focus": {
    border: `2px solid ${ink} !important`,
    boxShadow: `0 0 0 2px ${ring} !important`,
    outline: "none",
  },
} as const;

/**
 * Tampilan Clerk mengikuti bahasa desain neo-brutalis landing page CIVITA.
 *
 * Tema `neobrutalism` bawaan Clerk dipakai sebagai fondasi, lalu variabel dan
 * elemen ditimpa dengan token situs (`paper`, `ink`, `coral`, dst.) supaya
 * modal masuk/daftar, popover UserButton, dan Setelan Akun menyatu dengan
 * halaman lain. Karena semua warna memakai CSS variable, mode terang/gelap
 * ikut otomatis tanpa perlu render ulang provider.
 */
export const civitaClerkAppearance: ClerkAppearanceTheme = {
  theme: neobrutalism,
  options: {
    logoImageUrl: APP_CONFIG.ASSETS.LOGO,
    logoPlacement: "inside",
    logoLinkUrl: APP_CONFIG.LINKS.HOMEPAGE,
    socialButtonsVariant: "blockButton",
    termsPageUrl: ROUTES.TERMS,
    privacyPageUrl: ROUTES.POLICY,
  },
  variables: {
    fontFamily: "var(--font-geist-mono)",
    fontFamilyButtons: "var(--font-geist-mono)",
    fontFamilyMono: "var(--font-geist-mono)",
    fontSize: "0.9rem",
    borderRadius: "0.375rem",
    spacing: "1rem",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    colorPrimary: coral,
    colorPrimaryForeground: onAccent,
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    colorNeutral: ink,
    colorForeground: ink,
    colorMuted: paper2,
    colorMutedForeground: inkSoft,
    colorBackground: paper,
    colorInput: paper,
    colorInputForeground: ink,
    colorRing: "var(--ring)",
    colorShadow: ink,
    // Banner "Development mode" bawaan Clerk memakai shimmer putih; samakan
    // dengan tinta agar tidak belang saat tema gelap.
    colorShimmer: "color-mix(in oklab, var(--ink) 18%, transparent)",
    colorBorder: borderSoft,
    colorModalBackdrop: backdrop,
  },
  elements: {
    /* Kartu & modal */
    modalBackdrop: {
      // Samakan dengan Dialog Shadcn situs ini: lapisan hitam 10% + blur.
      backgroundColor: "color-mix(in srgb, #000 10%, transparent)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
    },
    modalContent: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
    },
    modalCloseButton: {
      backgroundColor: "transparent",
      border: "2px solid transparent",
      borderRadius: "calc(var(--radius) * 0.8)",
      boxShadow: "none",
      color: ink,
      width: "1.75rem",
      height: "1.75rem",
      padding: 0,
      "&:hover": {
        backgroundColor: paper2,
        boxShadow: "none",
        color: ink,
      },
      "&:active": {
        boxShadow: "none",
        transform: "none",
      },
    },
    cardBox: {
      backgroundColor: paper,
      // Dialog Shadcn memakai ring 1px, bukan border tebal + hard shadow.
      border: "none !important",
      borderRadius: "calc(var(--radius) * 1.4)",
      boxShadow: `0 0 0 1px color-mix(in oklab, var(--ink) 10%, transparent) !important`,
      // UserProfile memakai tinggi tetap 44rem dari Clerk; batasi agar kartu
      // tidak meluber ke bawah dan tetap punya jarak simetris di viewport pendek.
      maxHeight: "100%",
      overflow: "hidden",
    },
    card: {
      backgroundColor: paper,
      border: "none",
      boxShadow: "none",
      borderRadius: 0,
      padding: "2rem 1.75rem 1.75rem",
    },

    /* Header */
    logoBox: {
      marginBottom: "0.25rem",
    },
    logoImage: {
      width: "56px",
      height: "56px",
    },
    headerTitle: {
      color: ink,
      fontSize: "1.45rem",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      lineHeight: 1.2,
    },
    headerSubtitle: {
      color: inkSoft,
      fontWeight: 500,
      lineHeight: 1.55,
    },
    headerBackLink: {
      color: ink,
      fontWeight: 700,
      textDecoration: "underline",
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
    },
    backLink: {
      color: ink,
      fontWeight: 700,
      textDecoration: "underline",
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
      "&:hover": {
        color: coralDeep,
      },
    },

    /* Tombol & divider */
    formButtonPrimary: {
      ...pressable,
      backgroundColor: coral,
      color: onAccent,
      minHeight: "2.75rem",
      "&:hover": {
        ...pressable["&:hover"],
        backgroundColor: coral,
      },
      "&:active": {
        ...pressable["&:active"],
        backgroundColor: coral,
      },
    },
    formButtonReset: {
      color: ink,
      fontWeight: 700,
      "&:hover": {
        color: coralDeep,
      },
    },
    socialButtonsBlockButton: {
      ...pressable,
      backgroundColor: paper,
      color: ink,
      minHeight: "2.75rem",
      "&:hover": {
        ...pressable["&:hover"],
        backgroundColor: paper2,
      },
    },
    socialButtonsIconButton: {
      ...pressable,
      backgroundColor: paper,
      color: ink,
      "&:hover": {
        ...pressable["&:hover"],
        backgroundColor: paper2,
      },
    },
    socialButtonsBlockButtonText: {
      color: ink,
      fontWeight: 700,
    },
    alternativeMethodsBlockButton: {
      ...pressable,
      backgroundColor: paper,
      color: ink,
    },
    dividerLine: {
      backgroundColor: line,
      height: "2px",
    },
    dividerText: {
      color: inkSoft,
      backgroundColor: paper,
      fontWeight: 700,
      padding: "0 0.75rem",
    },

    /* Form */
    formFieldLabel: {
      color: ink,
      fontWeight: 700,
      marginBottom: "0.375rem",
    },
    formFieldInput: inputBase,
    formFieldInputGroup: {
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    formFieldInputShowPasswordButton: {
      color: inkSoft,
      "&:hover": {
        color: ink,
      },
    },
    formFieldAction: {
      color: ink,
      fontWeight: 700,
    },
    formFieldErrorText: {
      color: "var(--destructive)",
      fontWeight: 600,
    },
    formFieldWarningText: {
      color: "var(--warning)",
      fontWeight: 600,
    },
    formFieldSuccessText: {
      color: "var(--success)",
      fontWeight: 600,
    },
    formFieldInfoText: {
      color: inkSoft,
    },
    formFieldHintText: {
      color: inkSoft,
    },
    formResendCodeLink: {
      color: ink,
      fontWeight: 700,
    },
    otpCodeFieldInput: {
      ...inputBase,
      padding: 0,
      textAlign: "center",
      fontWeight: 600,
    },
    otpCodeFieldInputs: {
      gap: "0.5rem",
    },

    /* Verifikasi & preview identitas */
    identityPreview: {
      backgroundColor: paper2,
      border: `2px solid ${line}`,
      borderRadius: "0.375rem",
    },
    identityPreviewText: {
      color: ink,
      fontWeight: 600,
    },
    identityPreviewEditButton: {
      color: ink,
      fontWeight: 700,
    },
    alert: {
      backgroundColor: `color-mix(in oklab, ${coral} 20%, ${paper})`,
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
      color: ink,
    },
    alertText: {
      color: ink,
    },

    /* Footer */
    footer: {
      // Footer Dialog Shadcn: garis 1px + latar muted 50%.
      backgroundColor: "color-mix(in oklab, var(--paper-2) 50%, var(--paper))",
      borderTop: `1px solid var(--border)`,
      padding: "1rem",
      "& div": {
        color: ink,
      },
    },
    footerActionText: {
      color: inkSoft,
      fontWeight: 500,
    },
    footerActionLink: {
      color: ink,
      fontWeight: 900,
      textDecoration: "none",
      borderBottom: `2px solid ${ink}`,
      paddingBottom: "1px",
      "&:hover": {
        color: coralDeep,
        borderBottomColor: coralDeep,
      },
    },
    footerPages: {
      gap: "0.75rem",
    },
    footerPagesLink: {
      color: inkSoft,
      fontWeight: 600,
      "&:hover": {
        color: ink,
      },
    },
    badge: {
      backgroundColor: "var(--butter)",
      border: `2px solid ${ink}`,
      borderRadius: "9999px",
      // Container badge dari Clerk memakai `overflow: hidden` setinggi badge,
      // jadi hard shadow ikut terpotong di sisi bawah.
      color: onAccent,
      fontWeight: 800,
    },

    /* User Profile & UserButton */
    page: {
      backgroundColor: paper,
    },
    pageScrollBox: {
      backgroundColor: paper,
    },
    scrollBox: {
      backgroundColor: paper,
    },
    navbar: {
      backgroundColor: paper2,
      borderRight: `2px solid ${ink}`,
      // Clerk menarik navbar 8px ke kanan sehingga sudut panel konten
      // menimpa garis pemisah. Hilangkan overlap agar garisnya lurus.
      marginInlineEnd: 0,
      padding: "0.75rem",
    },
    navbarButton: {
      color: ink,
      fontWeight: 700,
      borderRadius: "0.375rem",
      // Container navbar hanya memberi gap 2px; shadow 3px tiap tombol membuat
      // menu Profil/Keamanan terlihat menempel.
      marginBottom: "0.375rem",
      "&:hover": {
        backgroundColor: paper,
      },
    },
    navbarButtonText: {
      color: ink,
    },
    navbarButtonIcon: {
      color: ink,
    },
    profileSection: {
      borderColor: line,
    },
    profileSectionItemList: {
      borderColor: line,
    },
    profileSectionItem: {
      borderColor: line,
      color: ink,
    },
    profileSectionTitleText: {
      color: ink,
      fontWeight: 900,
    },
    profileSectionSubtitleText: {
      color: inkSoft,
    },
    profileSectionPrimaryButton: {
      ...pressable,
      backgroundColor: coral,
      color: onAccent,
      paddingInline: "1rem",
      // Clerk mengubah warna teks menjadi coral muda saat hover, sehingga
      // nyaris tak terbaca di atas latar coral. Kunci warnanya.
      "&:hover": {
        ...pressable["&:hover"],
        backgroundColor: coral,
        color: onAccent,
      },
      "&:active": {
        ...pressable["&:active"],
        backgroundColor: coral,
        color: onAccent,
      },
    },
    actionCard: {
      backgroundColor: paper,
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
      boxShadow: `2px 2px 0 0 ${ink}`,
    },
    avatarBox: {
      border: `2px solid ${ink}`,
      boxShadow: `2px 2px 0 0 ${ink}`,
    },
    avatarImage: {
      borderRadius: "9999px",
    },
    userButtonAvatarBox: {
      border: `2px solid ${ink}`,
    },
    userButtonPopoverCard: {
      backgroundColor: paper,
      border: `2px solid ${ink} !important`,
      borderRadius: "0.5rem",
      boxShadow: `3px 3px 0 0 ${ink} !important`,
    },
    userButtonPopoverActionButton: {
      fontWeight: 600,
      borderRadius: "0.375rem",
      "&:hover": {
        backgroundColor: paper2,
      },
    },
    userButtonPopoverFooter: {
      backgroundColor: paper2,
      borderTop: `2px solid ${ink}`,
    },
    userButtonPopoverFooterPagesLink: {
      color: inkSoft,
      fontWeight: 600,
      "&:hover": {
        color: ink,
      },
    },
    menuButton: {
      backgroundColor: paper,
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
      boxShadow: `2px 2px 0 0 ${ink}`,
      // Tombol seperti "Connect account" mewarisi colorPrimary sebagai warna
      // teks; coral di atas paper terlalu pudar.
      color: ink,
      "&:hover": {
        backgroundColor: paper2,
        color: ink,
      },
      "&:active": {
        color: ink,
      },
    },
    menuList: {
      backgroundColor: paper,
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
      boxShadow: `3px 3px 0 0 ${ink}`,
    },
    selectButton: {
      backgroundColor: paper,
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
      boxShadow: `2px 2px 0 0 ${ink}`,
    },
    table: {
      border: `2px solid ${ink}`,
      borderRadius: "0.375rem",
    },
    tableHead: {
      color: ink,
    },
    drawerBackdrop: {
      backgroundColor: backdrop,
    },
    drawerContent: {
      backgroundColor: paper,
      borderTop: `2px solid ${ink}`,
    },
  },
};
