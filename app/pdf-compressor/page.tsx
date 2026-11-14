"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfCompressor from "@/components/pdf-compressor-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { ROUTES } from "@/lib/constants";
import { FileDownIcon } from "lucide-react";

export default function PdfCompressorPage() {
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
              <FileDownIcon className="w-4 h-4" />
              PDF Compressor
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Kompres File PDF Online</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Perkecil ukuran file PDF tanpa mengunggahnya ke mana pun. Semua diproses di perangkat Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfCompressor />
          </div>
          <PdfToolGuide
            toolName="PDF Compressor"
            steps={[
              "Klik area unggah lalu pilih satu file PDF. Ukuran maksimal 100 MB per file.",
              "Pilih preset kompresi yang tersedia, atau gunakan Kustom untuk mengatur sendiri tingkat kompresinya.",
              "Klik tombol Kompres PDF dan tunggu sampai proses selesai. Semua berjalan di browser Anda.",
              "Bandingkan ukuran sebelum dan sesudah, lalu unduh file PDF hasil kompresi.",
            ]}
            faqs={[
              {
                question: "Berapa ukuran file PDF maksimal yang bisa dikompres?",
                answer:
                  "Maksimal 100 MB per file. Karena diproses di browser, file yang sangat besar bisa memakan waktu lebih lama tergantung perangkat Anda.",
              },
              {
                question: "Apakah file PDF saya diunggah ke server?",
                answer:
                  "Tidak. Kompresi berjalan sepenuhnya di perangkat Anda, jadi isi dokumen tidak pernah dikirim ke server CIVITA.",
              },
              {
                question: "Mengapa ukuran file tidak banyak berkurang?",
                answer:
                  "Kompresor membersihkan metadata dan mengoptimalkan struktur PDF. Jika isi dokumen didominasi gambar beresolusi tinggi, penghematannya bisa kecil karena gambar tidak diubah.",
              },
              {
                question: "Apakah kualitas isi PDF berubah?",
                answer:
                  "Tidak. Teks, gambar, dan tata letak tetap sama. Yang dihapus hanya metadata seperti judul, penulis, dan nama pembuat dokumen.",
              },
              {
                question: "Apakah file hasil kompresi disimpan di server?",
                answer:
                  "Tidak. File hasil dibuat di browser dan langsung diunduh, tidak disimpan di mana pun.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_COMPRESSOR} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
