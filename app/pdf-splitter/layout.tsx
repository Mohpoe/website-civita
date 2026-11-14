import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pisah PDF Online — Ambil Halaman Tertentu",
  description:
    "Pisahkan PDF menjadi file terpisah per halaman atau rentang halaman. Cocok untuk mengambil ijazah dan transkrip dari satu dokumen lamaran.",
  path: ROUTES.PDF_TOOLS.PDF_SPLITTER,
  ogTitle: "Pisah PDF Online | CIVITA",
  ogDescription: "Ambil halaman tertentu dari PDF dengan cepat dan aman.",
});

export default function PdfSplitterLayout({ children }: { children: ReactNode }) {
  return children;
}
