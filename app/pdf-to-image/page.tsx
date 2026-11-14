"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfToImage from "@/components/pdf-to-image-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { ROUTES } from "@/lib/constants";
import { FileImageIcon } from "lucide-react";

export default function PdfToImagePage() {
  return (
    <div className="font-mono text-foreground antialiased min-h-screen bg-background">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `
      }} />
      <PublicNavigation />
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px] shadow-foreground">
              <FileImageIcon className="w-4 h-4" />
              PDF to Image
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Konversi PDF ke JPG/PNG</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Ubah setiap halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi. Semua diproses di perangkat Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfToImage />
          </div>
          <PdfToolGuide
            toolName="PDF to Image"
            steps={[
              "Klik area unggah lalu pilih satu file PDF. Ukuran maksimal 100 MB.",
              "Pilih halaman yang ingin diubah: semua halaman, rentang halaman, atau halaman tertentu.",
              "Tentukan format gambar (JPG atau PNG), kualitas JPG, dan skala resolusi 1x sampai 3x.",
              "Klik tombol konversi, lalu unduh gambar satu per satu atau sekaligus dalam file ZIP.",
            ]}
            faqs={[
              {
                question: "Format gambar apa saja yang dihasilkan?",
                answer:
                  "JPG dan PNG. JPG cocok untuk foto dan ukuran file lebih kecil, sedangkan PNG lebih baik untuk teks dan grafik yang butuh ketajaman.",
              },
              {
                question: "Bagaimana cara mendapatkan hasil yang lebih tajam?",
                answer:
                  "Naikkan skala ke 2x atau 3x. Semakin besar skala, semakin tinggi resolusi gambar dan semakin besar pula ukuran filenya.",
              },
              {
                question: "Apakah kualitas JPG bisa diatur?",
                answer:
                  "Bisa. Gunakan slider kualitas JPG. Nilai lebih rendah menghasilkan file lebih kecil, nilai lebih tinggi menjaga detail gambar.",
              },
              {
                question: "Apakah file PDF saya diunggah ke server?",
                answer:
                  "Tidak. Konversi berjalan sepenuhnya di browser, jadi isi dokumen tidak dikirim ke server CIVITA.",
              },
              {
                question: "Bagaimana cara mengunduh semua gambar sekaligus?",
                answer:
                  "Gunakan tombol unduh semua. Semua gambar akan dikemas dalam satu file ZIP.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_TO_IMAGE} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
