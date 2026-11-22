import { ProductCard } from "@/components/products/product-card";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { buttonVariants } from "@/components/ui/button";
import { getActiveProducts } from "@/lib/products";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/global";
import { Search, X } from "lucide-react";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Katalog Produk",
  description:
    "Template CV, resume, dan surat lamaran siap pakai. Pilih template yang cocok, bayar sekali, lalu unduh kapan saja.",
  path: "/produk",
});

export const revalidate = 300;

const PAGE_SIZE = 9;

const SORTS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Termurah" },
  { value: "termahal", label: "Termahal" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const categorySlug = first(params.kategori).trim();
  const requestedSort = first(params.urut).trim();
  const sort: SortValue = SORTS.some((item) => item.value === requestedSort)
    ? (requestedSort as SortValue)
    : "terbaru";
  const requestedPage = Math.max(1, Number(first(params.halaman)) || 1);

  const products = await getActiveProducts();

  // Kategori diturunkan dari produk aktif supaya filter tidak menampilkan
  // kategori kosong.
  const categories = Array.from(
    new Map(
      products
        .map((product) => product.category)
        .filter((category): category is Category => Boolean(category))
        .map((category) => [category.slug, category]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "id"));

  const normalizedQuery = query.toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery = normalizedQuery
      ? [
          product.title,
          product.short_desc,
          product.long_desc,
          product.category?.name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery))
      : true;

    const matchesCategory = categorySlug
      ? product.category?.slug === categorySlug
      : true;

    return matchesQuery && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "termurah") return a.price - b.price;
    if (sort === "termahal") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE);

  const buildHref = (
    overrides: {
      q?: string;
      kategori?: string;
      urut?: string;
      halaman?: number;
    } = {},
  ) => {
    const next = {
      q: query,
      kategori: categorySlug,
      urut: sort,
      halaman: 1,
      ...overrides,
    };
    const search = new URLSearchParams();

    if (next.q) search.set("q", next.q);
    if (next.kategori) search.set("kategori", next.kategori);
    if (next.urut && next.urut !== "terbaru") search.set("urut", next.urut);
    if (next.halaman && next.halaman > 1) {
      search.set("halaman", String(next.halaman));
    }

    const value = search.toString();
    return value ? `/produk?${value}` : "/produk";
  };

  const hasFilter = Boolean(query || categorySlug || sort !== "terbaru");
  const showingFrom = sorted.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, sorted.length);

  return (
    <main className="bg-paper">
      <section className="border-b-2 border-ink bg-paper-2 px-4 pt-28 pb-10 sm:px-6 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <span className="nb-sm inline-flex items-center rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink">
            Katalog Produk
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Template CV & resume siap pakai.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
            Pilih template yang cocok dengan posisi yang kamu lamar. Bayar
            sekali, lalu unduh dan pakai berkali-kali.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <form
          action="/produk"
          method="get"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari template, misalnya CV ATS..."
              className="nb-sm h-11 w-full rounded-md bg-paper pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
          </div>
          {categorySlug ? (
            <input type="hidden" name="kategori" value={categorySlug} />
          ) : null}
          {sort !== "terbaru" ? (
            <input type="hidden" name="urut" value={sort} />
          ) : null}
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "default" }),
              "nb-sm nb-press h-11 bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink",
            )}
          >
            Cari produk
          </button>
          {hasFilter ? (
            <Link
              href="/produk"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <X className="size-3.5" /> Reset
            </Link>
          ) : null}
        </form>

        <div className="mt-5 flex flex-col gap-4 border-b-2 border-ink/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildHref({ kategori: "", halaman: 1 })}
              className={cn(
                "nb-sm rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                categorySlug
                  ? "bg-paper text-ink hover:bg-paper-2"
                  : "bg-coral text-on-accent",
              )}
            >
              Semua
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={buildHref({ kategori: category.slug, halaman: 1 })}
                className={cn(
                  "nb-sm rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  categorySlug === category.slug
                    ? "bg-coral text-on-accent"
                    : "bg-paper text-ink hover:bg-paper-2",
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs lg:shrink-0 lg:flex-nowrap">
            <span className="font-semibold uppercase tracking-widest text-ink-soft">
              Urutkan
            </span>
            {SORTS.map((item) => (
              <Link
                key={item.value}
                href={buildHref({ urut: item.value, halaman: 1 })}
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          <p>
            {sorted.length > 0 ? (
              <>
                Menampilkan{" "}
                <span className="font-bold text-ink">
                  {showingFrom}–{showingTo}
                </span>{" "}
                dari <span className="font-bold text-ink">{sorted.length}</span>{" "}
                produk
              </>
            ) : (
              "Tidak ada produk untuk filter ini."
            )}
          </p>
          {categorySlug ? (
            <p>
              Kategori:{" "}
              <span className="font-semibold text-ink">
                {categories.find((item) => item.slug === categorySlug)?.name ??
                  categorySlug}
              </span>
            </p>
          ) : null}
        </div>

        {pageItems.length === 0 ? (
          <div className="nb mt-8 flex flex-col items-start gap-3 rounded-lg bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                {products.length === 0
                  ? "Katalog produk sedang disiapkan."
                  : "Belum ada produk yang cocok."}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {products.length === 0
                  ? "Sementara itu, chat admin untuk rekomendasi template yang cocok dengan posisi yang kamu lamar."
                  : "Coba kata kunci lain atau lihat semua produk yang tersedia."}
              </p>
            </div>
            <Link
              href="/produk"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "nb-sm nb-press h-10 shrink-0 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
              )}
            >
              Lihat semua produk
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 3}
              />
            ))}
          </div>
        )}

        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(page) => buildHref({ halaman: page })}
        />
      </div>
    </main>
  );
}
