import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

export const SITE_TITLE = `${APP_CONFIG.NAME} | Jasa Bikin CV ATS-Friendly & Portfolio Profesional`;

export const SITE_DESCRIPTION =
  "Jasa pembuatan CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio profesional. Desain rapi, siap kerja, mulai dari 13K.";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${APP_CONFIG.NAME} — ${APP_CONFIG.TAGLINE}`,
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
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
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = path === "/" ? APP_CONFIG.URL : `${APP_CONFIG.URL}${path}`;
  const socialTitle = ogTitle ?? `${title} | ${APP_CONFIG.NAME}`;
  const socialDescription = ogDescription ?? description;

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
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: APP_CONFIG.SOCIAL.TWITTER,
      creator: APP_CONFIG.SOCIAL.TWITTER,
      title: socialTitle,
      description: socialDescription,
      images: [OG_IMAGE.url],
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
