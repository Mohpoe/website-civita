import type { Metadata } from "next";
import { FileType2Icon } from "lucide-react";
import PdfToWordTool from "@/components/pdf-to-word-tool";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { APP_CONFIG, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: `PDF ke Word — Konversi PDF ke DOCX | ${APP_CONFIG.NAME}`,
  description:
    "Ubah PDF menjadi dokumen Word yang bisa diedit. Cocok untuk CV, surat lamaran, dan dokumen kerja.",
  alternates: {
    canonical: `${APP_CONFIG.URL}${ROUTES.PDF_TOOLS.PDF_TO_WORD}`,
  },
  openGraph: {
    title: `PDF ke Word | ${APP_CONFIG.NAME}`,
    description:
      "Konversi PDF ke Word yang rapi dan bisa diedit.",
    url: `${APP_CONFIG.URL}${ROUTES.PDF_TOOLS.PDF_TO_WORD}`,
    siteName: APP_CONFIG.NAME,
    type: "website",
  },
};

export default function PdfToWordPage() {
  return (
    <div className="font-mono text-foreground antialiased min-h-screen bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `,
        }}
      />
      <PublicNavigation />
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red text-white border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px] shadow-foreground">
              <FileType2Icon className="w-4 h-4" />
              PDF to Word
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Konversi PDF ke Word
            </h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Ubah PDF menjadi dokumen Word yang bisa diedit. Tata letak, tabel,
              dan gambar dipertahankan sebisa mungkin.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <PdfToWordTool />
          </div>
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_TO_WORD} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
