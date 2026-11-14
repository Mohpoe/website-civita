import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gabung PDF Online — Satukan Beberapa File",
  description:
    "Gabungkan CV, surat lamaran, dan lampiran menjadi satu file PDF siap kirim. Atur urutan dokumen dengan mudah, langsung di perangkat Anda.",
  path: ROUTES.PDF_TOOLS.PDF_MERGER,
  ogTitle: "Gabung PDF Online | CIVITA",
  ogDescription: "Satukan beberapa file PDF jadi satu dokumen rapi dalam hitungan detik.",
});

export default function PdfMergerLayout({ children }: { children: ReactNode }) {
  return children;
}
