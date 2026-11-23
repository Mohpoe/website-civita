import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfToImage from "@/components/pdf-to-image-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { FileImageIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: "PDF ke Gambar — Konversi PDF ke JPG/PNG",
  description:
    "Ubah setiap halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi. Diproses langsung di browser tanpa unggah ke server.",
  path: ROUTES.PDF_TOOLS.PDF_TO_IMAGE,
});

export default function PdfToImagePage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <FileImageIcon className="size-4" />
              PDF to Image
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Konversi PDF ke JPG/PNG
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Ubah setiap halaman PDF menjadi gambar JPG atau PNG berkualitas
              tinggi. Semua diproses di perangkat Anda.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
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
    </PublicPageShell>
  );
}
