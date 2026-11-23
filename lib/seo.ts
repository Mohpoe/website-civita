import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

export const SITE_TITLE = `${APP_CONFIG.NAME} | Jasa Bikin CV ATS-Friendly & Portfolio Profesional`;

export const SITE_DESCRIPTION =
  "Jasa pembuatan CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio profesional. Desain rapi, siap kerja, mulai dari 13K.";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Jasa pembuatan CV ATS-friendly, resume, dan surat lamaran profesional",
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  /**
   * Path gambar OG khusus halaman. Dipakai halaman dinamis yang punya
   * `opengraph-image.tsx` sendiri, misalnya detail jasa atau produk.
   */
  ogImage?: string;
  noIndex?: boolean;
};

/**
 * Metadata standar untuk halaman publik.
 *
 * `canonical` dan gambar OG dibuat eksplisit supaya setiap halaman tidak
 * mewarisi canonical homepage dari root layout.
 */
export function createPageMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = path === "/" ? APP_CONFIG.URL : `${APP_CONFIG.URL}${path}`;
  const socialTitle = (ogTitle ?? `${title} | ${APP_CONFIG.NAME}`)
    .replace(/\s+/g, " ")
    .trim();
  const socialDescription = (ogDescription ?? description)
    .replace(/\s+/g, " ")
    .trim();
  const image = ogImage
    ? { url: ogImage, width: 1200, height: 630, alt: socialTitle }
    : OG_IMAGE;
  const imageUrl = ogImage ?? OG_IMAGE.url;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url,
      siteName: APP_CONFIG.NAME,
      title: socialTitle,
      description: socialDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: APP_CONFIG.SOCIAL.TWITTER,
      creator: APP_CONFIG.SOCIAL.TWITTER,
      title: socialTitle,
      description: socialDescription,
      images: [imageUrl],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}
