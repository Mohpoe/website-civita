import { FaqAccordion } from "@/components/faq-accordion";
import { PublicPageShell } from "@/components/public-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { getHelpArticle, HELP_ARTICLES } from "@/lib/help-content";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Mail,
  MessageCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({ slug: article.slug }));
}

/** Hanya empat artikel di atas yang valid; alamat lain langsung 404. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "Panduan tidak ditemukan",
      description: "Panduan yang kamu cari tidak tersedia.",
      path: `${ROUTES.HELP}/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: article.title,
    description: article.description,
    path: `${ROUTES.HELP}/${article.slug}`,
    ogTitle: `${article.title} | ${APP_CONFIG.NAME}`,
    ogDescription: article.description,
  });
}

const ACCENT_CLASS = {
  coral: "bg-coral",
  butter: "bg-butter",
  sage: "bg-sage",
  sky: "bg-sky",
} as const;

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getHelpArticle(slug);

  if (!article) notFound();

  const Icon = article.icon;
  const related = HELP_ARTICLES.filter((item) => item.slug !== article.slug);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <Link
            href={ROUTES.HELP}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" /> Pusat Bantuan
          </Link>

          <header className="mt-5 max-w-3xl space-y-4">
            <span
              className={cn(
                "nb-sm inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-accent",
                ACCENT_CLASS[article.accent],
              )}
            >
              <Icon className="size-4" />
              {article.shortTitle}
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {article.title}
            </h1>
            <p className="text-sm leading-relaxed text-ink-soft md:text-base">
              {article.description}
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <Clock className="size-3.5" /> Waktu baca sekitar {article.readTime}
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <nav
                aria-label={`Daftar isi ${article.shortTitle}`}
                className="nb-sm sticky top-28 rounded-lg bg-paper p-4"
              >
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                  Daftar Isi
                </p>
                <ul className="space-y-2">
                  {article.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block text-xs leading-snug text-ink-soft transition-colors hover:text-ink"
                      >
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <article className="space-y-8">
              <div className="nb space-y-10 rounded-lg bg-paper p-6 md:p-8">
                {article.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 space-y-3"
                  >
                    <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                      {index + 1}. {section.title}
                    </h2>

                    {section.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-relaxed text-ink-soft md:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.steps?.length ? (
                      <ol className="space-y-3">
                        {section.steps.map((step, stepIndex) => (
                          <li key={step} className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-butter text-xs font-bold text-on-accent">
                              {stepIndex + 1}
                            </span>
                            <p className="text-sm leading-relaxed text-ink-soft md:text-base">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    ) : null}

                    {section.bullets?.length ? (
                      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-ink/30 md:text-base">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}

                    {section.note ? (
                      <p className="rounded-md border-2 border-ink/20 bg-paper-2 px-4 py-3 text-xs leading-relaxed text-ink md:text-sm">
                        <strong className="font-bold">Catatan:</strong>{" "}
                        {section.note}
                      </p>
                    ) : null}
                  </section>
                ))}
              </div>

              <section className="nb rounded-lg bg-paper p-6 md:p-8">
                <h2 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
                  Pertanyaan Umum
                </h2>
                <FaqAccordion items={article.faqs} />
              </section>

              <section className="nb flex flex-col gap-4 rounded-lg bg-lilac p-6 text-on-accent sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Masih butuh bantuan?
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed">
                    Hubungi admin lewat WhatsApp atau email. Sertakan nomor
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
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                  <a
                    href={APP_CONFIG.LINKS.EMAIL}
                    className="nb-sm nb-press inline-flex h-10 items-center gap-2 rounded-md border-2 border-ink bg-ink px-4 text-xs font-bold text-paper"
                  >
                    <Mail className="size-4" /> Email
                  </a>
                </div>
              </section>
            </article>
          </div>

          <section aria-labelledby="panduan-lain" className="mt-12">
            <h2
              id="panduan-lain"
              className="text-xl font-bold tracking-tight md:text-2xl"
            >
              Panduan lainnya
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {related.map((item) => {
                const RelatedIcon = item.icon;
                return (
                  <Link
                    key={item.slug}
                    href={`${ROUTES.HELP}/${item.slug}`}
                    className="nb-sm nb-hover group flex items-center gap-3 rounded-lg bg-paper p-4"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-ink text-on-accent",
                        ACCENT_CLASS[item.accent],
                      )}
                    >
                      <RelatedIcon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-bold leading-tight">
                      {item.shortTitle}
                    </span>
                    <ArrowRight className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-2">
            <Link
              href={ROUTES.HELP}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "nb-sm nb-press h-10 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
              )}
            >
              <ArrowLeft className="mr-1.5 size-4" /> Semua panduan
            </Link>
            <Link
              href={ROUTES.SERVICES}
              className={cn(
                buttonVariants({ variant: "default" }),
                "nb-sm nb-press h-10 px-4 text-xs font-semibold",
              )}
            >
              Lihat katalog jasa <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
