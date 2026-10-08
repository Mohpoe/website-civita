"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Clock, CheckCircle2, AlertCircle, ShoppingBag, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/global';
import { formatRupiah } from '@/lib/utils';

export default function DashboardInventory() {
  // 3. Terapkan Tipe Data ke dalam State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch Data dari API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Gagal mengambil data');
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Inject Script Snap Midtrans (Jika belum ada, berguna untuk retry pembayaran pending)
    const snapScript = process.env.MIDTRANS_SNAP_URL || "";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Filter Data
  const filteredOrders = orders.filter(order =>
    order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.order_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1.5 py-1">
            <Clock className="w-3.5 h-3.5" /> Menunggu
          </Badge>
        );
      case 'failed':
      default:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 py-1">
            <AlertCircle className="w-3.5 h-3.5" /> Gagal
          </Badge>
        );
    }
  };

  return (
    <div className="w-full font-mono text-foreground space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Pesanan Saya</h2>
          <p className="text-muted-foreground">Kelola riwayat transaksimu dan unduh produk digital.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 rounded-full bg-background border border-foreground/10 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
      </div>

      {/* Main Order List */}
      <div className="bg-background rounded-3xl border border-foreground/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden min-h-[400px] flex flex-col">

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
            <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-foreground rounded-full animate-spin"></div>
            Memuat pesanan Anda...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="flex-1 divide-y divide-foreground/5">
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
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="p-5 sm:p-6 group hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-5"
                  >
                    <div className="relative w-full sm:w-28 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-muted shrink-0 border border-foreground/10 shadow-sm">
                      <img
                        src={order.image_url}
                        alt={order.product_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1 mb-4 sm:mb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{order.order_id}</span>
                            <span className="text-xs text-muted-foreground">• {orderDate}</span>
                          </div>
                          {renderStatusBadge(order.status)}
                        </div>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-zinc-600 transition-colors">
                          {order.product_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Produk Digital CIVITA
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t sm:border-none border-foreground/5">
                        <span className="font-bold text-base bg-muted/50 px-3 py-1 rounded-lg inline-block w-max">
                          {formatRupiah(order.amount)}
                        </span>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {order.status === 'success' && (
                            <Button
                              className="w-full sm:w-auto rounded-full gap-2 shadow-sm font-bold"
                              onClick={() => window.open(`/api/download?orderId=${order.order_id}`, '_blank')}
                            >
                              <Download className="w-4 h-4" /> Unduh Berkas
                            </Button>
                          )}

                          {order.status === 'pending' && (
                            <Button
                              className="w-full sm:w-auto rounded-full gap-2 shadow-sm font-bold bg-foreground text-background hover:bg-foreground/90"
                              onClick={() => {
                                if (order.snap_token && window.snap) {
                                  window.snap.pay(order.snap_token);
                                } else {
                                  alert("Memuat sistem pembayaran, silakan tunggu sebentar...");
                                }
                              }}
                            >
                              Bayar Sekarang <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}

                          {order.status === 'failed' && (
                            <Button variant="outline" className="w-full sm:w-auto rounded-full gap-2 text-muted-foreground cursor-not-allowed">
                              Gagal / Dibatalkan
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4 shadow-inner border border-foreground/5">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Belum Ada Pesanan</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery
                ? `Tidak ada pesanan yang cocok dengan pencarian "${searchQuery}".`
                : "Sepertinya kamu belum pernah membeli produk digital apapun dari CIVITA."}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-muted/30 border-t border-foreground/5 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{indexOfFirstItem + 1}</span> - <span className="font-bold text-foreground">{Math.min(indexOfLastItem, filteredOrders.length)}</span> dari <span className="font-bold text-foreground">{filteredOrders.length}</span> pesanan
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 border-foreground/10 disabled:opacity-50 transition-transform active:scale-95"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 mx-1">
                {[...Array(totalPages)].map((_, i) => {
                  if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage)) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${currentPage === i + 1
                          ? 'bg-foreground text-background shadow-md scale-105'
                          : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                          }`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (i === currentPage - 3 || i === currentPage + 1) {
                    return <span key={i} className="text-muted-foreground px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 border-foreground/10 disabled:opacity-50 transition-transform active:scale-95"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}