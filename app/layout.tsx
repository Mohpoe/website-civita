import { AppClerkProvider } from "@/components/clerk-provider";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { APP_CONFIG } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = `${settings.brandName} | Jasa Bikin CV ATS-Friendly & Portfolio Profesional`;
  const siteDescription = settings.description;
  const twitterHandle = settings.twitterHandle || APP_CONFIG.SOCIAL.TWITTER;

  return {
    metadataBase: new URL(APP_CONFIG.URL),
    title: {
      default: siteTitle,
      template: `%s | ${settings.brandName}`,
    },
    description: siteDescription,
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
      settings.brandName.toLowerCase(),
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
    authors: [{ name: settings.brandName }],
    creator: settings.brandName,
    publisher: settings.brandName,
    applicationName: settings.brandName,
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
      title: siteTitle,
      description: siteDescription,
      siteName: settings.brandName,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      creator: twitterHandle,
      site: twitterHandle,
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
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteSettings = await getSiteSettings();

  // Skema JSON-LD untuk badan usaha. `@id` dipakai ulang oleh schema lain
  // (mis. WebSite di homepage) supaya crawler mengenali entitas yang sama.
  const organizationId = `${APP_CONFIG.URL}/#organization`;
  const logoUrl = `${APP_CONFIG.URL}/android-chrome-512x512.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    "name": siteSettings.brandName,
    "alternateName": APP_CONFIG.ALTERNATE_NAMES,
    "url": APP_CONFIG.URL,
    "logo": {
      "@type": "ImageObject",
      "url": logoUrl,
      "width": 512,
      "height": 512,
    },
    "image": logoUrl,
    "description": siteSettings.description,
    "email": siteSettings.emailPrimary,
    "telephone": `+${siteSettings.whatsappNumber}`,
    "sameAs": [siteSettings.instagramUrl, siteSettings.linkedinUrl].filter(Boolean),
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": `+${siteSettings.whatsappNumber}`,
        "contactType": "customer service",
        "email": siteSettings.emailPrimary,
        "areaServed": "ID",
        "availableLanguage": ["id", "en"],
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
          <SiteSettingsProvider settings={siteSettings}>
            <AppClerkProvider>
              {children}
              <Toaster />
            </AppClerkProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
