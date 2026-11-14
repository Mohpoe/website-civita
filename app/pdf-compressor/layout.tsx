import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kompres PDF Online — Perkecil Ukuran File",
  description:
    "Perkecil ukuran file PDF agar lolos batas unggah portal rekrutmen. Gratis, tanpa aplikasi tambahan, dan diproses langsung di perangkat Anda.",
  path: ROUTES.PDF_TOOLS.PDF_COMPRESSOR,
  ogTitle: "Kompres PDF Online | CIVITA",
  ogDescription: "Kecilkan ukuran PDF dengan cepat tanpa mengunggah file ke server.",
});

export default function PdfCompressorLayout({ children }: { children: ReactNode }) {
  return children;
}
