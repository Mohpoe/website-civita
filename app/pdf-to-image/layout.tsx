import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "PDF ke Gambar — Konversi ke JPG & PNG",
  description:
    "Ubah setiap halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi. Praktis untuk lampiran lamaran, portofolio, atau unggahan media sosial.",
  path: ROUTES.PDF_TOOLS.PDF_TO_IMAGE,
  ogTitle: "PDF ke Gambar | CIVITA",
  ogDescription: "Konversi halaman PDF menjadi JPG atau PNG dengan kualitas tinggi.",
});

export default function PdfToImageLayout({ children }: { children: ReactNode }) {
  return children;
}
