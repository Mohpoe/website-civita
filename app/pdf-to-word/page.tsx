import type { Metadata } from "next";
import { FileType2Icon } from "lucide-react";
import PdfToWordTool from "@/components/pdf-to-word-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
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
    <div className="font-mono text-foreground antialiased min-h-screen bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `,
        }}
      />
      <PublicNavigation />
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red text-white border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px] shadow-foreground">
              <FileType2Icon className="w-4 h-4" />
              PDF to Word
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Konversi PDF ke Word
            </h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Ubah PDF menjadi dokumen Word yang bisa diedit. Tata letak, tabel,
              dan gambar dipertahankan sebisa mungkin.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
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
      <PublicFooter />
    </div>
  );
}
