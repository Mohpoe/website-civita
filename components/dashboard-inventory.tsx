"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BadgeCheckIcon, CheckCircle2, ChevronRight, Clock, Download, ImageIcon, RefreshCcw, Search, ShoppingBag, UserX, XCircle } from 'lucide-react';
import { useEffect, useState, useMemo, useTransition } from 'react';

// Import Shadcn UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatRupiah } from '@/lib/utils';
import { Order } from '@/types/global';
import { toast } from './ui/toast';
import { useRouter } from 'next/navigation';

interface DashboardInventoryProps {
  orders: Order[]
}

export default function DashboardInventory({ orders: initialOrders }: DashboardInventoryProps) {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<string | null>(null);
  const itemsPerPage = 5;

  // #region LAZY STATUS CHECKING (ZOMBIE ORDER FALLBACK)
  // Hitung ulang status pesanan di memori klien. Jika pesanan 'pending' sudah lebih
  // dari 24 jam (86400000 ms), anggap sebagai 'expired'.
  const orders = useMemo(() => {
    const now = new Date().getTime();
    return initialOrders.map((order) => {
      if (order.status === 'pending') {
        const orderTime = new Date(order.created_at).getTime();
        const diffInMs = now - orderTime;
        if (diffInMs > 86400000) { // 24 Jam
          return { ...order, status: 'expired' as const };
        }
      }
      return order;
    });
  }, [initialOrders]);
  // #endregion

  // Reset pagination ketika tab atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // #region FILTERING LOGIC
  const filteredOrders = orders.filter(order => {
    const productTitle = order.product?.title || "Produk Tidak Tersedia";

    const matchesSearch =
      productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = false;
    if (activeTab === "all") matchesTab = true;
    if (activeTab === "success" && order.status === "success") matchesTab = true;
    if (activeTab === "pending" && (order.status === "pending" || order.status === "challenge")) matchesTab = true;
    // Gabungkan semua jenis kegagalan ke dalam satu tab
    if (activeTab === "failed" && (order.status === "failed" || order.status === "expired" || order.status === "canceled")) matchesTab = true;

    return matchesSearch && matchesTab;
  });
  // #endregion

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // #region Handle Beli Lagi
  const [isReorderPending, startReorderTransition] = useTransition();
  const handleReorder = (productId: string | null, orderId: string) => {
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

        // Refresh halaman agar pesanan baru muncul di daftar paling atas (Pending)
        // dan snap token dijalankan secara otomatis jika diarahkan ke rute pembayaran khusus,
        // atau buka snap popup langsung di sini.
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

      } catch (error: any) {
        toast.add({ type: "error", description: error.message, priority: "high" });
      } finally {
        setIsLoadingCheckout(null);
      }
    })
  };
  // #endregion

  // #region Handle Batal Beli
  const [cancelingId, setCancelingId] = useState<string | null>(null); // Tambahkan state ini

  const handleCancelOrder = async (orderId: string) => {
    setCancelingId(orderId); // Set ID pesanan yang sedang diproses
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

    } catch (error: any) {
      toast.add({ type: "error", description: error.message, priority: "high" });
    } finally {
      setCancelingId(null); // Matikan loading setelah selesai atau gagal
    }
  };
  // #endregion

  // #region Status Badge
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 hover:bg-emerald-50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
          </Badge>
        );
      case 'pending':
      case 'challenge':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 hover:bg-amber-50">
            <Clock className="w-3.5 h-3.5" /> Menunggu
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1.5 hover:bg-muted">
            <Clock className="w-3.5 h-3.5" /> Kedaluwarsa
          </Badge>
        );
      case 'canceled':
      case 'failed':
      default:
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 hover:bg-destructive/10">
            <AlertCircle className="w-3.5 h-3.5" /> Dibatalkan
          </Badge>
        );
    }
  };
  // #endregion

  // #region Order List
  const renderOrderList = () => {
    if (filteredOrders.length === 0) {
      return (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Tidak Ada Pesanan</h3>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm">
              {searchQuery
                ? `Tidak ada pesanan yang cocok dengan kata kunci "${searchQuery}".`
                : activeTab !== "all"
                  ? `Kamu belum memiliki pesanan dengan status terpilih.`
                  : "Sepertinya kamu belum pernah membeli produk digital apapun dari CIVITA."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {currentItems.map((order, idx) => {
            const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const isFailureStatus = order.status === 'failed' || order.status === 'expired' || order.status === 'canceled';

            return (
              <motion.div
                key={`${activeTab}-${order.order_id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className={`overflow-hidden transition-colors group ${isFailureStatus ? 'opacity-80' : 'hover:border-foreground/20'}`}>
                  <CardContent className="p-0 sm:p-5 flex flex-col sm:flex-row gap-0 sm:gap-5">

                    {/* Thumbnail Area */}
                    <div className="relative w-full sm:w-32 aspect-video sm:aspect-square sm:rounded-xl overflow-hidden bg-muted shrink-0 border-b sm:border border-border flex items-center justify-center">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt={order.product?.title}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isFailureStatus ? 'grayscale' : ''}`}
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col justify-between p-4 sm:p-0">
                      <div className="space-y-1 mb-4 sm:mb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs font-normal">
                              {order.order_id}
                            </Badge>
                            {order.clerk_user_deleted_at ? (
                              <Badge
                                variant="destructive"
                                className="text-xs font-normal"
                                title="Akun pelanggan ini telah dihapus dari sistem. Email tetap tersimpan untuk bukti transaksi."
                              >
                                <UserX className="w-3 h-3" /> Akun Tidak Aktif
                              </Badge>
                            ) : null}
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">• {orderDate}</span>
                          </div>
                          {renderStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-lg leading-tight">
                            {order.product?.title || order.product_snapshot?.title || "Produk Tidak Tersedia"}
                          </h3>

                          {(order.product?.is_active === false || order.product_snapshot) && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 font-b"
                              title="Produk ini merupakan edisi terbatas dan tidak lagi tersedia secara umum di toko."
                            >
                              <BadgeCheckIcon data-icon="inline-start" /> Edisi Terbatas
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground/50">{order.product?.short_desc || order.product_snapshot?.short_desc}</p>
                        <p className="text-sm text-muted-foreground sm:hidden">{orderDate}</p>
                      </div>

                      {/* Action & Price Area */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                        <span className="font-bold text-base">
                          {formatRupiah(order.amount)}
                        </span>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {/* JIKA BERHASIL */}
                          {order.status === 'success' && (
                            <Button
                              className="w-full sm:w-auto gap-2"
                              onClick={() => window.open(`/api/download?orderId=${order.order_id}`, '_blank')}
                            >
                              <Download className="w-4 h-4" /> Unduh File
                            </Button>
                          )}

                          {/* JIKA PENDING */}
                          {(order.status === 'pending' || order.status === 'challenge') && (
                            <>
                              <Button
                                variant="outline"
                                className="hidden sm:flex"
                                onClick={() => handleCancelOrder(order.order_id)}
                                disabled={cancelingId === order.order_id}
                              >
                                {cancelingId === order.order_id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                                    Memproses...
                                  </div>
                                ) : (
                                  "Batalkan"
                                )}
                              </Button>
                              <Button
                                className="w-full sm:w-auto gap-2"
                                onClick={() => {
                                  if (order.snap_token && window.snap) {
                                    window.snap.pay(order.snap_token, {
                                      onSuccess: () => window.location.reload(),
                                      onPending: () => window.location.reload(),
                                      onError: () => {
                                        toast.add({
                                          type: "error",
                                          description: "Pembayaran gagal diproses.",
                                          priority: "high",
                                        });
                                      },
                                    });
                                  } else {
                                    toast.add({
                                      type: "error",
                                      description: "Sistem pembayaran sedang dimuat, coba lagi.",
                                      priority: "high",
                                    });
                                  }
                                }}
                              >
                                Bayar Sekarang <ChevronRight className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {/* JIKA EXPIRED / CANCELED / FAILED */}
                          {isFailureStatus && order.product_id && (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto gap-2"
                              onClick={() => handleReorder(order.product_id, order.order_id)}
                              disabled={isLoadingCheckout === order.order_id}
                            >
                              {isLoadingCheckout === order.order_id ? (
                                <span className="animate-spin mr-1">⌛</span>
                              ) : (
                                <RefreshCcw className="w-4 h-4" />
                              )}
                              Beli Lagi
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    );
  };
  // #endregion

  // #region Pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {getPageNumbers().map((page, index) => {
              if (page === 'ellipsis') return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
              return (
                <PaginationItem key={page}>
                  <PaginationLink onClick={() => setCurrentPage(page as number)} isActive={currentPage === page} className="cursor-pointer">
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };
  // #endregion

  // #region Main Page
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Pesanan Saya</h2>
          <p className="text-muted-foreground">Kelola riwayat transaksimu dan unduh produk digital.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama produk atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6 overflow-x-auto sm:pb-0 no-scrollbar">
          <TabsList variant="line">
            <TabsTrigger value="all" className="px-4">Semua Pesanan</TabsTrigger>
            <TabsTrigger value="success" className="px-4">Berhasil</TabsTrigger>
            <TabsTrigger value="pending" className="px-4">Menunggu</TabsTrigger>
            <TabsTrigger value="failed" className="px-4">Batal & Kedaluwarsa</TabsTrigger>
          </TabsList>
        </div>

        {/* Karena isinya sama (renderOrderList yang sudah difilter oleh useMemo di atas),
            kita bisa langsung menempatkannya di semua tab content */}
        <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">{renderOrderList()}</TabsContent>
        <TabsContent value="success" className="m-0 focus-visible:outline-none focus-visible:ring-0">{renderOrderList()}</TabsContent>
        <TabsContent value="pending" className="m-0 focus-visible:outline-none focus-visible:ring-0">{renderOrderList()}</TabsContent>
        <TabsContent value="failed" className="m-0 focus-visible:outline-none focus-visible:ring-0">{renderOrderList()}</TabsContent>
      </Tabs>

      {filteredOrders.length > 0 && renderPagination()}
    </div>
  );
  // #endregion
}