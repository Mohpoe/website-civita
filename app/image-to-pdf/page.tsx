import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardImageToPdf from "@/components/image-to-pdf-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { ImagesIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Gambar ke PDF — Gabung JPG/PNG jadi PDF",
  description:
    "Gabungkan beberapa gambar JPG, JPEG, atau PNG menjadi satu file PDF dengan urutan yang bisa diatur. Diproses langsung di browser.",
  path: ROUTES.PDF_TOOLS.IMAGE_TO_PDF,
});

export default function ImageToPdfPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <ImagesIcon className="size-4" />
              Image to PDF
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Konversi Gambar ke PDF
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Gabungkan beberapa gambar JPG, JPEG, PNG menjadi satu file PDF.
              Atur urutan sesuai kebutuhan. Semua diproses di perangkat Anda.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
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
    </PublicPageShell>
  );
}
