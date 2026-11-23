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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import type { Order } from "@/types/global";
import {
  BadgeCheckIcon,
  ChevronRight,
  Clock,
  Download,
  ImageIcon,
  RefreshCcw,
  ShoppingBag,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "./ui/toast";

type ProductFilter = "all" | "success" | "pending" | "failed";

interface DashboardInventoryProps {
  orders: Order[];
}

/**
 * Daftar pesanan produk digital.
 *
 * Memakai kerangka daftar pesanan yang sama dengan pesanan jasa supaya kedua
 * halaman terasa satu keluarga: judul, pencarian, chip filter, dan kartu.
 */
export default function DashboardInventory({
  orders: initialOrders,
}: DashboardInventoryProps) {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<ProductFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const itemsPerPage = 5;

  const orders = initialOrders;

  // Reset halaman saat filter atau pencarian berubah, tanpa effect tambahan.
  const [prevFilters, setPrevFilters] = useState({ searchQuery, activeFilter });
  if (
    prevFilters.searchQuery !== searchQuery ||
    prevFilters.activeFilter !== activeFilter
  ) {
    setPrevFilters({ searchQuery, activeFilter });
    setCurrentPage(1);
  }

  const filteredOrders = orders.filter((order) => {
    const productTitle =
      order.product?.title ||
      order.product_snapshot?.title ||
      "Produk Tidak Tersedia";

    const matchesSearch =
      productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = false;
    if (activeFilter === "all") matchesFilter = true;
    if (activeFilter === "success" && order.status === "success") matchesFilter = true;
    if (
      activeFilter === "pending" &&
      (order.status === "pending" || order.status === "challenge")
    ) {
      matchesFilter = true;
    }
    if (
      activeFilter === "failed" &&
      (order.status === "failed" ||
        order.status === "expired" ||
        order.status === "canceled")
    ) {
      matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const filters: OrderFilter[] = [
    { key: "all", label: "Semua", count: orders.length },
    {
      key: "success",
      label: "Berhasil",
      count: orders.filter((order) => order.status === "success").length,
    },
    {
      key: "pending",
      label: "Menunggu",
      count: orders.filter(
        (order) => order.status === "pending" || order.status === "challenge",
      ).length,
    },
    {
      key: "failed",
      label: "Batal & Kedaluwarsa",
      count: orders.filter(
        (order) =>
          order.status === "failed" ||
          order.status === "expired" ||
          order.status === "canceled",
      ).length,
    },
  ];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const [, startReorderTransition] = useTransition();

  const handleReorder = (productId: string | null, orderId: string) => {
    if (!productId) return;

    const alreadyPurchased = orders.some(
      (order) =>
        (order.product_id === productId ||
          order.product_snapshot_id === productId) &&
        order.status === "success",
    );

    if (alreadyPurchased) {
      toast.add({
        title: "Produk Sudah Dibeli",
        description:
          "Kamu sudah memiliki produk ini. Buka Pesanan Saya → Produk untuk mengunduh berkasnya.",
        type: "error",
        priority: "high",
      });
      router.push(ROUTES.DASHBOARD.ORDER_PRODUCTS);
      return;
    }

    startReorderTransition(async () => {
      setIsLoadingCheckout(orderId);
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal membuat pesanan baru");
        }

        if (data.token && window.snap) {
          window.snap.pay(data.token, {
            onSuccess: () => window.location.reload(),
            onPending: () => window.location.reload(),
            onError: () => window.location.reload(),
            onClose: () => window.location.reload(),
          });
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.add({
          type: "error",
          description: getErrorMessage(error),
          priority: "high",
        });
      } finally {
        setIsLoadingCheckout(null);
      }
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancelingId(orderId);
    try {
      const response = await fetch("/api/order/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membatalkan pesanan");
      }

      toast.add({ type: "success", description: "Pesanan berhasil dibatalkan." });
      router.refresh();
    } catch (error) {
      toast.add({
        type: "error",
        description: getErrorMessage(error),
        priority: "high",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handlePayOrder = async (orderId: string) => {
    setPayingId(orderId);
    try {
      const response = await fetch("/api/order/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyiapkan pembayaran");
      }

      if (data.replacedOrderId) {
        toast.add({
          type: "info",
          description:
            "Pesanan sebelumnya sudah tidak aktif. Kami buatkan pesanan baru untukmu.",
        });
      }

      if (!window.snap) {
        toast.add({
          type: "info",
          description: "Pembayaran belum siap. Coba lagi sebentar lagi.",
          priority: "high",
        });
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => window.location.reload(),
        onPending: () => window.location.reload(),
        onError: () => {
          toast.add({
            type: "error",
            description: "Pembayaran gagal diproses.",
            priority: "high",
          });
        },
        onClose: () => window.location.reload(),
      });
    } catch (error) {
      toast.add({
        type: "error",
        description: getErrorMessage(error),
        priority: "high",
      });
      router.refresh();
    } finally {
      setPayingId(null);
    }
  };

  const renderOrderList = () => {
    if (filteredOrders.length === 0) {
      const hasFilter = Boolean(searchQuery) || activeFilter !== "all";

      return (
        <OrderEmptyState
          icon={<ShoppingBag className="size-6" />}
          title={hasFilter ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
          description={
            searchQuery
              ? `Tidak ada pesanan yang cocok dengan kata kunci "${searchQuery}".`
              : activeFilter !== "all"
                ? "Kamu belum memiliki pesanan dengan status terpilih."
                : `Sepertinya kamu belum pernah membeli produk digital dari ${APP_CONFIG.NAME}. Mulai dari katalog produk untuk melihat template yang tersedia.`
          }
          action={
            hasFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Reset pencarian
              </Button>
            ) : (
              <Link
                href={ROUTES.PRODUCTS}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "nb-sm nb-press h-10 px-4 text-xs font-semibold",
                )}
              >
                <ShoppingBag className="mr-1.5 size-4" /> Jelajahi katalog produk
              </Link>
            )
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {currentItems.map((order) => {
          const orderDate = new Date(order.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          const isFailureStatus =
            order.status === "failed" ||
            order.status === "expired" ||
            order.status === "canceled";

          const imageUrl =
            order.product?.image_url || order.product_snapshot?.image_url;

          return (
            <OrderCard
              key={`${activeFilter}-${order.order_id}`}
              orderId={order.order_id}
              status={<ServiceStatusBadge status={order.status} />}
              title={
                order.product?.title ||
                order.product_snapshot?.title ||
                "Produk Tidak Tersedia"
              }
              description={
                order.product?.short_desc || order.product_snapshot?.short_desc
              }
              meta={
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {orderDate}
                  </span>
                  {order.clerk_user_deleted_at ? (
                    <span className="inline-flex items-center gap-1.5">
                      <UserX className="size-3.5" /> Akun tidak aktif
                    </span>
                  ) : null}
                </>
              }
              amount={formatRupiah(order.amount)}
              muted={isFailureStatus}
              secondaryBadge={
                order.product?.is_active === false || order.product_snapshot ? (
                  <Badge
                    variant="outline"
                    className="border-ink/20 bg-lilac font-semibold text-on-accent"
                    title="Produk ini edisi terbatas dan tidak lagi tersedia secara umum di toko."
                  >
                    <BadgeCheckIcon data-icon="inline-start" /> Edisi Terbatas
                  </Badge>
                ) : null
              }
              visual={
                imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- gambar produk berasal dari penyimpanan eksternal
                  <img
                    src={imageUrl}
                    alt={
                      order.product?.title ||
                      order.product_snapshot?.title ||
                      "Produk"
                    }
                    className={cn(
                      "size-full object-cover",
                      isFailureStatus && "grayscale",
                    )}
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="size-7 text-ink-soft/40" />
                )
              }
              actions={
                <>
                  {order.status === "success" ? (
                    <Button
                      className="gap-2"
                      onClick={() =>
                        window.open(
                          `/api/download?orderId=${order.order_id}`,
                          "_blank",
                        )
                      }
                    >
                      <Download className="size-4" /> Unduh Berkas
                    </Button>
                  ) : null}

                  {order.status === "pending" || order.status === "challenge" ? (
                    <>
                      {order.status === "pending" ? (
                        <Button
                          variant="outline"
                          className="hidden sm:flex"
                          onClick={() => handleCancelOrder(order.order_id)}
                          disabled={cancelingId === order.order_id}
                        >
                          {cancelingId === order.order_id ? "Memproses..." : "Batalkan"}
                        </Button>
                      ) : null}
                      <Button
                        className="gap-2"
                        onClick={() => handlePayOrder(order.order_id)}
                        disabled={payingId === order.order_id}
                      >
                        {payingId === order.order_id ? (
                          "Menyiapkan..."
                        ) : (
                          <>
                            Bayar Sekarang <ChevronRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </>
                  ) : null}

                  {isFailureStatus &&
                  (order.product_id || order.product_snapshot_id) ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        handleReorder(
                          order.product_id || order.product_snapshot_id,
                          order.order_id,
                        )
                      }
                      disabled={isLoadingCheckout === order.order_id}
                    >
                      <RefreshCcw className="size-4" /> Beli Lagi
                    </Button>
                  ) : null}
                </>
              }
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <OrderListHeader
        title="Pesanan Produk"
        description="Riwayat pembelian produk digital, status pembayaran, dan unduhan berkas."
        searchPlaceholder="Cari nama produk atau ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        action={
          <Link
            href={ROUTES.PRODUCTS}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "nb-sm nb-press h-10 shrink-0 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
            )}
          >
            <ShoppingBag className="mr-1.5 size-4" /> Katalog produk
          </Link>
        }
      />

      <OrderFilterChips
        filters={filters}
        value={activeFilter}
        onChange={(key) => setActiveFilter(key as ProductFilter)}
        label="Filter pesanan produk"
      />

      {renderOrderList()}

      {filteredOrders.length > 0 ? (
        <OrderListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </div>
  );
}
