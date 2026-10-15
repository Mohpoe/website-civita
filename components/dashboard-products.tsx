"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AwardIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, PackageSearchIcon, ShoppingBagIcon, TagsIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Import Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { toast } from "@/components/ui/toast";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/types/global";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

interface DashboardProductsProps {
  products: Product[],
}

export default function DashboardProducts({ products }: DashboardProductsProps) {
  const router = useRouter();

  // Dialog/Modal State
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
          router.refresh();
          setIsProcessing(false);
        },
        onPending: function (result: any) {
          console.log("Menunggu Pembayaran", result);
          toast.add({
            title: "Pesanan Dibuat",
            description: "Silakan selesaikan pembayaran di tab 'Pesanan Saya'.",
            type: "info",
          });
          router.refresh();
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
      <div className="space-y-8">
        {
          // #region Header Section
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Katalog Eksklusif
              </h2>
              <p className="text-muted-foreground max-w-2xl text-base">
                Akselerasikan karirmu dengan berbagai produk digital dari CIVITA!
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {(products?.length ?? 0)} Produk Tersedia
            </Badge>
          </div>
          // #endregion
        }

        <Separator />

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
        <Dialog
          open={detailDialog}
          onOpenChange={setDetailDialog}
          modal={true}
        >
          <DialogContent className="sm:max-w-xl">
            {/* 2. Area Teks & Informasi (Diberi padding) */}
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-bold leading-tight">
                {selectedProduct?.title}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed">
                {selectedProduct?.short_desc}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 -mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-5 py-2">
              {/* 1. Area Gambar (Penuh di atas) */}
              <div className="group w-full h-full min-h-60 aspect-video bg-muted relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct?.image_url}
                  alt={selectedProduct?.title}
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-250"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="flex gap-2 bg-secondary/70 backdrop-blur-sm" variant="secondary">
                    <TagsIcon /> {selectedProduct?.category?.name || "Produk Digital"}
                  </Badge>
                </div>
              </div>

              {/* Grid Informasi Metadata */}
              <div className="space-y-2 bg-muted/50 p-3 rounded-2xl border">
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <AwardIcon className="w-4 h-4 text-primary" /> Yang Anda Dapatkan
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {featureList.length > 0 ? (
                    featureList.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2Icon className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground col-span-2 italic">Detail fitur tidak tersedia.</li>
                  )}
                </ul>
              </div>

              <div className="group p-4 rounded-xl border relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform group-hover:scale-140 group-hover:rotate-6 duration-200">
                  <PackageSearchIcon className="w-32 h-32" />
                </div>
                <h4 className="text-lg font-bold mb-1">Deskripsi produk ini:</h4>
                <p className="text-foreground/80">{selectedProduct?.long_desc}</p>
              </div>
            </div>

            {/* 3. Footer Action */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="w-full sm:w-auto" />}>
                Tutup
              </DialogClose>
              <Button
                className="w-full sm:w-auto"
                onClick={checkoutHandler}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon />
                    Beli Sekarang
                  </>
                )}
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
        // #endregion
      }
    </>
  );
}