import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://civita.id'),
  title: {
    default: 'CIVITA - Bantu kamu lolos kerja!',
    template: '%s | CIVITA',
  },
  description: 'CIVITA membantu Anda membuat CV, surat lamaran, portfolio, brosur, resi, dan kebutuhan desain lainnya dengan tampilan rapi, profesional, dan siap digunakan.',
  keywords: ['cv kerja', 'surat lamaran', 'resume lamaran', 'portfolio', 'civita', 'cv', 'resi', 'desain cv', 'desain resume', 'jasa buat cv', 'jasa buat resume', 'jasa desain cv', 'bikin cv profesional', 'jasa bikin cv', 'bikin resume profesional', 'jasa bikin resume'],
  authors: [{ name: 'CIVITA' }],
  creator: 'CIVITA',
  publisher: 'CIVITA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://civita.id',
    title: 'CIVITA - Bantu kamu lolos kerja!',
    description: 'CIVITA membantu Anda membuat CV, surat lamaran, portfolio, brosur, resi, dan kebutuhan desain lainnya dengan tampilan rapi, profesional, dan siap digunakan.',
    siteName: 'CIVITA',
    images: [
      {
        url: '/assets/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CIVITA Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIVITA - Bantu kamu lolos kerja!',
    description: 'CIVITA membantu Anda membuat CV, surat lamaran, portfolio, brosur, resi, dan kebutuhan desain lainnya dengan tampilan rapi, profesional, dan siap digunakan.',
    images: ['/assets/og-image.webp'],
    creator: '@bikincivita',
  },
  alternates: {
    canonical: 'https://civita.id',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", inter.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
