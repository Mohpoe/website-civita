"use client";

import DashboardPdfCompressor from "@/components/dashboard-pdf-compressor";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, FileDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin } from "react-icons/tfi";
import { Mail } from "lucide-react";

function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div className="bg-background md:bg-background border-4 border-foreground w-full max-w-6xl flex items-center justify-between px-5 md:px-6 py-3 md:py-3.5 rounded-full shadow-[4px_4px_0px_0px] shadow-foreground">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-inner">
            <Image
              alt="Logo"
              src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg"
              className="size-4 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-black tracking-tight text-xl">CIVITA.ID</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button variant="outline" className="h-10 px-5 font-bold rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button className="h-10 px-5 font-bold rounded-full bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Daftar
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href={ROUTES.DASHBOARD.HOME} className="h-10 px-5 font-bold rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all bg-[#f68e51] dark:bg-[#d97941] text-black inline-flex items-center">
                Dashboard
              </Link>
            </Show>
          </div>
          <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT("Halo admin CIVITA, saya butuh bantuan tools PDF."), "_blank")} className="hidden md:flex h-10 px-5 rounded-full font-bold bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
            Konsultasi <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t-4 border-foreground pt-16 pb-32 md:pb-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-6">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground rounded-xl flex items-center justify-center">
              <Image alt="Logo" src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg" className="size-5 [filter:brightness(0)_invert(1)]" width={1} height={1} />
            </div>
            <span className="font-black tracking-tight text-2xl uppercase">CIVITA.ID</span>
          </Link>
          <div className="flex flex-col gap-4 text-base font-bold">
            <a href={APP_CONFIG.LINKS.WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#ef3936] dark:hover:text-[#d9302d] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground">
              <SiWhatsapp className="w-5 h-5" /> +{APP_CONFIG.WHATSAPP}
            </a>
            <a href={APP_CONFIG.LINKS.EMAIL} className="flex items-center gap-3 hover:text-[#f68e51] dark:hover:text-[#d97941] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground">
              <Mail className="w-5 h-5" /> civitakerja@gmail.com
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 text-base font-black">
          <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="hover:bg-[#ef3936] dark:hover:bg-[#d9302d] hover:text-white bg-background border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <Instagram className="w-5 h-5" /> Instagram
          </a>
          <a href={APP_CONFIG.LINKS.LINKEDIN} target="_blank" rel="noreferrer" className="hover:bg-[#f68e51] dark:hover:bg-[#d97941] hover:text-black bg-background border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <TfiLinkedin className="w-5 h-5" /> LinkedIn
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t-4 border-foreground flex flex-col md:flex-row justify-between items-center gap-6 font-bold text-sm">
        <p>© {new Date().getFullYear()} <a href="https://mohpoe.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2">Mohpoe</a>. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href={ROUTES.TERMS} className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2 underline-offset-4">Syarat & Ketentuan</Link>
          <Link href={ROUTES.POLICY} className="hover:text-[#f68e51] dark:hover:text-[#d97941] underline decoration-2 underline-offset-4">Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
}

export default function PdfCompressorPage() {
  return (
    <div className="font-mono text-foreground antialiased min-h-screen bg-background">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `
      }} />
      <Navigation />
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f68e51] dark:bg-[#d97941] border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px] shadow-foreground">
              <FileDownIcon className="w-4 h-4" />
              PDF Compressor
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Kompres File PDF Online</h1>
            <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
              Kurangi ukuran file PDF tanpa mengunggah ke server. Proses 100% di browser Anda.
            </p>
          </div>
          <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-4 md:p-8">
            <DashboardPdfCompressor />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
