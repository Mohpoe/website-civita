"use client";

import {
  OrderCard,
  OrderEmptyState,
  OrderFilterChips,
  OrderListHeader,
  OrderListPagination,
  type OrderFilter,
} from "@/components/orders/order-list-ui";
import { ServiceStatusBadge } from "@/components/services/service-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import type { ServiceOrder } from "@/types/global";
import {
  ArrowRight,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type FilterKey = "all" | "unpaid" | "working" | "done" | "closed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Perlu dibayar" },
  { key: "working", label: "Dikerjakan" },
  { key: "done", label: "Selesai" },
  { key: "closed", label: "Ditutup" },
];

function matchesFilter(order: ServiceOrder, filter: FilterKey): boolean {
  switch (filter) {
    case "unpaid":
      return order.status === "pending" || order.status === "challenge";
    case "working":
      return order.status === "success" && !order.delivered_at;
    case "done":
      return order.status === "success" && !!order.delivered_at;
    case "closed":
      return (
        order.status === "failed" ||
        order.status === "expired" ||
        order.status === "canceled"
      );
    default:
      return true;
  }
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Daftar pesanan jasa.
 *
 * Kerangkanya sama dengan daftar pesanan produk: judul, pencarian, chip
 * filter, dan kartu. Versi admin memakai komponen yang sama dengan tautan
 * ruang pesanan yang berbeda.
 */
export function ServiceOrderList({
  orders,
  viewer,
}: {
  orders: ServiceOrder[];
  viewer: "user" | "admin";
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const basePath =
    viewer === "admin"
      ? ROUTES.DASHBOARD.ADMIN_SERVICES
      : ROUTES.DASHBOARD.ORDER_SERVICES;

  const [prevFilters, setPrevFilters] = useState({ searchQuery, filter });
  if (prevFilters.searchQuery !== searchQuery || prevFilters.filter !== filter) {
    setPrevFilters({ searchQuery, filter });
    setCurrentPage(1);
  }

  const counts = useMemo(() => {
    return {
      all: orders.length,
      unpaid: orders.filter((order) => matchesFilter(order, "unpaid")).length,
      working: orders.filter((order) => matchesFilter(order, "working")).length,
      done: orders.filter((order) => matchesFilter(order, "done")).length,
      closed: orders.filter((order) => matchesFilter(order, "closed")).length,
    } satisfies Record<FilterKey, number>;
  }, [orders]);

  const filters: OrderFilter[] = FILTERS.map((item) => ({
    ...item,
    count: counts[item.key],
  }));

  const visible = orders.filter((order) => {
    if (!matchesFilter(order, filter)) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      order.service_name.toLowerCase().includes(query) ||
      order.order_id.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(visible.length / itemsPerPage);
  const pageItems = visible.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <OrderListHeader
        title={viewer === "admin" ? "Pesanan Jasa Masuk" : "Pesanan Jasa"}
        description={
          viewer === "admin"
            ? "Semua pesanan layanan berkas lamaran. Buka ruang pesanan untuk chat dan mengunggah hasil."
            : "Pantau progres, chat admin, dan unduh berkas hasil dari satu tempat."
        }
        searchPlaceholder="Cari layanan atau ID pesanan..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        action={
          viewer === "user" ? (
            <Link
              href={ROUTES.SERVICES}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "nb-sm nb-press h-10 shrink-0 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
              )}
            >
              <PlusIcon className="mr-1.5 size-4" /> Pesan layanan
            </Link>
          ) : null
        }
      />

      <OrderFilterChips
        filters={filters}
        value={filter}
        onChange={(key) => setFilter(key as FilterKey)}
        label="Filter pesanan jasa"
      />

      {pageItems.length === 0 ? (
        <OrderEmptyState
          icon={
            viewer === "admin" ? (
              <FileTextIcon className="size-6" />
            ) : (
              <ShoppingBagIcon className="size-6" />
            )
          }
          title={
            orders.length === 0
              ? viewer === "admin"
                ? "Belum ada pesanan jasa masuk"
                : "Belum ada pesanan jasa"
              : "Tidak ada pesanan yang cocok"
          }
          description={
            viewer === "admin"
              ? orders.length === 0
                ? "Pesanan baru akan muncul di sini setelah klien membayar."
                : "Tidak ada pesanan pada filter atau kata kunci ini."
              : orders.length === 0
                ? "Mulai dari CV ATS Friendly atau surat lamaran. Admin akan mengerjakan bersama kamu lewat chat."
                : searchQuery
                  ? `Tidak ada pesanan yang cocok dengan kata kunci "${searchQuery}".`
                  : "Kamu belum memiliki pesanan dengan status terpilih."
          }
          action={
            viewer === "user" ? (
              orders.length === 0 ? (
                <Link
                  href={ROUTES.SERVICES}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "nb-sm nb-press h-10 px-4 text-xs font-semibold",
                  )}
                >
                  <PlusIcon className="mr-1.5 size-4" /> Lihat katalog jasa
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                  }}
                  className={cn(buttonVariants({ variant: "outline" }), "h-10 text-xs")}
                >
                  Reset pencarian
                </button>
              )
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {pageItems.map((order) => {
            const closed =
              order.status === "failed" ||
              order.status === "expired" ||
              order.status === "canceled";

            return (
              <OrderCard
                key={order.order_id}
                orderId={order.order_id}
                status={<ServiceStatusBadge status={order.status} />}
                title={order.service_name}
                description={order.brief}
                meta={
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon className="size-3.5" /> {formatDate(order.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquareIcon className="size-3.5" />{" "}
                      {order.language.toUpperCase()}
                    </span>
                    {order.delivered_at ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2Icon className="size-3.5" /> Hasil tersedia
                      </span>
                    ) : null}
                  </>
                }
                amount={formatRupiah(Number(order.amount))}
                muted={closed}
                visual={
                  <span className="flex size-11 items-center justify-center rounded-md border-2 border-ink bg-butter text-on-accent">
                    <FileTextIcon className="size-5" />
                  </span>
                }
                actions={
                  <>
                    {order.status === "success" && order.result_file_url ? (
                      <a
                        href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1.5",
                        )}
                      >
                        <DownloadIcon className="size-3.5" /> Unduh hasil
                      </a>
                    ) : null}
                    <Link
                      href={`${basePath}/${order.order_id}`}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "gap-1.5",
                      )}
                    >
                      Buka ruang pesanan <ArrowRight className="size-3.5" />
                    </Link>
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {visible.length > 0 ? (
        <OrderListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </div>
  );
}
