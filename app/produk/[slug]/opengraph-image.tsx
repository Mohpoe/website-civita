import {
  OG_CONTENT_TYPE,
  OG_COLORS,
  OG_SIZE,
  OgTemplate,
  getOgFonts,
  truncate,
} from "@/lib/og";
import { getProductBySlug } from "@/lib/products";
import { formatRupiah } from "@/lib/utils";
import { ImageResponse } from "next/og";

export const alt = "Produk digital CIVITA";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Gambar pratinjau saat tautan produk digital dibagikan. */
export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const fonts = await getOgFonts();

  const chips = [
    {
      label: product?.category?.name ?? "Produk digital",
      background: OG_COLORS.white,
    },
    { label: product?.file_format || "Format siap pakai", background: OG_COLORS.sky },
    { label: "Beli sekali, pakai berkali-kali", background: OG_COLORS.lilac },
  ];

  return new ImageResponse(
    (
      <OgTemplate
        eyebrow="Produk Digital"
        title={product?.title ?? "Template CV & resume siap pakai"}
        description={truncate(
          product?.short_desc ||
            product?.long_desc ||
            "Template digital siap pakai untuk kebutuhan lamaran kerja.",
          170,
        )}
        chips={chips}
        accent="sky"
        sticker={product ? formatRupiah(product.price) : "Harga terjangkau"}
        footerLeft="Unduh langsung setelah pembayaran"
        footerRight="Template CV • Resume • Portfolio"
        badge="Template"
      />
    ),
    { ...size, fonts },
  );
}
