import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

/** Batasi nomor halaman yang dirender agar tidak meluber di layar kecil. */
function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

const ITEM_CLASS =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border-2 px-2 text-sm font-bold transition-colors";
const IDLE_CLASS =
  "border-transparent bg-paper text-ink hover:border-ink hover:bg-paper-2";
const ACTIVE_CLASS =
  "border-ink bg-coral text-on-accent shadow-[2px_2px_0_0_var(--ink)]";
const DISABLED_CLASS =
  "pointer-events-none border-transparent bg-paper text-ink-soft opacity-40";

/**
 * Pagination katalog berbasis tautan.
 *
 * Nomor halaman dibiarkan membungkus ke baris berikutnya (`flex-wrap`), bukan
 * dimasukkan ke wadah ber-scroll, supaya tidak ada scrollbar dan latar halaman
 * aktif tidak terpotong.
 */
export function CatalogPagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <Pagination>
        <PaginationContent className="flex-wrap justify-center gap-1.5">
          <PaginationItem>
            {currentPage > 1 ? (
              <Link
                href={buildHref(currentPage - 1)}
                aria-label="Halaman sebelumnya"
                className={cn(ITEM_CLASS, IDLE_CLASS, "pl-2")}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={cn(ITEM_CLASS, DISABLED_CLASS, "pl-2")}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </span>
            )}
          </PaginationItem>

          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="size-9 text-ink-soft" />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <Link
                  href={buildHref(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  aria-label={`Halaman ${page}`}
                  className={cn(
                    ITEM_CLASS,
                    page === currentPage ? ACTIVE_CLASS : IDLE_CLASS,
                  )}
                >
                  {page}
                </Link>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            {currentPage < totalPages ? (
              <Link
                href={buildHref(currentPage + 1)}
                aria-label="Halaman berikutnya"
                className={cn(ITEM_CLASS, IDLE_CLASS, "pr-2")}
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={cn(ITEM_CLASS, DISABLED_CLASS, "pr-2")}
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="size-4" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <p className="text-xs text-ink-soft">
        Halaman {currentPage} dari {totalPages}
      </p>
    </div>
  );
}
