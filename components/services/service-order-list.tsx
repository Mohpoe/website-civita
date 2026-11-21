"use client";

import { ServiceStatusBadge } from "@/components/services/service-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import type { ServiceOrder } from "@/types/global";
import { cn, formatRupiah } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
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
      return order.status === "failed" || order.status === "expired" || order.status === "canceled";
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

export function ServiceOrderList({
  orders,
  viewer,
}: {
  orders: ServiceOrder[];
  viewer: "user" | "admin";
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const basePath = viewer === "admin" ? ROUTES.DASHBOARD.ADMIN_SERVICES : ROUTES.DASHBOARD.SERVICES;

  const counts = useMemo(() => {
    return {
      all: orders.length,
      unpaid: orders.filter((order) => matchesFilter(order, "unpaid")).length,
      working: orders.filter((order) => matchesFilter(order, "working")).length,
      done: orders.filter((order) => matchesFilter(order, "done")).length,
      closed: orders.filter((order) => matchesFilter(order, "closed")).length,
    } satisfies Record<FilterKey, number>;
  }, [orders]);

  const visible = orders.filter((order) => matchesFilter(order, filter));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBagIcon className="size-5" />
                {viewer === "admin" ? "Pesanan Jasa Masuk" : "Pesanan Jasa Saya"}
              </CardTitle>
              <CardDescription>
                {viewer === "admin"
                  ? "Semua pesanan layanan berkas lamaran. Buka ruang pesanan untuk chat dan mengunggah hasil."
                  : "Pantau progres, chat admin, dan unduh berkas hasil dari satu tempat."}
              </CardDescription>
            </div>

            {viewer === "user" ? (
              <Link
                href={`${ROUTES.DASHBOARD.SERVICES}/new`}
                className={cn(buttonVariants({ variant: "default" }), "shrink-0")}
              >
                <PlusIcon className="size-4" /> Pesan layanan
              </Link>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                  filter === item.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {item.label}
                <span className="tabular-nums opacity-70">{counts[item.key]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
              <ShoppingBagIcon className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {orders.length === 0 ? "Belum ada pesanan jasa." : "Tidak ada pesanan di filter ini."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewer === "admin"
                    ? "Pesanan baru akan muncul di sini setelah klien membayar."
                    : "Mulai dari CV ATS Friendly atau surat lamaran. Admin akan mengerjakan bersama kamu lewat chat."}
                </p>
              </div>
              {viewer === "user" && orders.length === 0 ? (
                <Link
                  href={`${ROUTES.DASHBOARD.SERVICES}/new`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <PlusIcon className="size-4" /> Pesan sekarang
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {visible.map((order) => (
                <div
                  key={order.order_id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{order.service_name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {order.order_id}
                      </p>
                    </div>
                    <ServiceStatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon className="size-3.5" /> {formatDate(order.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquareIcon className="size-3.5" /> {order.language.toUpperCase()}
                    </span>
                  </div>

                  {order.delivered_at ? (
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2Icon className="size-3.5" /> Berkas hasil sudah tersedia
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                    <span className="text-sm font-bold">{formatRupiah(Number(order.amount))}</span>
                    <div className="flex items-center gap-2">
                      {order.status === "success" && order.result_file_url ? (
                        <a
                          href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          <DownloadIcon className="size-3.5" /> Hasil
                        </a>
                      ) : null}
                      <Link
                        href={`${basePath}/${order.order_id}`}
                        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                      >
                        Buka <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
