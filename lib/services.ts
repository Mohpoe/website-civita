import type { LucideIcon } from "lucide-react";
import {
  FileCheck2,
  FileText,
  LogOut,
  Mail,
  Palette,
  PenLine,
  ReceiptText,
  ScrollText,
} from "lucide-react";

export type ServiceAccent = "coral" | "sage" | "butter" | "sky" | "lilac";

export interface ServiceHighlight {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: ServiceAccent;
  tags: string[];
}

/**
 * Katalog layanan jasa yang tampil di landing page.
 *
 * Untuk sementara ditulis di sini. Saat modul pemesanan jasa dibuat, daftar ini
 * akan diganti data dari tabel `services` tanpa mengubah tampilan kartunya.
 */
export const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  {
    id: "cv-ats",
    title: "CV ATS Friendly",
    description:
      "Format satu kolom tanpa tabel dan grafik, mudah dibaca sistem ATS dan tetap enak dilihat recruiter.",
    icon: FileCheck2,
    accent: "coral",
    tags: ["ID & EN", "ATS"],
  },
  {
    id: "resume-ats",
    title: "Resume ATS Friendly",
    description:
      "Versi ringkas yang menonjolkan pencapaian dan skill paling relevan dengan posisi yang dilamar.",
    icon: ScrollText,
    accent: "sage",
    tags: ["ID & EN", "1 halaman"],
  },
  {
    id: "surat-lamaran",
    title: "Surat Lamaran",
    description:
      "Surat lamaran formal yang disesuaikan dengan perusahaan dan posisi, bukan template pasaran.",
    icon: Mail,
    accent: "butter",
    tags: ["Custom", "Formal"],
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    description:
      "Cover letter bahasa Inggris dengan tone profesional untuk lamaran lokal maupun internasional.",
    icon: PenLine,
    accent: "sky",
    tags: ["English", "Profesional"],
  },
  {
    id: "cv-kreatif",
    title: "CV Kreatif",
    description:
      "Layout visual yang menonjol untuk industri kreatif, agensi, startup, dan posisi yang butuh portofolio.",
    icon: Palette,
    accent: "lilac",
    tags: ["Visual", "Portofolio"],
  },
  {
    id: "cv-basic",
    title: "CV Basic",
    description:
      "Pilihan hemat untuk melamar cepat dengan struktur rapi, jelas, dan tetap ramah ATS.",
    icon: FileText,
    accent: "butter",
    tags: ["Hemat", "Rapi"],
  },
  {
    id: "surat-resign",
    title: "Surat Pengunduran Diri",
    description:
      "Surat resign yang sopan dan profesional, disesuaikan dengan perusahaan serta alasan pengunduran diri.",
    icon: LogOut,
    accent: "sage",
    tags: ["Resign", "Formal"],
  },
  {
    id: "invoice-berkas",
    title: "Invoice & Berkas Lain",
    description:
      "Desain invoice, paklaring, dan dokumen pendukung lamaran lain yang ingin kamu rapikan.",
    icon: ReceiptText,
    accent: "coral",
    tags: ["Desain", "Pendukung"],
  },
];

const VISUALS = new Map(SERVICE_HIGHLIGHTS.map((item) => [item.id, item]));

/**
 * Ikon dan warna tidak disimpan di database (kolomnya hanya teks dan angka),
 * jadi tampilan dicocokkan lewat id/slug layanan. Layanan baru buatan
 * superadmin tetap tampil dengan ikon bawaan.
 */
export function getServiceVisual(id: string): ServiceHighlight | undefined {
  return VISUALS.get(id);
}
