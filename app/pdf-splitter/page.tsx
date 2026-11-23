import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfSplitter from "@/components/pdf-splitter-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { ScissorsIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Pisah PDF Online — PDF Splitter",
  description:
    "Pisahkan PDF menjadi file terpisah per halaman, rentang halaman, atau halaman pilihan. Diproses langsung di browser tanpa unggah ke server.",
  path: ROUTES.PDF_TOOLS.PDF_SPLITTER,
});

export default function PdfSplitterPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <ScissorsIcon className="size-4" />
              PDF Splitter
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Pisahkan File PDF Online
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Pisahkan PDF menjadi file terpisah per halaman, rentang halaman,
              atau halaman pilihan. Semua diproses di perangkat Anda.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
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
    </PublicPageShell>
  );
}
