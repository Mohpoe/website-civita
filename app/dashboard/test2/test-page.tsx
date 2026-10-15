"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheckIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, Loader2, ShoppingBagIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Import Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

import { toast } from "@/components/ui/toast";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/types/global";

interface DashboardProductsProps {
  products: Product[],
}

export default function DashboardProducts({ products }: DashboardProductsProps) {
  // Dialog/Modal State
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Midtrans Script Injector
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil((products?.length ?? 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (products ?? []).slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Fungsi Pembuka Modal (Mencegah bubbling ganda)
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialog(true);
  };

  // #region Checkout Handler
  const checkoutHandler = async () => {
    if (!selectedProduct || detailDialog === false || isProcessing) return;

    setIsProcessing(true); // Kunci tombol agar tidak di-spam klik

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Tutup dialog saat memanggil Midtrans Snap
      setDetailDialog(false);

      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          console.log("Pembayaran Berhasil!", result);
          toast.add({
            title: "Pembayaran Berhasil! 🎉",
            description: "Silakan cek tab 'Pesanan Saya' untuk mengunduh produk.",
            type: "success",
          });
          setIsProcessing(false);
        },
        onPending: function (result: any) {
          console.log("Menunggu Pembayaran", result);
          toast.add({
            title: "Pesanan Dibuat",
            description: "Silakan selesaikan pembayaran di tab 'Pesanan Saya'.",
            type: "info",
          });
          setIsProcessing(false);
        },
        onError: function (result: any) {
          console.error("Pembayaran Gagal", result);
          toast.add({
            title: "Pembayaran Gagal",
            description: "Terjadi kesalahan pada sistem bank/e-wallet. Silakan coba lagi.",
            type: "error",
            priority: "high"
          });
          setIsProcessing(false);
        },
        onClose: function () {
          // Buka blokir loading jika user klik X tutup popup snap
          setIsProcessing(false);
        }
      });
    } catch (error: any) {
      console.error("Gagal memproses checkout:", error);
      toast.add({
        title: "Sistem Sibuk",
        description: error.message || "Gagal menghubungi server. Periksa koneksi internet Anda.",
        type: "error",
        priority: "high"
      });
      setIsProcessing(false);
    }
  };
  // #endregion

  // Parse fitur dengan aman
  const featureList = typeof selectedProduct?.features === "string"
    ? JSON.parse(selectedProduct.features || "[]")
    : (selectedProduct?.features || []);

  return (
    <>
      <div className="w-full font-mono text-foreground space-y-8">
        {
          // #region Header Section
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border/40">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Katalog Eksklusif
              </h2>
              <p className="text-muted-foreground max-w-2xl text-base">
                Akselerasikan karirmu dengan berbagai produk digital dari CIVITA!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1.5 text-sm rounded-full bg-primary/5 border-primary/20 text-primary font-medium">
                ✨ {(products?.length ?? 0)} Produk Tersedia
              </Badge>
            </div>
          </div>
          // #endregion
        }

        {/* Empty State */}
        {(products?.length ?? 0) === 0 ? (
          <div className="bg-background/50 backdrop-blur-sm rounded-3xl border border-dashed border-muted-foreground/30 min-h-[400px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-foreground/5 relative overflow-hidden">
              <ShoppingBagIcon className="w-10 h-10 text-muted-foreground/40 absolute z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Etalase Kosong</h3>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Kami sedang meracik produk digital terbaik untuk Anda. Silakan kembali lagi nanti untuk melihat pembaruan katalog.
            </p>
          </div>
        ) : (
          <>
            {
              // #region Produk Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {currentItems.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                      onClick={() => openProductModal(product)}
                      className="relative flex flex-col bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Gambar/Cover Section */}
                      <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-60">
                            <FileTextIcon className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Gradient Overlay Premium */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300" />

                        {/* Badge Kategori & Harga Floating */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                          <Badge className="bg-background/90 hover:bg-background/90 text-foreground backdrop-blur-md border-none shadow-sm font-semibold tracking-wide uppercase text-[10px]">
                            {product.category?.name || "Digital"}
                          </Badge>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col">
                          <h3 className="font-bold text-xl text-white leading-tight line-clamp-2 drop-shadow-md">
                            {product.title}
                          </h3>
                        </div>
                      </div>

                      {/* Deskripsi & Aksi Section */}
                      <div className="p-5 flex flex-col flex-1 bg-card">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
                          {product.short_desc}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border/60">
                          <span className="font-extrabold text-lg tracking-tight">
                            {formatRupiah(product.price)}
                          </span>

                          <Button
                            className="rounded-full"
                            variant="secondary"
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              // #endregion
            }

            {
              // #region Pagination
              totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">
                    Menampilkan <span className="text-foreground">{indexOfFirstItem + 1}</span> - <span className="text-foreground">{Math.min(indexOfLastItem, (products?.length ?? 0))}</span> dari <span className="text-foreground">{(products?.length ?? 0)}</span> produk
                  </p>

                  <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-full border border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-9 h-9 hover:bg-background shadow-sm disabled:opacity-30 disabled:shadow-none"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center px-2 gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 ${currentPage === i + 1
                            ? "bg-foreground text-background shadow-md scale-105"
                            : "text-muted-foreground hover:bg-background hover:text-foreground"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-9 h-9 hover:bg-background shadow-sm disabled:opacity-30 disabled:shadow-none"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
              // #endregion
            }
          </>
        )}
      </div>

      {
        // #region Modal
        <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
          <DialogContent className="w-full md:max-w-2xl overflow-hidden border-border/50 shadow-2xl gap-0">
            {/* Bagian Atas Dialog (Header & Cover) */}
            <div className="relative w-full aspect-[21/9] bg-muted">
              <img
                src={selectedProduct?.image_url}
                alt={selectedProduct?.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient agar tombol X (Close) Shadcn tetap terlihat */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

              <div className="absolute bottom-6 left-6 right-6">
                <Badge className="mb-3 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/10 shadow-sm font-semibold tracking-wide uppercase text-[10px]">
                  {selectedProduct?.category?.name || "Produk Digital"}
                </Badge>
                <DialogTitle className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {selectedProduct?.title}
                </DialogTitle>
              </div>
            </div>

            {/* Bagian Bawah Dialog (Konten) */}
            <div className="px-6 py-6 md:px-8 max-h-[50vh] overflow-y-auto no-scrollbar">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium uppercase tracking-wider">Harga Investasi</p>
                  <h3 className="text-3xl font-extrabold tracking-tight text-primary">
                    {formatRupiah(selectedProduct?.price as number)}
                  </h3>
                </div>
              </div>

              <DialogDescription className="text-base text-foreground/80 leading-relaxed mb-8">
                {selectedProduct?.long_desc || selectedProduct?.short_desc}
              </DialogDescription>

              <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/40">
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <BadgeCheckIcon className="w-4 h-4 text-primary" /> Yang Anda Dapatkan
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {featureList.length > 0 ? (
                    featureList.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm font-medium">
                        <CheckCircle2Icon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground col-span-2 italic">Detail fitur tidak tersedia.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer Dialog (Aksi Beli) */}
            <DialogFooter>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
                🔒 Transaksi aman oleh Midtrans
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <DialogClose render={<Button variant="ghost" className="w-full sm:w-auto rounded-full font-bold px-6" disabled={isProcessing} />}>
                  Nanti Saja
                </DialogClose>

                <Button
                  className="w-full sm:w-auto rounded-full shadow-md font-bold px-8 transition-all hover:scale-105 active:scale-95"
                  onClick={checkoutHandler}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Beli Sekarang"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        // #endregion
      }
    </>
  );
}