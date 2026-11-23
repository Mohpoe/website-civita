import {
  OG_CONTENT_TYPE,
  OG_COLORS,
  OG_SIZE,
  OgTemplate,
  getOgFonts,
  truncate,
} from "@/lib/og";
import { getServiceBySlug } from "@/lib/service-catalog";
import { formatRupiah } from "@/lib/utils";
import { ImageResponse } from "next/og";

export const alt = "Layanan jasa bikin berkas lamaran CIVITA";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Gambar pratinjau saat tautan layanan dibagikan. */
export default async function ServiceOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const fonts = await getOgFonts();

  const languages = service?.languages.map((code) => code.toUpperCase()) ?? [
    "ID",
    "EN",
  ];

  return new ImageResponse(
    (
      <OgTemplate
        eyebrow="Layanan Jasa"
        title={service?.name ?? "Jasa bikin berkas lamaran"}
        description={truncate(
          service?.description ?? "Dikerjakan custom sesuai pengalamanmu.",
          170,
        )}
        chips={[
          ...languages.map((code) => ({
            label: code === "ID" ? "Bahasa Indonesia" : code === "EN" ? "English" : code,
            background: OG_COLORS.white,
          })),
          { label: "Bisa revisi", background: OG_COLORS.sage },
          { label: "Format PDF", background: OG_COLORS.butter },
        ]}
        accent="butter"
        sticker={service ? formatRupiah(service.price) : "Harga terjangkau"}
        footerLeft="Pesan langsung di civita.id"
        footerRight="Dikerjakan 1–3 hari kerja"
        badge="Jasa"
      />
    ),
    { ...size, fonts },
  );
}
