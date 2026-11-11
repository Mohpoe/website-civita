"use client";

import { ModeToggle } from "@/components/theme-toggle-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { PDF_TOOLS } from "@/lib/pdf-tools";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const CONSULT_MESSAGE = "Halo admin CIVITA, saya ingin konsultasi terkait pembuatan CV yang ATS-friendly.";

function PdfToolsSheetContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="px-4 pb-6 space-y-2 overflow-y-auto">
      {PDF_TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.id}
            href={tool.href}
            onClick={onNavigate}
            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-foreground bg-background shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-[1px] active:shadow-none transition-all"
          >
            <div className={`w-10 h-10 shrink-0 rounded-xl border-2 border-foreground flex items-center justify-center ${tool.accent === "red" ? "bg-brand-red text-white" : "bg-brand-orange text-black"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm leading-tight">{tool.name}</div>
              <div className="text-xs font-medium text-foreground/70 leading-snug mt-0.5">{tool.description}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function PublicNavigation() {
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`
        pointer-events-auto flex items-center justify-between gap-2 px-4 sm:px-5 md:px-6 py-3 md:py-3.5 rounded-full transition-all duration-500 border-4 border-transparent shadow-[4px_4px_0px_0px] shadow-foreground
        ${scrolled ? "bg-background/80 backdrop-blur-md w-full max-w-4xl !border-2 !border-foreground" : "bg-background md:bg-background border-foreground w-full max-w-6xl"}
      `}
      >
        <Link href={ROUTES.ROOT} className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-inner">
            <Image
              alt="Logo"
              src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg"
              className="size-4 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-black tracking-tight text-lg sm:text-xl">CIVITA.ID</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
          <Link
            href="/#tools"
            className="hidden md:inline-flex items-center h-10 px-4 font-bold rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all text-sm whitespace-nowrap"
          >
            Alat PDF
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button variant="outline" className="h-10 px-4 lg:px-5 font-bold rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button className="h-10 px-4 lg:px-5 font-bold rounded-full bg-brand-orange text-black border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Daftar
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ className: "h-10 px-4 lg:px-5 font-bold !rounded-full !border-2 !border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all !bg-brand-orange !text-black" })}>
                Dashboard
              </Link>
            </Show>
          </div>

          <div className="hidden lg:block w-1.5 h-1.5 rounded-full bg-foreground mx-0.5" />

          <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT(CONSULT_MESSAGE), "_blank")} className="hidden md:flex h-10 px-3 lg:px-5 rounded-full font-bold bg-brand-red text-white border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all" aria-label="Konsultasi WhatsApp">
            <SiWhatsapp className="w-4 h-4 lg:hidden" />
            <span className="hidden lg:inline-flex items-center">Konsultasi <ArrowRight className="w-4 h-4 ml-2" /></span>
          </Button>

          <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-[1px] active:shadow-none transition-all" aria-label="Buka alat PDF">
              <LayoutGrid className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[1.5rem] border-t-4 border-x-4 border-foreground max-h-[85vh]">
              <SheetHeader className="pr-10">
                <SheetTitle className="font-black text-xl">Alat PDF Gratis</SheetTitle>
                <SheetDescription className="font-medium">Lengkapi berkas lamaran kerja Anda. Gratis, diproses langsung di browser.</SheetDescription>
              </SheetHeader>
              <PdfToolsSheetContent onNavigate={() => setToolsOpen(false)} />
            </SheetContent>
          </Sheet>

          <ModeToggle />
        </div>
      </div>
    </motion.header>
  );
}

export function PublicMobileBottomBar() {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t-4 border-foreground p-2.5 flex items-center gap-2 shadow-[0px_-4px_0px_0px] shadow-foreground">
        <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
          <SheetTrigger className="flex-none flex flex-col items-center justify-center w-14 h-12 rounded-2xl border-2 border-foreground bg-muted font-bold shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-[1px] active:shadow-none transition-all" aria-label="Alat PDF">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] leading-none mt-0.5 font-black">Alat</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[1.5rem] border-t-4 border-x-4 border-foreground max-h-[85vh]">
            <SheetHeader className="pr-10">
              <SheetTitle className="font-black text-xl">Alat PDF Gratis</SheetTitle>
              <SheetDescription className="font-medium">Lengkapi berkas lamaran kerja Anda. Gratis, diproses langsung di browser.</SheetDescription>
            </SheetHeader>
            <PdfToolsSheetContent onNavigate={() => setToolsOpen(false)} />
          </SheetContent>
        </Sheet>

        <Show when="signed-out">
          <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
            <Button variant="outline" className="flex-1 h-12 rounded-2xl border-2 border-foreground font-bold text-sm shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all px-2">
              Masuk
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
            <Button className="flex-1 h-12 rounded-2xl border-2 border-foreground bg-brand-orange text-black font-bold text-sm shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all px-2">
              Daftar
            </Button>
          </SignUpButton>
        </Show>

        <Show when="signed-in">
          <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ className: "flex-1 h-12 !rounded-2xl !border-2 font-bold text-sm !border-foreground shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all !bg-brand-orange !text-black px-2" })}>
            Dashboard
          </Link>
        </Show>

        <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT(CONSULT_MESSAGE), "_blank")} className="flex-none w-14 h-12 rounded-2xl bg-brand-red text-white border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all p-0" aria-label="Konsultasi WhatsApp">
          <SiWhatsapp className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
}
