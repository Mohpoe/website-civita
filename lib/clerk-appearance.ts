import { idID } from "@clerk/localizations";
import type { ClerkAppearanceTheme } from "@clerk/nextjs/types";
import { APP_CONFIG, ROUTES } from "@/lib/constants";

const CIVITA_LOGO_URL =
  "https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg";

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

/**
 * Tampilan Clerk mengikuti bahasa desain neo-brutalis landing page CIVITA:
 * border tebal, offset shadow keras, sudut kartu besar, dan tombol pill.
 * Nilai warna memakai CSS variable situs agar otomatis mengikuti mode terang/gelap.
 */
export function getCivitaClerkAppearance(isDark: boolean): ClerkAppearanceTheme {
  const border = "var(--foreground)";
  const background = "var(--background)";
  const muted = "var(--muted)";
  const subtleText = "color-mix(in oklab, var(--foreground) 65%, var(--background))";
  const placeholder = "color-mix(in oklab, var(--foreground) 45%, var(--background))";
  const line = "color-mix(in oklab, var(--foreground) 15%, var(--background))";
  const brandRed = "var(--brand-red)";

  const buttonShadow = `2px 2px 0px 0px ${border}`;

  // Clerk menghasilkan rule varian (mis. `[data-variant="solid"]`) yang lebih
  // spesifik daripada className hasil `appearance.elements`. `!important`
  // diperlukan agar border & offset shadow neo-brutalis tidak ditimpa.
  const pillButton = {
    border: `2px solid ${border} !important`,
    borderRadius: "9999px",
    boxShadow: `${buttonShadow} !important`,
    fontWeight: "800",
    transition: "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
    "&:hover": {
      boxShadow: `4px 4px 0px 0px ${border} !important`,
      transform: "translate(-1px, -1px)",
    },
    "&:active": {
      boxShadow: `1px 1px 0px 0px ${border} !important`,
      transform: "translate(2px, 2px)",
    },
  } as const;

  return {
    options: {
      logoImageUrl: CIVITA_LOGO_URL,
      logoPlacement: "inside",
      logoLinkUrl: APP_CONFIG.LINKS.HOMEPAGE,
      socialButtonsVariant: "blockButton",
      termsPageUrl: ROUTES.TERMS,
      privacyPageUrl: ROUTES.POLICY,
    },
    variables: {
      fontFamily: "var(--font-geist-mono)",
      fontFamilyButtons: "var(--font-geist-mono)",
      fontSize: "0.9rem",
      borderRadius: "0.875rem",
      spacing: "1rem",
      fontWeight: {
        normal: 500,
        medium: 600,
        semibold: 700,
        bold: 800,
      },
      colorPrimary: brandRed,
      colorPrimaryForeground: "#ffffff",
      colorBackground: isDark ? "#252525" : "#ffffff",
      colorForeground: isDark ? "#fafafa" : "#252525",
      colorNeutral: isDark ? "#fafafa" : "#252525",
      colorMuted: isDark ? "#2e2e2e" : "#f4f4f4",
      colorMutedForeground: isDark ? "rgba(250, 250, 250, 0.65)" : "rgba(37, 37, 37, 0.65)",
      colorInput: isDark ? "#252525" : "#ffffff",
      colorInputForeground: isDark ? "#fafafa" : "#252525",
      colorBorder: isDark ? "rgba(250, 250, 250, 0.22)" : "rgba(37, 37, 37, 0.18)",
      colorRing: brandRed,
      colorShadow: isDark ? "#fafafa" : "#000000",
      colorModalBackdrop: isDark ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.45)",
    },
    elements: {
      /* Kartu & modal */
      modalBackdrop: {
        backgroundColor: isDark ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.45)",
      },
      modalContent: {
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
      },
      modalCloseButton: {
        backgroundColor: background,
        border: `2px solid ${border}`,
        borderRadius: "9999px",
        boxShadow: buttonShadow,
        color: "var(--foreground)",
        width: "2rem",
        height: "2rem",
        "&:hover": {
          backgroundColor: muted,
          boxShadow: `3px 3px 0px 0px ${border}`,
        },
        "&:active": {
          boxShadow: "none",
          transform: "translate(2px, 2px)",
        },
      },
      cardBox: {
        backgroundColor: background,
        border: `3px solid ${border}`,
        borderRadius: "2rem",
        boxShadow: `8px 8px 0px 0px ${border}`,
        // UserProfile memakai tinggi tetap 44rem dari Clerk; batasi agar kartu
        // tidak meluber ke bawah dan tetap punya jarak simetris di viewport pendek.
        maxHeight: "100%",
        overflow: "hidden",
      },
      card: {
        backgroundColor: background,
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
        color: "var(--foreground)",
        fontSize: "1.45rem",
        fontWeight: "900",
        letterSpacing: "-0.03em",
        lineHeight: 1.2,
      },
      headerSubtitle: {
        color: subtleText,
        fontWeight: "500",
        lineHeight: 1.55,
      },

      /* Tombol & divider */
      formButtonPrimary: {
        ...pillButton,
        backgroundColor: brandRed,
        color: "#ffffff",
        minHeight: "2.75rem",
        "&:hover": {
          ...pillButton["&:hover"],
          backgroundColor: brandRed,
        },
        "&:active": {
          ...pillButton["&:active"],
          backgroundColor: brandRed,
        },
      },
      socialButtonsBlockButton: {
        ...pillButton,
        backgroundColor: background,
        color: "var(--foreground)",
        minHeight: "2.75rem",
        "&:hover": {
          ...pillButton["&:hover"],
          backgroundColor: muted,
        },
      },
      socialButtonsIconButton: {
        ...pillButton,
        backgroundColor: background,
        color: "var(--foreground)",
        "&:hover": {
          ...pillButton["&:hover"],
          backgroundColor: muted,
        },
      },
      socialButtonsBlockButtonText: {
        color: "var(--foreground)",
        fontWeight: "700",
      },
      alternativeMethodsBlockButton: {
        ...pillButton,
        backgroundColor: background,
        color: "var(--foreground)",
      },
      dividerLine: {
        backgroundColor: line,
        height: "2px",
      },
      dividerText: {
        color: subtleText,
        backgroundColor: background,
        fontWeight: "700",
        padding: "0 0.75rem",
      },

      /* Form */
      formFieldLabel: {
        color: "var(--foreground)",
        fontWeight: "700",
        marginBottom: "0.375rem",
      },
      formFieldInput: {
        backgroundColor: background,
        border: `2px solid ${border} !important`,
        borderRadius: "0.875rem",
        boxShadow: `${buttonShadow} !important`,
        color: "var(--foreground)",
        fontWeight: "500",
        minHeight: "2.75rem",
        padding: "0.625rem 0.875rem",
        transition: "transform 150ms ease, box-shadow 150ms ease",
        "&::placeholder": {
          color: placeholder,
          opacity: 1,
        },
        "&:hover": {
          backgroundColor: background,
        },
        "&:focus": {
          border: `2px solid ${border} !important`,
          boxShadow: `4px 4px 0px 0px ${border} !important`,
          outline: "none",
          transform: "translate(-1px, -1px)",
        },
      },
      formFieldInputGroup: {
        border: "none",
        boxShadow: "none",
        backgroundColor: "transparent",
      },
      formFieldAction: {
        color: "var(--foreground)",
        fontWeight: "700",
      },
      formFieldErrorText: {
        color: "var(--destructive)",
        fontWeight: "600",
      },
      formFieldHintText: {
        color: subtleText,
      },
      formResendCodeLink: {
        color: "var(--foreground)",
        fontWeight: "700",
      },
      otpCodeFieldInput: {
        border: `2px solid ${border} !important`,
        borderRadius: "0.75rem",
        boxShadow: `${buttonShadow} !important`,
      },

      /* Footer */
      footer: {
        backgroundColor: muted,
        borderTop: `2px solid ${border}`,
        padding: "1rem",
      },
      footerActionText: {
        color: subtleText,
        fontWeight: "500",
      },
      footerActionLink: {
        color: "var(--foreground)",
        fontWeight: "900",
        textDecoration: "none",
        borderBottom: `2px solid ${border}`,
        paddingBottom: "1px",
        "&:hover": {
          color: brandRed,
          borderBottomColor: brandRed,
        },
      },
      footerPages: {
        gap: "0.75rem",
      },
      footerPagesLink: {
        color: subtleText,
        fontWeight: "600",
      },
      badge: {
        backgroundColor: "var(--brand-orange)",
        border: `2px solid ${border}`,
        borderRadius: "9999px",
        boxShadow: "1px 1px 0px 0px var(--foreground)",
        color: "#1a1a1a",
        fontWeight: "800",
      },

      /* User Profile & UserButton */
      page: {
        backgroundColor: background,
      },
      pageScrollBox: {
        backgroundColor: background,
      },
      navbar: {
        backgroundColor: muted,
        borderRight: `2px solid ${border}`,
        // Clerk menarik navbar 8px ke kanan sehingga sudut panel konten
        // menimpa garis pemisah. Hilangkan overlap agar garisnya lurus.
        marginInlineEnd: 0,
        padding: "0.75rem",
      },
      navbarButton: {
        color: "var(--foreground)",
        fontWeight: "700",
        borderRadius: "0.75rem",
      },
      profileSectionItem: {
        borderColor: line,
        color: "var(--foreground)",
      },
      profileSectionTitleText: {
        color: "var(--foreground)",
        fontWeight: "900",
      },
      profileSectionSubtitleText: {
        color: subtleText,
      },
      profileSectionPrimaryButton: {
        border: `2px solid ${border} !important`,
        borderRadius: "9999px",
        boxShadow: `${buttonShadow} !important`,
        fontWeight: "800",
        "&:hover": {
          boxShadow: `3px 3px 0px 0px ${border} !important`,
        },
      },
      avatarBox: {
        border: `2px solid ${border}`,
        boxShadow: buttonShadow,
      },
      userButtonAvatarBox: {
        border: `2px solid ${border}`,
      },
      userButtonPopoverCard: {
        backgroundColor: background,
        border: `2px solid ${border}`,
        borderRadius: "1rem",
        boxShadow: `4px 4px 0px 0px ${border}`,
      },
      userButtonPopoverActionButton: {
        fontWeight: "600",
        "&:hover": {
          backgroundColor: muted,
        },
      },
    },
  };
}
