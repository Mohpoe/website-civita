import type { LucideIcon } from "lucide-react";
import { FileDown, FileImage, FileText, FileType2, Images, Scissors } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export type PdfTool = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "red" | "orange";
};

export const PDF_TOOLS: PdfTool[] = [
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    shortName: "Gambar ke PDF",
    description: "Ubah foto atau scan dokumen pendukung (KTP, ijazah, sertifikat) menjadi berkas PDF yang rapi.",
    href: ROUTES.PDF_TOOLS.IMAGE_TO_PDF,
    icon: Images,
    accent: "orange",
  },
  {
    id: "pdf-merger",
    name: "PDF Merger",
    shortName: "Gabung PDF",
    description: "Satukan CV, surat lamaran, dan lampiran ke dalam satu berkas PDF siap kirim.",
    href: ROUTES.PDF_TOOLS.PDF_MERGER,
    icon: FileText,
    accent: "red",
  },
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    shortName: "Pisah PDF",
    description: "Ambil halaman tertentu dari dokumen, seperti ijazah atau transkrip, sesuai kebutuhan lamaran.",
    href: ROUTES.PDF_TOOLS.PDF_SPLITTER,
    icon: Scissors,
    accent: "orange",
  },
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    shortName: "Kompres PDF",
    description: "Kecilkan ukuran PDF agar memenuhi batas unggah portal rekrutmen tanpa perlu aplikasi tambahan.",
    href: ROUTES.PDF_TOOLS.PDF_COMPRESSOR,
    icon: FileDown,
    accent: "red",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    shortName: "PDF ke Gambar",
    description: "Konversi halaman PDF menjadi gambar JPG atau PNG saat format gambar diperlukan.",
    href: ROUTES.PDF_TOOLS.PDF_TO_IMAGE,
    icon: FileImage,
    accent: "orange",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    shortName: "PDF ke Word",
    description: "Ubah PDF menjadi dokumen Word yang bisa diedit, cocok untuk CV dan surat lamaran.",
    href: ROUTES.PDF_TOOLS.PDF_TO_WORD,
    icon: FileType2,
    accent: "red",
  },
];
