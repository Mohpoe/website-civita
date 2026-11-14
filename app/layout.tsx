import { AppClerkProvider } from "@/components/clerk-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { APP_CONFIG } from "@/lib/constants";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${APP_CONFIG.NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "jasa bikin cv",
    "jasa buat cv",
    "jasa desain cv",
    "jasa bikin cv profesional",
    "jasa buat cv profesional",
    "jasa desain cv profesional",
    "jasa bikin curriculum vitae",
    "jasa buat curriculum vitae",
    "jasa desain curriculum vitae",
    "jasa cv murah",
    "desain curriculum vitae",
    "desain cv",
    "cv ats friendly",
    "cv kreatif",
    "cv kerja",
    "surat lamaran",
    "surat lamaran kerja",
    "cover letter",
    "resume lamaran",
    "portfolio profesional",
    "civita",
    "desain resi",
    "jasa desain resi",
    "jasa buat resi",
    "jasa bikin resi",
    "jasa desain brosur",
    "jasa bikin brosur",
    "jasa buat brosur",
    "desain brosur",
    "bikin cv profesional"
  ],
  authors: [{ name: APP_CONFIG.NAME }],
  creator: APP_CONFIG.NAME,
  publisher: APP_CONFIG.NAME,
  applicationName: APP_CONFIG.NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: APP_CONFIG.URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: APP_CONFIG.NAME,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: APP_CONFIG.SOCIAL.TWITTER,
    site: APP_CONFIG.SOCIAL.TWITTER,
    images: [OG_IMAGE.url],
  },
  alternates: {
    canonical: APP_CONFIG.URL,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "ybO7cOgjxOwANLDR0eVEhyW2c8w4Dq4WF3FKn3EKjg4",
    other: {
      'msvalidate.01': ['CDDE2B01EA602551E1D0F695AA83222B'],
    },
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Skema JSON-LD untuk badan usaha. `@id` dipakai ulang oleh schema lain
  // (mis. WebSite di homepage) supaya crawler mengenali entitas yang sama.
  const organizationId = `${APP_CONFIG.URL}/#organization`;
  const logoUrl = `${APP_CONFIG.URL}/android-chrome-512x512.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    "name": APP_CONFIG.NAME,
    "alternateName": APP_CONFIG.ALTERNATE_NAMES,
    "url": APP_CONFIG.URL,
    "logo": {
      "@type": "ImageObject",
      "url": logoUrl,
      "width": 512,
      "height": 512,
    },
    "image": logoUrl,
    "description":
      "Jasa pembuatan CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio profesional.",
    "email": APP_CONFIG.EMAIL,
    "telephone": `+${APP_CONFIG.WHATSAPP}`,
    "sameAs": [
      APP_CONFIG.SOCIAL.INSTAGRAM,
      APP_CONFIG.SOCIAL.LINKEDIN,
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": `+${APP_CONFIG.WHATSAPP}`,
        "contactType": "customer service",
        "email": APP_CONFIG.EMAIL,
        "areaServed": "ID",
        "availableLanguage": ["id"],
      },
    ],
  };

  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppClerkProvider>
            {children}
            <Toaster />
          </AppClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
