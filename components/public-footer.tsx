"use client";

import { useSiteSettings } from "@/components/site-settings-provider";
import { ROUTES } from "@/lib/constants";
import { PDF_TOOLS } from "@/lib/pdf-tools";
import { Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin } from "react-icons/tfi";

const SERVICE_LINKS = [
  { label: "CV ATS Friendly", href: "/#layanan" },
  { label: "Resume ATS", href: "/#layanan" },
  { label: "Surat Lamaran", href: "/#layanan" },
  { label: "Cover Letter", href: "/#layanan" },
  { label: "Template Digital", href: "/#produk" },
];

export function PublicFooter() {
  const { settings, links } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-ink bg-paper px-4 pt-12 pb-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href={ROUTES.ROOT} className="flex w-max items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink bg-[#221f1b]">
                <Image
                  alt=""
                  src={settings.logoUrl}
                  className="size-4 [filter:brightness(0)_invert(1)]"
                  width={16}
                  height={16}
                />
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">{settings.brandName}</span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              {settings.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="nb-sm nb-press inline-flex h-9 items-center gap-2 rounded-md bg-sage px-3 text-xs font-semibold text-on-accent"
              >
                <SiWhatsapp className="size-4" /> WhatsApp
              </a>
              <a
                href={links.emailSupport}
                className="nb-sm nb-press inline-flex h-9 items-center gap-2 rounded-md bg-paper px-3 text-xs font-semibold text-ink"
              >
                <Mail className="size-4" /> Email
              </a>
              {settings.instagramUrl ? (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="nb-sm nb-press inline-flex h-9 w-9 items-center justify-center rounded-md bg-paper text-ink"
                >
                  <Instagram className="size-4" />
                </a>
              ) : null}
              {settings.linkedinUrl ? (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="nb-sm nb-press inline-flex h-9 w-9 items-center justify-center rounded-md bg-paper text-ink"
                >
                  <TfiLinkedin className="size-4" />
                </a>
              ) : null}
            </div>
          </div>

          <nav aria-label="Layanan" className="flex flex-col gap-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
              Layanan
            </h2>
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="w-max text-sm text-ink transition-colors hover:text-coral-deep"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Alat PDF" className="flex flex-col gap-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
              Alat PDF Gratis
            </h2>
            {PDF_TOOLS.slice(0, 6).map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="w-max text-sm text-ink transition-colors hover:text-coral-deep"
              >
                {tool.shortName}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t-2 border-ink pt-5 text-xs text-ink-soft sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-1.5">
            © {year} {settings.brandName}. Dibuat oleh{" "}
            <a
              href="https://mohpoe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-2 underline-offset-4"
            >
              Mohpoe
            </a>
            .
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href={ROUTES.TERMS} className="hover:text-ink">
              Syarat & Ketentuan
            </Link>
            <Link href={ROUTES.POLICY} className="hover:text-ink">
              Kebijakan Privasi
            </Link>
            <a href={links.consult} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
              <MessageCircle className="size-3.5" /> Konsultasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
