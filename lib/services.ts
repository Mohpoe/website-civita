import type { ServiceAccent, ServiceIconKey } from "@/lib/service-visuals";

export interface ServiceHighlight {
  id: string;
  title: string;
  description: string;
  iconKey: ServiceIconKey;
  accent: ServiceAccent;
  tags: string[];
}

/**
 * Fallback katalog layanan untuk landing page saat tabel `services` masih
 * kosong (mis. sebelum migrasi). Data utama tetap berasal dari database;
 * ikon/aksen/tag di sini hanya dipakai pada kondisi darurat tersebut.
 */
export const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  {
    id: "cv-ats",
    title: "CV ATS Friendly",
    description:
      "Format satu kolom tanpa tabel dan grafik, mudah dibaca sistem ATS dan tetap enak dilihat recruiter.",
    iconKey: "file-check",
    accent: "coral",
    tags: ["ID & EN", "ATS"],
  },
  {
    id: "resume-ats",
    title: "Resume ATS Friendly",
    description:
      "Versi ringkas yang menonjolkan pencapaian dan skill paling relevan dengan posisi yang dilamar.",
    iconKey: "scroll-text",
    accent: "sage",
    tags: ["ID & EN", "1 halaman"],
  },
  {
    id: "surat-lamaran",
    title: "Surat Lamaran",
    description:
      "Surat lamaran formal yang disesuaikan dengan perusahaan dan posisi, bukan template pasaran.",
    iconKey: "mail",
    accent: "butter",
    tags: ["Custom", "Formal"],
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    description:
      "Cover letter bahasa Inggris dengan tone profesional untuk lamaran lokal maupun internasional.",
    iconKey: "pen-line",
    accent: "sky",
    tags: ["English", "Profesional"],
  },
  {
    id: "cv-kreatif",
    title: "CV Kreatif",
    description:
      "Layout visual yang menonjol untuk industri kreatif, agensi, startup, dan posisi yang butuh portofolio.",
    iconKey: "palette",
    accent: "lilac",
    tags: ["Visual", "Portofolio"],
  },
  {
    id: "cv-basic",
    title: "CV Basic",
    description:
      "Pilihan hemat untuk melamar cepat dengan struktur rapi, jelas, dan tetap ramah ATS.",
    iconKey: "file-text",
    accent: "butter",
    tags: ["Hemat", "Rapi"],
  },
  {
    id: "surat-resign",
    title: "Surat Pengunduran Diri",
    description:
      "Surat resign yang sopan dan profesional, disesuaikan dengan perusahaan serta alasan pengunduran diri.",
    iconKey: "log-out",
    accent: "sage",
    tags: ["Resign", "Formal"],
  },
  {
    id: "invoice-berkas",
    title: "Invoice & Berkas Lain",
    description:
      "Desain invoice, paklaring, dan dokumen pendukung lamaran lain yang ingin kamu rapikan.",
    iconKey: "receipt",
    accent: "coral",
    tags: ["Desain", "Pendukung"],
  },
];
