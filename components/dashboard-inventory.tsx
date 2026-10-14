"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BadgeCheckIcon, CheckCircle2, ChevronRight, Clock, Download, ImageIcon, Search, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface DashboardInventoryProps {
  orders: Order[]
}

export default function DashboardInventory({ orders }: DashboardInventoryProps) {
  // State
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  // useEffect(() => {
  //   // Gunakan URL production ("https://app.midtrans.com/snap/snap.js") jika web sudah live
  //   const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
  //   const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  //   if (!document.querySelector(`script[src="${snapScript}"]`)) {
  //     const script = document.createElement("script");
  //     script.src = snapScript;
  //     script.setAttribute("data-client-key", clientKey);
  //     script.async = true;
  //     document.body.appendChild(script);
  //   }
  // }, []);

  // Reset pagination ketika tab atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Filter Data berdasarkan Pencarian & Tab Status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "all" || order.status === activeTab;

    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Status Badge Mapper
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 hover:bg-emerald-50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 hover:bg-amber-50">
            <Clock className="w-3.5 h-3.5" /> Menunggu
          </Badge>
        );
      case 'failed':
      default:
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 hover:bg-destructive/10">
            <AlertCircle className="w-3.5 h-3.5" /> Gagal
          </Badge>
        );
    }
  };

  // Fungsi untuk render daftar item pesanan
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
                  ? `Kamu belum memiliki pesanan dengan status ${activeTab === 'success' ? 'Berhasil' : activeTab === 'pending' ? 'Menunggu' : 'Gagal'}.`
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

            return (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:border-foreground/20 transition-colors group">
                  <CardContent className="p-0 sm:p-5 flex flex-col sm:flex-row gap-0 sm:gap-5">

                    {/* Thumbnail Area */}
                    <div className="relative w-full sm:w-32 aspect-video sm:aspect-square sm:rounded-xl overflow-hidden bg-muted shrink-0 border-b sm:border border-border flex items-center justify-center">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt={order.product?.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">• {orderDate}</span>
                          </div>
                          {renderStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-lg leading-tight">
                            {order.product?.title}
                          </h3>

                          {/* UI Limited Edition: Muncul jika is_active false atau produk telah dihapus (null) */}
                          {(order.product?.is_active === false) && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 font-b"
                              title="Produk ini sudah tidak dijual lagi di toko."
                            >
                              <BadgeCheckIcon data-icon="inline-start" /> Edisi Terbatas
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground/50">{order.product?.short_desc}</p>
                        <p className="text-sm text-muted-foreground sm:hidden">{orderDate}</p>
                      </div>

                      {/* Action & Price Area */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                        <span className="font-bold text-base">
                          {formatRupiah(order.amount)}
                        </span>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {order.status === 'success' && (
                            <Button
                              className="w-full sm:w-auto gap-2"
                              onClick={() => window.open(`/api/download?orderId=${order.order_id}`, '_blank')}
                            >
                              <Download className="w-4 h-4" /> Unduh File
                            </Button>
                          )}

                          {order.status === 'pending' && (
                            <Button
                              className="w-full sm:w-auto gap-2"
                              onClick={() => {
                                if (order.snap_token && window.snap) {
                                  window.snap.pay(order.snap_token, {
                                    onSuccess: function (result: any) {
                                      console.log("Pembayaran Berhasil!", result);
                                      // Opsional: Anda bisa menambahkan toast.success di sini
                                      window.location.reload(); // Refresh halaman agar status berubah jadi 'Berhasil'
                                    },
                                    onPending: function (result: any) {
                                      console.log("Menunggu Pembayaran", result);
                                    },
                                    onError: function (result: any) {
                                      console.error("Pembayaran Gagal", result);
                                      toast.add({
                                        type: "error",
                                        description: "Pembayaran gagal diproses. Silakan coba lagi.",
                                        priority: "high",
                                      });
                                    },
                                    onClose: function () {
                                      console.log("Customer menutup popup tanpa menyelesaikan pembayaran");
                                    }
                                  });
                                } else {
                                  toast.add({
                                    type: "error",
                                    description: "Sistem pembayaran sedang dimuat atau koneksi lambat, silakan coba beberapa detik lagi.",
                                    priority: "high",
                                  });
                                }
                              }}
                            >
                              Lanjutkan Pembayaran <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}

                          {order.status === 'failed' && (
                            <Button variant="secondary" className="w-full sm:w-auto gap-2 cursor-not-allowed">
                              Transaksi Dibatalkan
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

  // Fungsi untuk render Pagination Shadcn UI
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Logika pembuatan angka halaman (windowing sederhana)
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
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
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

  return (
    <div className="w-full space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Pesanan Saya</h2>
          <p className="text-muted-foreground">Kelola riwayat transaksimu dan unduh produk digital.</p>
        </div>

        {/* Shadcn Input for Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Percarian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6 overflow-x-auto sm:pb-0 no-scrollbar">
          <TabsList variant="line">
            <TabsTrigger value="all" className="px-4">Semua Pesanan</TabsTrigger>
            {/* <Separator orientation='vertical' /> */}
            <TabsTrigger value="success" className="px-4">Berhasil</TabsTrigger>
            {/* <Separator orientation='vertical' /> */}
            <TabsTrigger value="pending" className="px-4">Menunggu</TabsTrigger>
            {/* <Separator orientation='vertical' /> */}
            <TabsTrigger value="failed" className="px-4">Gagal</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderOrderList()}
        </TabsContent>
        <TabsContent value="success" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderOrderList()}
        </TabsContent>
        <TabsContent value="pending" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderOrderList()}
        </TabsContent>
        <TabsContent value="failed" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderOrderList()}
        </TabsContent>
      </Tabs>

      {/* Render Pagination only if there are items */}
      {filteredOrders.length > 0 && renderPagination()}

    </div>
  );
}