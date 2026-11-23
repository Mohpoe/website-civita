import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfCompressor from "@/components/pdf-compressor-tool";
import { PdfToolGuide } from "@/components/pdf-tool-guide";
import { PublicPageShell } from "@/components/public-page-shell";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { FileDownIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Kompres PDF Online — PDF Compressor",
  description:
    "Perkecil ukuran file PDF tanpa mengunggahnya ke mana pun. Cocok agar dokumen memenuhi batas unggah portal rekrutmen.",
  path: ROUTES.PDF_TOOLS.PDF_COMPRESSOR,
});

export default function PdfCompressorPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-coral px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent">
              <FileDownIcon className="size-4" />
              PDF Compressor
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Kompres File PDF Online
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Perkecil ukuran file PDF tanpa mengunggahnya ke mana pun. Semua
              diproses di perangkat Anda.
            </p>
          </header>
          <div className="nb rounded-lg bg-paper p-4 md:p-8">
            <DashboardPdfCompressor />
          </div>
          <PdfToolGuide
            toolName="PDF Compressor"
            steps={[
              "Klik area unggah lalu pilih satu file PDF. Ukuran maksimal 100 MB per file.",
              "Pilih preset kompresi: Ekstrim untuk file paling kecil, Direkomendasikan untuk keseimbangan, atau Kustom untuk mengatur kualitas sendiri.",
              "Klik tombol Kompres PDF dan tunggu proses selesai. Semua berjalan di browser Anda.",
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
                question: "Apa pengaruh pilihan preset terhadap hasil?",
                answer:
                  "Preset menentukan kualitas gambar JPEG saat halaman dirender ulang. Ekstrim menghasilkan file paling kecil, sedangkan Rendah Kompresi mempertahankan detail paling tajam.",
              },
              {
                question: "Mengapa ukuran file tidak banyak berkurang?",
                answer:
                  "Jika PDF berbasis teks atau vektor sudah efisien, hasil render gambar bisa lebih besar daripada versi aslinya. Tool lalu memilih hasil terkecil, yaitu optimasi struktur tanpa mengubah halaman.",
              },
              {
                question: "Apakah kualitas isi PDF berubah?",
                answer:
                  "Tampilan halaman tetap sama. Pada dokumen yang dirender sebagai gambar, detail halus bisa sedikit berkurang sesuai preset. Lapisan teks tetap disertakan agar PDF masih bisa dicari dan dibaca mesin ATS.",
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
    </PublicPageShell>
  );
}
