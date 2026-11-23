import type { Metadata } from "next";
import { FileType2Icon } from "lucide-react";
import PdfToWordTool from "@/components/pdf-to-word-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "PDF ke Word — Konversi PDF ke DOCX",
  description:
    "Ubah PDF menjadi dokumen Word yang bisa diedit. Cocok untuk CV, surat lamaran, dan dokumen kerja.",
  path: ROUTES.PDF_TOOLS.PDF_TO_WORD,
  ogTitle: "PDF ke Word | CIVITA",
  ogDescription: "Konversi PDF ke Word yang rapi dan bisa diedit.",
});

export default function PdfToWordPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-coral px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <FileType2Icon className="size-4" />
              PDF to Word
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Konversi PDF ke Word
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Ubah PDF menjadi dokumen Word yang bisa diedit. Tata letak, tabel,
              dan gambar dipertahankan sebisa mungkin.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
            <PdfToWordTool />
          </div>
          <PdfToolGuide
            toolName="PDF to Word"
            steps={[
              "Klik area unggah lalu pilih satu file PDF. Maksimal 10 MB dan 20 halaman per konversi.",
              "Selesaikan cek keamanan Cloudflare Turnstile yang muncul di bawah nama file.",
              "Klik tombol konversi dan tunggu proses selesai. Konversi dijalankan di server agar tata letak lebih akurat.",
              "Unduh file Word (.docx) hasil konversi sebelum tautannya kedaluwarsa.",
            ]}
            faqs={[
              {
                question: "Berapa batas ukuran dan jumlah halaman PDF?",
                answer:
                  "Maksimal 10 MB, 20 halaman, dan satu file per konversi. Dokumen yang lebih besar perlu dipecah terlebih dahulu dengan PDF Splitter.",
              },
              {
                question: "Mengapa ada cek keamanan sebelum konversi?",
                answer:
                  "Konversi memakai layanan pihak ketiga yang berbayar per transaksi. Cek keamanan membantu mencegah penyalahgunaan otomatis agar kuota gratis tetap tersedia.",
              },
              {
                question: "Berapa kuota konversi gratis?",
                answer:
                  "Tamu mendapat 1 konversi per hari dengan batas 2 per bulan. Masuk dengan akun CIVITA untuk kuota bulanan yang lebih besar.",
              },
              {
                question: "Apakah file PDF saya disimpan di server?",
                answer:
                  "File sumber dihapus setelah proses konversi selesai. File Word hasil konversi dibersihkan otomatis setelah sekitar 2 jam, jadi unduh segera.",
              },
              {
                question: "Apakah tata letak dokumen tetap sama setelah dikonversi?",
                answer:
                  "Tata letak, tabel, dan gambar dipertahankan sebisa mungkin. Dokumen dengan desain sangat kompleks bisa mengalami pergeseran kecil dan perlu dirapikan manual.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_TO_WORD} />
        </div>
      </main>
    </PublicPageShell>
  );
}
