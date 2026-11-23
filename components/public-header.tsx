"use client";

import { AuthActions } from "@/components/auth-actions";
import { useSiteSettings } from "@/components/site-settings-provider";
import { ModeToggle } from "@/components/theme-toggle-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PUBLIC_NAV_LINKS, ROUTES } from "@/lib/constants";
import { PDF_TOOLS } from "@/lib/pdf-tools";
import { cn } from "@/lib/utils";
import { Menu as MenuIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const THEME_OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
        Tema
      </p>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={cn(
                "nb-sm inline-flex h-10 items-center justify-center gap-1.5 rounded-md text-xs font-semibold",
                active ? "bg-coral text-on-accent" : "bg-paper text-ink hover:bg-paper-2",
              )}
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
  const { settings, links } = useSiteSettings();
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const handleBreakpointChange = () => {
      if (desktopQuery.matches) setOpen(false);
    };

    desktopQuery.addEventListener("change", handleBreakpointChange);
    return () => desktopQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="nb-sm inline-flex h-10 w-10 items-center justify-center rounded-md bg-paper text-ink lg:hidden"
        aria-label="Buka menu navigasi"
      >
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="!w-[min(21rem,84vw)] gap-0 border-l-2 border-ink bg-paper p-0"
      >
        <SheetHeader className="border-b-2 border-ink px-5 py-4 pr-14">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            Menu
          </SheetTitle>
          <SheetDescription className="text-sm text-ink-soft">
            Navigasi {settings.brandName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav aria-label="Menu utama" className="space-y-2">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="nb-sm flex items-center justify-between gap-3 rounded-md bg-paper px-4 py-3 text-sm font-semibold text-ink hover:bg-paper-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
              Alat PDF gratis
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PDF_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={closeMenu}
                    className="nb-sm flex items-center gap-2 rounded-md bg-paper px-3 py-2.5 text-xs font-semibold text-ink hover:bg-paper-2"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tool.shortName}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t-2 border-ink p-4">
          <AuthActions variant="mobile" />

          <a
            href={links.consult}
            target="_blank"
            rel="noreferrer"
            className="nb-sm nb-press flex h-11 w-full items-center justify-center rounded-md bg-sage text-sm font-semibold text-on-accent"
          >
            <SiWhatsapp className="mr-2 h-4 w-4" />
            Konsultasi via WhatsApp
          </a>

          <ThemeSelector />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PublicNavigation() {
  const [scrolled, setScrolled] = useState(false);
  const { settings, links } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <div
        className={cn(
          "nb mx-auto flex items-center justify-between gap-3 rounded-lg bg-paper/95 px-3 py-2 transition-all duration-200 md:px-4 md:py-2.5",
          scrolled ? "max-w-5xl" : "max-w-6xl",
        )}
      >
        <Link
          href={ROUTES.ROOT}
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${settings.brandName} — beranda`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink bg-[#221f1b]">
            <Image
              alt=""
              src={settings.logoUrl}
              className="size-4 [filter:brightness(0)_invert(1)]"
              width={16}
              height={16}
            />
          </span>
          <span className="text-base font-bold tracking-tight text-ink md:text-lg">
            {settings.brandName}
          </span>
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthActions />
          </div>

          <a
            href={links.consult}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "default" }),
              "nb-sm nb-press hidden h-10 bg-coral px-4 text-sm font-semibold text-on-accent hover:bg-coral md:inline-flex",
            )}
          >
            <SiWhatsapp className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Konsultasi</span>
            <span className="lg:hidden">Chat</span>
          </a>

          <div className="hidden md:block">
            <ModeToggle />
          </div>

          <PublicMobileMenu />
        </div>
      </div>
    </header>
  );
}
