"use client";

import { ModeToggle } from "@/components/theme-toggle-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_CONFIG, PUBLIC_NAV_LINKS, ROUTES } from "@/lib/constants";
import { PDF_TOOLS } from "@/lib/pdf-tools";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Menu as MenuIcon, Monitor, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const CONSULT_MESSAGE = "Halo admin CIVITA, saya ingin konsultasi terkait pembuatan CV yang ATS-friendly.";

const THEME_OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-widest text-foreground/60">Tema</p>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-2 border-foreground text-xs font-black transition-all ${active ? "bg-brand-orange text-black shadow-[2px_2px_0px_0px] shadow-foreground" : "bg-background text-foreground hover:bg-muted"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PublicMobileMenu() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const handleBreakpointChange = () => {
      if (desktopQuery.matches) setOpen(false);
    };

    desktopQuery.addEventListener("change", handleBreakpointChange);
    return () => desktopQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-[1px] active:shadow-none transition-all"
        aria-label="Buka menu navigasi"
      >
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="!w-[min(21rem,80vw)] gap-0 border-l-4 border-foreground bg-background p-0 shadow-[-6px_0px_0px_0px] shadow-foreground"
      >
        <SheetHeader className="border-b-4 border-foreground px-5 py-4 pr-14">
          <SheetTitle className="text-xl font-black tracking-tight">Menu</SheetTitle>
          <SheetDescription className="font-medium">Navigasi CIVITA.ID</SheetDescription>
        </SheetHeader>

        <div className="civita-menu-scroll flex-1 overflow-y-auto px-4 py-5">
          <nav aria-label="Menu utama" className="space-y-2">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-background px-4 py-3 font-black shadow-[2px_2px_0px_0px] shadow-foreground transition-all active:translate-y-[1px] active:shadow-none"
              >
                {link.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </nav>

          <div className="mt-6">
            <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-widest text-foreground/60">Alat PDF Gratis</p>
            <div className="space-y-2">
              {PDF_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-background p-2.5 shadow-[2px_2px_0px_0px] shadow-foreground transition-all active:translate-y-[1px] active:shadow-none"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground ${tool.accent === "red" ? "bg-brand-red text-white" : "bg-brand-orange text-black"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black leading-tight">{tool.name}</div>
                      <div className="mt-0.5 text-xs font-medium text-foreground/70">{tool.shortName}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t-4 border-foreground p-4">
          <Show when="signed-out">
            <div className="grid grid-cols-2 gap-2">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button
                  variant="outline"
                  onClick={closeMenu}
                  className="h-11 rounded-xl border-2 border-foreground font-bold shadow-[2px_2px_0px_0px] shadow-foreground"
                >
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button
                  onClick={closeMenu}
                  className="h-11 rounded-xl bg-brand-orange text-black border-2 border-foreground font-bold shadow-[2px_2px_0px_0px] shadow-foreground"
                >
                  Daftar
                </Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <Link
              href={ROUTES.DASHBOARD.HOME}
              onClick={closeMenu}
              className={buttonVariants({ className: "h-11 w-full !rounded-xl !border-2 !border-foreground !bg-brand-orange !text-black font-bold shadow-[2px_2px_0px_0px] shadow-foreground" })}
            >
              Dashboard
            </Link>
          </Show>

          <Button
            onClick={() => {
              closeMenu();
              window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT(CONSULT_MESSAGE), "_blank");
            }}
            className="h-11 w-full rounded-xl bg-brand-red text-white border-2 border-foreground font-bold shadow-[2px_2px_0px_0px] shadow-foreground"
          >
            <SiWhatsapp className="mr-2 h-4 w-4" />
            Konsultasi via WhatsApp
          </Button>

          <ThemeSelector />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PublicNavigation() {
  const [scrolled, setScrolled] = useState(false);

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
          <nav aria-label="Menu utama" className="hidden md:flex items-center gap-1.5">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center h-10 px-4 font-bold rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all text-sm whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

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

          <div className="hidden md:block">
            <ModeToggle />
          </div>

          <PublicMobileMenu />
        </div>
      </div>
    </motion.header>
  );
}
