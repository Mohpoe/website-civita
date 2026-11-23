import { ServiceCard } from "@/components/services/service-card";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getActiveServices } from "@/lib/service-catalog";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Katalog Jasa",
  description:
    "Jasa pembuatan CV ATS, resume, surat lamaran, cover letter, dan berkas lamaran lain. Dikerjakan custom sesuai pengalaman dan posisi yang kamu lamar.",
  path: ROUTES.SERVICES,
});

export const revalidate = 300;

const SORTS = [
  { value: "urutan", label: "Rekomendasi" },
  { value: "termurah", label: "Termurah" },
  { value: "termahal", label: "Termahal" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

const PAGE_SIZE = 9;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const requestedSort = first(params.urut).trim();
  const requestedPage = Math.max(1, Number(first(params.halaman)) || 1);
  const sort: SortValue = SORTS.some((item) => item.value === requestedSort)
    ? (requestedSort as SortValue)
    : "urutan";

  const services = await getActiveServices();

  const normalizedQuery = query.toLowerCase();
  const filtered = services.filter((service) => {
    if (!normalizedQuery) return true;
    return [service.name, service.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "termurah") return a.price - b.price;
    if (sort === "termahal") return b.price - a.price;
    return a.sort_order - b.sort_order;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE);

  const buildHref = (
    overrides: { q?: string; urut?: string; halaman?: number } = {},
  ) => {
    const next = {
      q: query,
      urut: sort,
      halaman: 1,
      ...overrides,
    };
    const search = new URLSearchParams();

    if (next.q) search.set("q", next.q);
    if (next.urut && next.urut !== "urutan") search.set("urut", next.urut);
    if (next.halaman && next.halaman > 1) {
      search.set("halaman", String(next.halaman));
    }

    const value = search.toString();
    return value ? `${ROUTES.SERVICES}?${value}` : ROUTES.SERVICES;
  };

  const hasFilter = Boolean(query || sort !== "urutan");

  return (
    <main className="bg-paper">
      <section className="border-b-2 border-ink bg-paper-2 px-4 pt-28 pb-10 sm:px-6 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <span className="nb-sm inline-flex items-center rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink">
            Katalog Jasa
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Jasa bikin berkas lamaran, dari CV sampai surat resign.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
            Semua dikerjakan custom dari riwayat pendidikan, pengalaman, dan
            pencapaianmu. Pilih layanan, isi data, lalu pantau pengerjaannya
            dari dashboard.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <form
          action={ROUTES.SERVICES}
          method="get"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari layanan, misalnya CV ATS..."
              className="nb-sm h-11 w-full rounded-md bg-paper pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
          </div>
          {sort !== "urutan" ? (
            <input type="hidden" name="urut" value={sort} />
          ) : null}
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "default" }),
              "nb-sm nb-press h-11 bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink",
            )}
          >
            Cari layanan
          </button>
          {hasFilter ? (
            <Link
              href={ROUTES.SERVICES}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <X className="size-3.5" /> Reset
            </Link>
          ) : null}
        </form>

        <div className="mt-5 flex flex-col gap-4 border-b-2 border-ink/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-ink-soft">
            {sorted.length > 0 ? (
              <>
                Menampilkan{" "}
                <span className="font-bold text-ink">{sorted.length}</span>{" "}
                layanan
              </>
            ) : (
              "Tidak ada layanan untuk pencarian ini."
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs lg:shrink-0 lg:flex-nowrap">
            <span className="font-semibold uppercase tracking-widest text-ink-soft">
              Urutkan
            </span>
            {SORTS.map((item) => (
              <Link
                key={item.value}
                href={buildHref({ urut: item.value })}
                className={cn(
                  "whitespace-nowrap rounded-full px-2.5 py-1 font-semibold transition-colors",
                  sort === item.value
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="nb mt-8 flex flex-col items-start gap-3 rounded-lg bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                {services.length === 0
                  ? "Katalog jasa sedang disiapkan."
                  : "Belum ada layanan yang cocok."}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {services.length === 0
                  ? "Sementara itu, chat admin untuk kebutuhan berkas lamaranmu."
                  : "Coba kata kunci lain atau lihat semua layanan yang tersedia."}
              </p>
            </div>
            <Link
              href={ROUTES.SERVICES}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "nb-sm nb-press h-10 shrink-0 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
              )}
            >
              Lihat semua layanan
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(page) => buildHref({ halaman: page })}
        />

        <div className="nb mt-10 flex flex-col items-start justify-between gap-3 rounded-lg bg-butter px-4 py-4 text-on-accent sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-on-accent">
              Butuh template yang bisa langsung kamu edit sendiri?
            </p>
            <p className="mt-1 text-xs text-on-accent/80">
              Katalog produk berisi template CV, resume, dan surat lamaran siap
              pakai.
            </p>
          </div>
          <Link
            href={ROUTES.PRODUCTS}
            className={cn(
              buttonVariants({ variant: "default" }),
              "nb-sm nb-press h-9 shrink-0 bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink",
            )}
          >
            Lihat katalog produk <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
