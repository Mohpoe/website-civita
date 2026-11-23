"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

/** Kepala daftar pesanan: judul, keterangan, pencarian, dan aksi opsional. */
export function OrderListHeader({
  title,
  description,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  action,
}: {
  title: string;
  description: string;
  searchPlaceholder: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {onSearchChange ? (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-10 bg-paper pl-9"
            />
          </div>
        ) : null}
        {action}
      </div>
    </div>
  );
}

export type OrderFilter = {
  key: string;
  label: string;
  count?: number;
};

/** Filter berbentuk chip; dipakai produk dan jasa agar bentuknya sama. */
export function OrderFilterChips({
  filters,
  value,
  onChange,
  label = "Filter pesanan",
}: {
  filters: OrderFilter[];
  value: string;
  onChange: (key: string) => void;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      {filters.map((filter) => {
        const active = filter.key === value;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border-2 px-3 text-xs font-semibold transition-colors",
              active
                ? "border-ink bg-ink text-paper shadow-[2px_2px_0_0_var(--ink)]"
                : "border-ink/25 bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink",
            )}
          >
            {filter.label}
            {typeof filter.count === "number" ? (
              <span className="tabular-nums opacity-70">{filter.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Kartu pesanan bersama untuk produk dan jasa. */
export function OrderCard({
  orderId,
  status,
  title,
  description,
  meta,
  amount,
  actions,
  visual,
  secondaryBadge,
  muted = false,
}: {
  orderId: string;
  status: ReactNode;
  title: string;
  description?: string | null;
  meta?: ReactNode;
  amount: string;
  actions?: ReactNode;
  visual?: ReactNode;
  secondaryBadge?: ReactNode;
  muted?: boolean;
}) {
  return (
    <Card className={cn("overflow-hidden", muted && "opacity-80")}>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
        {visual ? (
          <div className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-ink/10 bg-paper-2 sm:aspect-square sm:w-28">
            {visual}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border-2 border-ink/15 bg-paper-2 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink">
                {orderId}
              </span>
              {secondaryBadge}
            </div>
            {status}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight sm:text-lg">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {description}
              </p>
            ) : null}
            {meta ? (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                {meta}
              </div>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t-2 border-ink/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-bold">{amount}</span>
            {actions ? (
              <div className="flex flex-wrap gap-2">{actions}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Keadaan kosong dengan ikon, penjelasan, dan aksi lanjutan. */
export function OrderEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-md border-2 border-dashed border-ink/30 bg-paper-2 text-ink-soft">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

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

/** Pagination daftar pesanan; tanpa scrollbar dan nomor aktif tetap utuh. */
export function OrderListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <Pagination className="mt-6">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={cn(
              "cursor-pointer",
              currentPage === 1 && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={cn(
              "cursor-pointer",
              currentPage === totalPages && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
