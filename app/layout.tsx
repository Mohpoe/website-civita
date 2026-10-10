import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { idID } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

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
  metadataBase: new URL("https://www.civita.id"),
  title: {
    default: "CIVITA | Jasa Pembuatan CV, Resume & Portfolio Profesional",
    template: "%s | CIVITA",
  },
  description: "CIVITA adalah jasa pembuatan CV ATS-friendly, CV Kreatif, surat lamaran (cover letter), dan portfolio dengan desain rapi & profesional. Mulai dari 13K, siap bantu kamu lolos kerja!",
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
  authors: [{ name: "CIVITA" }],
  creator: "CIVITA",
  publisher: "CIVITA",
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
    url: "https://www.civita.id",
    title: "CIVITA | Jasa Pembuatan CV & Portfolio Profesional",
    description: "Bantu kamu lolos kerja! Buat CV ATS-friendly, cover letter, dan portfolio dengan tampilan rapi, elegan, dan disukai HRD.",
    siteName: "CIVITA",
    images: [
      {
        // Sesuaikan nama file ini jika Anda menggunakan aset OG image profesional yang dibuat sebelumnya
        url: "/assets/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CIVITA - Jasa Pembuatan CV, Portfolio & Desain Karir",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CIVITA | Jasa Pembuatan CV & Portfolio Profesional",
    description: "Bantu kamu lolos kerja! Buat CV ATS-friendly, cover letter, dan portfolio dengan tampilan rapi, elegan, dan disukai HRD.",
    // Samakan dengan URL gambar di OpenGraph
    images: ["/assets/og-image.webp"],
    creator: "@bikincivita",
  },
  alternates: {
    canonical: "https://www.civita.id",
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
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          localization={idID}
          appearance={{
            variables: {
              fontFamily: "var(--font-geist-mono)",
              colorPrimary: "var(--primary)",
              fontSize: ".9rem",
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
