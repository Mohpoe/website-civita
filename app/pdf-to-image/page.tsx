"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicMobileBottomBar, PublicNavigation } from "@/components/public-header";
import { PdfToolsCrossNav } from "@/components/pdf-tools-cross-nav";
import DashboardPdfToImage from "@/components/pdf-to-image-tool";
import { ROUTES } from "@/lib/constants";
import { FileImageIcon } from "lucide-react";

export default function PdfToImagePage() {
  return (
    <div className="font-mono text-foreground antialiased min-h-screen bg-background pb-20 md:pb-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `
      }} />
      <PublicNavigation />
      <PublicMobileBottomBar />
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f68e51] dark:bg-[#d97941] border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px] shadow-foreground">
              <FileImageIcon className="w-4 h-4" />
              PDF to Image
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Konversi PDF ke JPG/PNG</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Ubah setiap halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi. Proses 100% di browser.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfToImage />
          </div>
          <PdfToolsCrossNav currentHref={ROUTES.PDF_TOOLS.PDF_TO_IMAGE} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
