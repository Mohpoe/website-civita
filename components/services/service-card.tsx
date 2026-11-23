import { formatRupiah, cn } from "@/lib/utils";
import { getServiceVisual, type ServiceAccent } from "@/lib/services";
import type { Service } from "@/types/global";
import { ArrowRight, FileCheck2 } from "lucide-react";
import Link from "next/link";

const ACCENT_BG: Record<ServiceAccent, string> = {
  coral: "bg-coral",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

/** Alamat publik layanan. */
export function servicePath(service: Pick<Service, "slug">): string {
  return `/jasa/${service.slug}`;
}

/**
 * Kartu layanan jasa untuk katalog publik dan bagian "Layanan lain".
 * Seluruh kartu adalah satu tautan ke halaman detail.
 */
export function ServiceCard({ service }: { service: Service }) {
  const visual =
    getServiceVisual(service.id) ?? getServiceVisual(service.slug);
  const Icon = visual?.icon ?? FileCheck2;
  const accent = visual?.accent ?? "butter";
  const tags =
    visual?.tags && visual.tags.length > 0
      ? visual.tags
      : service.languages.map((code) => code.toUpperCase());

  const distinctPrices = new Set(
    service.languages
      .map((code) => service.prices[code])
      .filter((amount) => Number.isFinite(amount) && amount > 0),
  );
  const hasMultiplePrices = distinctPrices.size > 1;

  return (
    <Link
      href={servicePath(service)}
      aria-label={`Lihat detail ${service.name}`}
      className="nb nb-hover group flex flex-col rounded-lg bg-paper p-4"
    >
      <span
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink text-on-accent",
          ACCENT_BG[accent],
        )}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-bold tracking-tight text-ink">
        {service.name}
      </h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
        {service.description}
      </p>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink/25 bg-paper-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-ink/10 pt-3">
        <span className="flex flex-col">
          {hasMultiplePrices ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Mulai dari
            </span>
          ) : null}
          <span className="text-sm font-bold text-ink">
            {formatRupiah(service.price)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink underline decoration-2 underline-offset-4 group-hover:text-coral-deep">
          Lihat detail
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
