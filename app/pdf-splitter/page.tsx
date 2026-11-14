"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfSplitter from "@/components/pdf-splitter-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { ROUTES } from "@/lib/constants";
import { ScissorsIcon } from "lucide-react";

export default function PdfSplitterPage() {
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
              <ScissorsIcon className="w-4 h-4" />
              PDF Splitter
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Pisahkan File PDF Online</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Pisahkan PDF menjadi file terpisah per halaman, rentang halaman, atau halaman pilihan. Semua diproses di perangkat Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfSplitter />
          </div>
          <PdfToolGuide
            toolName="PDF Splitter"
            steps={[
              "Klik area unggah lalu pilih satu file PDF. Ukuran maksimal 100 MB.",
              "Pilih mode pemisahan: semua halaman, rentang halaman, atau halaman tertentu.",
              "Untuk halaman tertentu, tulis nomor halaman dengan format seperti 2, 3-6, 8, lalu pilih gabung jadi satu PDF atau pisah per halaman.",
              "Klik tombol Pisahkan PDF, lalu unduh hasilnya satu per satu atau sekaligus dalam file ZIP.",
            ]}
            faqs={[
              {
                question: "Berapa ukuran file PDF maksimal yang bisa dipisah?",
                answer: "Maksimal 100 MB per file.",
              },
              {
                question: "Bagaimana cara memilih halaman tertentu?",
                answer:
                  "Gunakan mode halaman tertentu, lalu tulis nomornya dengan format seperti 2, 3-6, 8. Artinya halaman 2, halaman 3 sampai 6, dan halaman 8.",
              },
              {
                question: "Apa bedanya gabung jadi 1 PDF dan pisah per halaman?",
                answer:
                  "Gabung jadi 1 PDF menyatukan semua halaman pilihan Anda ke satu file. Pisah per halaman membuat satu file PDF untuk setiap halaman yang dipilih.",
              },
              {
                question: "Apakah file saya diunggah ke server?",
                answer:
                  "Tidak. Pemisahan berjalan sepenuhnya di browser, jadi isi dokumen tidak dikirim ke server CIVITA.",
              },
              {
                question: "Bagaimana cara mengunduh semua hasil sekaligus?",
                answer:
                  "Gunakan tombol unduh semua. Hasil akan dikemas dalam satu file ZIP agar tidak perlu mengunduh satu per satu.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_SPLITTER} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
