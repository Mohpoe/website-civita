"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardImageToPdf from "@/components/image-to-pdf-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { ROUTES } from "@/lib/constants";
import { ImagesIcon } from "lucide-react";

export default function ImageToPdfPage() {
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
              <ImagesIcon className="w-4 h-4" />
              Image to PDF
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Konversi Gambar ke PDF</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Gabungkan beberapa gambar JPG, JPEG, PNG menjadi satu file PDF. Atur urutan sesuai kebutuhan. Semua diproses di perangkat Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardImageToPdf />
          </div>
          <PdfToolGuide
            toolName="Gambar ke PDF"
            steps={[
              "Klik area unggah lalu pilih gambar JPG, JPEG, atau PNG. Kamu bisa menambahkan hingga 20 gambar sekaligus.",
              "Atur urutan gambar dengan tombol naik/turun atau seret, lalu hapus gambar yang tidak diperlukan.",
              "Pilih ukuran halaman: ikuti ukuran asli gambar, atau A4 portrait/landscape.",
              "Klik tombol konversi, lalu unduh file PDF hasilnya.",
            ]}
            faqs={[
              {
                question: "Format gambar apa saja yang didukung?",
                answer:
                  "JPG, JPEG, dan PNG, dengan ukuran maksimal 50 MB per gambar dan maksimal 20 gambar per proses.",
              },
              {
                question: "Apakah gambar saya diunggah ke server?",
                answer:
                  "Tidak. Seluruh proses konversi berjalan di browser Anda, jadi gambar tidak dikirim ke server CIVITA.",
              },
              {
                question: "Bisakah ukuran kertas PDF diatur?",
                answer:
                  "Bisa. Pilih ukuran asli mengikuti dimensi gambar, atau A4 portrait/landscape.",
              },
              {
                question: "Apakah urutan gambar bisa diubah?",
                answer:
                  "Bisa, sebelum konversi. Gunakan tombol naik/turun atau seret kartu gambar ke posisi yang diinginkan.",
              },
              {
                question: "Apakah PDF hasilnya bisa diedit?",
                answer:
                  "PDF menyimpan gambar sebagai halaman. Untuk mengedit teks, gunakan dokumen sumber atau konversi ulang dari berkas aslinya.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.IMAGE_TO_PDF} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
