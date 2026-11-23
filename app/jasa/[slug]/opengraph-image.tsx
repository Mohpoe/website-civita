import { getServiceBySlug } from "@/lib/service-catalog";
import { formatRupiah } from "@/lib/utils";
import { ImageResponse } from "next/og";

export const alt = "Layanan jasa berkas lamaran CIVITA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Gambar pratinjau saat tautan layanan dibagikan. */
export default async function ServiceOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf7f2",
          color: "#221f1b",
          padding: 64,
          border: "16px solid #221f1b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 16,
              border: "6px solid #221f1b",
              background: "#f2ddb0",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            CV
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 700 }}>CIVITA</span>
            <span style={{ fontSize: 20, color: "#5a534b" }}>Katalog Jasa</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {service?.name ?? "Jasa berkas lamaran"}
          </span>
          <span style={{ fontSize: 26, color: "#5a534b", lineHeight: 1.4 }}>
            {(service?.description ?? "Dikerjakan custom sesuai pengalamanmu.").slice(
              0,
              150,
            )}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "4px solid #221f1b",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 700 }}>
            {service ? formatRupiah(service.price) : "Harga terjangkau"}
          </span>
          <span style={{ fontSize: 22, color: "#5a534b" }}>
            civita.id
          </span>
        </div>
      </div>
    ),
    size,
  );
}
