"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfMerger from "@/components/pdf-merger-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { ROUTES } from "@/lib/constants";
import { FileTextIcon } from "lucide-react";

export default function PdfMergerPage() {
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
              <FileTextIcon className="w-4 h-4" />
              PDF Merger
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Gabung File PDF Online</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Gabungkan beberapa file PDF menjadi satu dokumen. Urutkan sesuai keinginan. Semua diproses di perangkat Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfMerger />
          </div>
          <PdfToolGuide
            toolName="PDF Merger"
            steps={[
              "Klik area unggah lalu pilih minimal 2 file PDF. Maksimal 20 file dengan ukuran 50 MB per file.",
              "Atur urutan file dengan tombol naik/turun. Urutan ini menentukan urutan halaman pada hasil gabungan.",
              "Klik tombol Gabung PDF dan tunggu proses selesai. Semua berjalan di browser Anda.",
              "Unduh file hasil gabungan, atau hapus file tertentu lalu ulangi jika urutannya belum sesuai.",
            ]}
            faqs={[
              {
                question: "Berapa jumlah file yang bisa digabung sekaligus?",
                answer:
                  "Minimal 2 dan maksimal 20 file PDF, dengan ukuran maksimal 50 MB per file.",
              },
              {
                question: "Apakah urutan file bisa diubah sebelum digabung?",
                answer:
                  "Bisa. Gunakan tombol naik/turun pada daftar file. PDF digabung sesuai urutan yang tampil di daftar.",
              },
              {
                question: "Apakah file PDF saya diunggah ke server?",
                answer:
                  "Tidak. Penggabungan berjalan sepenuhnya di browser, jadi isi dokumen tidak dikirim ke server CIVITA.",
              },
              {
                question: "Nama file hasil gabungan seperti apa?",
                answer:
                  "File hasil diunduh dengan nama gabungan-pdf-civita.pdf, berisi seluruh halaman dari file yang Anda pilih.",
              },
              {
                question: "Apakah file PDF yang terkunci password bisa digabung?",
                answer:
                  "Tidak. Hapus password atau proteksi terlebih dahulu, karena file terenkripsi tidak bisa dibaca untuk digabungkan.",
              },
            ]}
          />
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_MERGER} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
