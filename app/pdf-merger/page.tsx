import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfMerger from "@/components/pdf-merger-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { FileTextIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Gabung PDF Online — PDF Merger",
  description:
    "Gabungkan beberapa file PDF menjadi satu dokumen dengan urutan yang bisa diatur. Diproses langsung di browser tanpa unggah ke server.",
  path: ROUTES.PDF_TOOLS.PDF_MERGER,
});

export default function PdfMergerPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <FileTextIcon className="size-4" />
              PDF Merger
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Gabung File PDF Online
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Gabungkan beberapa file PDF menjadi satu dokumen. Urutkan sesuai
              keinginan. Semua diproses di perangkat Anda.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
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
    </PublicPageShell>
  );
}
