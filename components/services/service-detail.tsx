import { ServiceCard, servicePath } from "@/components/services/service-card";
import { ServiceOrderButton } from "@/components/services/service-order-button";
import { APP_CONFIG } from "@/lib/constants";
import { getServiceVisual, type ServiceAccent } from "@/lib/services";
import { cn, formatRupiah } from "@/lib/utils";
import type { Service } from "@/types/global";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Languages,
} from "lucide-react";
import Link from "next/link";

const ACCENT_BG: Record<ServiceAccent, string> = {
  coral: "bg-coral",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

const BENEFITS = [
  "Disusun custom dari data dan pengalamanmu.",
  "Format rapi dan siap dikirim ke HR.",
  "Hasil akhir bisa diunduh dari halaman Pesanan Jasa.",
  "Bisa berdiskusi dengan admin lewat chat pesanan.",
] as const;

const STEPS = [
  {
    title: "Pilih layanan",
    description: "Baca detail dan pastikan layanan sesuai kebutuhanmu.",
  },
  {
    title: "Isi data & berkas",
    description:
      "Lengkapi riwayat, posisi yang dilamar, dan unggah berkas pendukung.",
  },
  {
    title: "Bayar dengan aman",
    description: "Selesaikan pembayaran lewat Midtrans.",
  },
  {
    title: "Terima hasil",
    description:
      "Admin mengerjakan pesananmu dan hasilnya bisa diunduh dari halaman Pesanan Jasa.",
  },
] as const;

/** Tampilan halaman detail layanan jasa. */
export function ServiceDetail({
  service,
  related,
}: {
  service: Service;
  related: Service[];
}) {
  const visual =
    getServiceVisual(service.id) ?? getServiceVisual(service.slug);
  const Icon = visual?.icon ?? FileCheck2;
  const accent = visual?.accent ?? "butter";
  const tags =
    visual?.tags && visual.tags.length > 0
      ? visual.tags
      : service.languages.map((code) => code.toUpperCase());
  const href = servicePath(service);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: "Jasa bikin berkas lamaran kerja",
    provider: {
      "@type": "Organization",
      name: APP_CONFIG.NAME,
      url: APP_CONFIG.URL,
    },
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
    offers: {
      "@type": "Offer",
      url: `${APP_CONFIG.URL}${href}`,
      price: service.price,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft"
        >
          <Link href="/" className="hover:text-ink">
            Beranda
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/jasa" className="hover:text-ink">
            Jasa
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate font-semibold text-ink">
            {service.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div
              className={cn(
                "nb flex flex-col items-center gap-4 rounded-lg p-8 text-center text-on-accent",
                ACCENT_BG[accent],
              )}
            >
              <span className="flex size-20 items-center justify-center rounded-lg border-2 border-ink bg-paper/30">
                <Icon className="size-10" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest">
                  Layanan Jasa
                </p>
                <p className="mt-1 text-xl font-bold leading-tight">
                  {service.name}
                </p>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-ink/30 bg-paper/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="nb-sm mt-3 flex items-center justify-center gap-2 rounded-md bg-paper p-3 text-xs font-semibold text-ink">
              <Languages className="size-4" />
              Bahasa:{" "}
              {service.languages.map((code) => code.toUpperCase()).join(" & ")}
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full border border-ink/25 bg-paper-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Layanan Jasa
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {service.name}
            </h1>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {service.description}
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-ink">
                {formatRupiah(service.price)}
              </span>
              <span className="pb-1 text-xs text-ink-soft">
                Harga tetap, tanpa biaya tersembunyi
              </span>
            </div>

            <div className="mt-5">
              <ServiceOrderButton slug={service.slug} detailPath={href} />
            </div>

            <div className="nb-sm mt-6 rounded-lg bg-paper p-4">
              <h2 className="text-sm font-bold text-ink">Yang kamu dapat</h2>
              <ul className="mt-3 grid gap-2">
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-coral-deep" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Cara memesan</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="nb-sm rounded-lg bg-paper p-4">
                <span className="flex size-8 items-center justify-center rounded-md border-2 border-ink bg-butter text-sm font-bold text-on-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {related.length > 0 ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-ink">
                Layanan lain yang mungkin cocok
              </h2>
              <Link
                href="/jasa"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
