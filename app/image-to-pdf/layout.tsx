import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gambar ke PDF — Gabungkan JPG & PNG Online",
  description:
    "Gabungkan beberapa foto atau hasil scan (KTP, ijazah, sertifikat) menjadi satu file PDF yang rapi. Gratis dan diproses langsung di perangkat Anda.",
  path: ROUTES.PDF_TOOLS.IMAGE_TO_PDF,
  ogTitle: "Gambar ke PDF | CIVITA",
  ogDescription: "Satukan JPG dan PNG menjadi satu PDF rapi, langsung dari browser.",
});

export default function ImageToPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
