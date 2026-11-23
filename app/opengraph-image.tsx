import { APP_CONFIG } from "@/lib/constants";
import {
  OG_CONTENT_TYPE,
  OG_COLORS,
  OG_SIZE,
  OgTemplate,
  getOgFonts,
} from "@/lib/og";
import { ImageResponse } from "next/og";

export const alt = `${APP_CONFIG.NAME} - Jasa Pembuatan CV, Portfolio & Desain Karir`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await getOgFonts();

  return new ImageResponse(
    (
      <OgTemplate
        eyebrow="Jasa CV & Portfolio"
        title="Berkas lamaran rapi, siap dikirim."
        description="CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio profesional. Dikerjakan custom sesuai pengalamanmu, tersedia dalam bahasa Indonesia dan Inggris."
        chips={[
          { label: "CV ATS-friendly", background: OG_COLORS.white },
          { label: "CV Kreatif", background: OG_COLORS.butter },
          { label: "Surat Lamaran", background: OG_COLORS.coral },
          { label: "Portfolio", background: OG_COLORS.sage },
        ]}
        accent="coral"
        sticker="Mulai 13K"
        footerLeft={APP_CONFIG.DOMAIN}
        footerRight="Desain rapi • Siap kerja • Bisa revisi"
        badge="ID & EN"
      />
    ),
    { ...size, fonts },
  );
}
