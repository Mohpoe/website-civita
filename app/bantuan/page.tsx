import { FaqAccordion } from "@/components/faq-accordion";
import { PublicPageShell } from "@/components/public-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { HELP_ARTICLES } from "@/lib/help-content";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Mail,
  ShoppingBag,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiWhatsapp } from "react-icons/si";

export const metadata: Metadata = createPageMetadata({
  title: "Pusat Bantuan",
  description:
    "Panduan membeli produk digital, memesan jasa, menyelesaikan pembayaran, dan mengelola akun di CIVITA.",
  path: ROUTES.HELP,
});

const ACCENT_CLASS = {
  coral: "bg-coral",
  butter: "bg-butter",
  sage: "bg-sage",
  sky: "bg-sky",
} as const;

const QUICK_FAQ = [
  {
    question: "Apakah katalog bisa dilihat tanpa akun?",
    answer:
      "Bisa. Halaman produk dan jasa terbuka untuk semua orang. Akun baru dibutuhkan saat kamu membeli atau memesan.",
  },
  {
    question: "Di mana saya bisa mengunduh berkas?",
    answer:
      "Buka menu Pesanan Saya. Produk digital ada di sub-menu Produk, sedangkan hasil jasa ada di sub-menu Jasa.",
  },
  {
    question: "Pembayaran saya belum masuk, apa yang harus dilakukan?",
    answer:
      "Tunggu beberapa menit lalu muat ulang halaman pesanan. Jika masih menunggu, tekan Bayar Sekarang atau hubungi admin dengan nomor pesanan.",
  },
  {
    question: "Apakah hasil desain dipakai sebagai portofolio?",
    answer:
      "Kami hanya menampilkan hasil desain setelah informasi sensitif disensor. Penjelasan lengkap ada di Kebijakan Privasi.",
  },
];

export default function HelpHubPage() {
  return (
    <PublicPageShell>
      <main className="bg-paper">
        <section className="border-b-2 border-ink bg-paper-2 px-4 pt-28 pb-12 sm:px-6 md:pt-32 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ink">
              <BookOpen className="size-4" />
              Pusat Bantuan
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ada yang bisa kami bantu?
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
              Panduan singkat untuk membeli produk, memesan jasa, menyelesaikan
              pembayaran, dan mengelola akun di {APP_CONFIG.NAME}. Semua halaman
              bantuan bisa dibaca tanpa masuk.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href={ROUTES.PRODUCTS}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "nb-sm nb-press h-10 px-4 text-xs font-semibold",
                )}
              >
                <ShoppingBag className="mr-1.5 size-4" /> Lihat produk
              </Link>
              <Link
                href={ROUTES.SERVICES}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "nb-sm nb-press h-10 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
                )}
              >
                Lihat jasa
              </Link>
              <a
                href={APP_CONFIG.LINKS.WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "nb-sm nb-press h-10 border-2 border-ink bg-sage px-4 text-xs font-semibold text-on-accent hover:bg-sage",
                )}
              >
                <SiWhatsapp className="mr-1.5 size-4" /> Tanya admin
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <section aria-labelledby="panduan-utama">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="panduan-utama"
                  className="text-2xl font-bold tracking-tight md:text-3xl"
                >
                  Pilih panduan
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Mulai dari topik yang paling sesuai dengan kebutuhanmu.
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                4 artikel
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {HELP_ARTICLES.map((article) => {
                const Icon = article.icon;
                return (
                  <Link
                    key={article.slug}
                    href={`${ROUTES.HELP}/${article.slug}`}
                    className="nb nb-hover group flex flex-col gap-3 rounded-lg bg-paper p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-md border-2 border-ink text-on-accent",
                          ACCENT_CLASS[article.accent],
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-soft">
                        <Clock className="size-3.5" /> {article.readTime}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold leading-tight">
                        {article.shortTitle}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {article.description}
                      </p>
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-ink">
                      Baca panduan
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="pertanyaan-umum" className="mt-12">
            <h2
              id="pertanyaan-umum"
              className="text-2xl font-bold tracking-tight md:text-3xl"
            >
              Pertanyaan yang sering muncul
            </h2>
            <div className="nb mt-5 rounded-lg bg-paper p-5 md:p-6">
              <FaqAccordion items={QUICK_FAQ} />
            </div>
          </section>

          <section className="nb mt-12 flex flex-col gap-4 rounded-lg bg-lilac p-6 text-on-accent sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                Belum menemukan jawabannya?
              </h2>
              <p className="mt-1 text-sm leading-relaxed">
                Kirim pertanyaan lewat WhatsApp atau email. Sertakan nomor
                pesanan bila pertanyaanmu tentang transaksi.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={APP_CONFIG.LINKS.WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="nb-sm nb-press inline-flex h-10 items-center gap-2 rounded-md border-2 border-ink bg-paper px-4 text-xs font-bold text-ink"
              >
                <SiWhatsapp className="size-4" /> WhatsApp
              </a>
              <a
                href={APP_CONFIG.LINKS.EMAIL}
                className="nb-sm nb-press inline-flex h-10 items-center gap-2 rounded-md border-2 border-ink bg-ink px-4 text-xs font-bold text-paper"
              >
                <Mail className="size-4" /> Email
              </a>
            </div>
          </section>
        </div>
      </main>
    </PublicPageShell>
  );
}
