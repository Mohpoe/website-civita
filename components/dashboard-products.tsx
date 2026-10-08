"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileTextIcon, XIcon, CheckCircle2Icon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

// 1. Deklarasi global untuk Midtrans agar TypeScript tidak error
declare global {
  interface Window {
    snap: any;
  }
}

// 2. Interface untuk Struktur Data Produk dari Database Neon
interface Product {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  price: number;
  category: string;
  features: string[] | string; // Mengakomodasi JSON string atau array dari DB
  image_url: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCheckout = async () => {
    if (!product) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          console.log("Pembayaran Berhasil!", result);
          onClose();
          alert("Pembayaran berhasil! Silakan cek tab 'Pesanan Saya' untuk mengunduh produk.");
        },
        onPending: function (result: any) {
          console.log("Menunggu Pembayaran", result);
          onClose();
          alert("Pesanan dibuat. Silakan selesaikan pembayaran di tab 'Pesanan Saya'.");
        },
        onError: function (result: any) {
          console.error("Pembayaran Gagal", result);
          setIsProcessing(false);
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error("Gagal memproses checkout:", error);
      alert("Terjadi kesalahan saat memproses pesanan.");
      setIsProcessing(false);
    }
  };

  if (!product) return null;

  // Cek apakah features adalah array, jika dari database berupa string JSON, parse dulu
  const featureList = typeof product.features === "string"
    ? JSON.parse(product.features)
    : (product.features || []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-2xl bg-background border border-foreground/10 shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-muted relative overflow-hidden flex items-center justify-center p-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-contain filter drop-shadow-md" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileTextIcon className="w-16 h-16 text-foreground/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur shadow-sm border-none">
                    {product.category}
                  </Badge>
                </div>
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold tracking-tight pr-8 leading-tight">{product.title}</h2>
                  <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-muted hover:bg-input rounded-full transition-colors shrink-0">
                    <XIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-2xl font-bold text-foreground">{formatRupiah(product.price)}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {product.long_desc}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Yang Kamu Dapatkan</h4>
                    <ul className="space-y-2">
                      {featureList.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2Icon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-foreground/5">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full h-12 rounded-full font-bold text-base shadow-sm group relative overflow-hidden"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                        Beli Sekarang ({formatRupiah(product.price)})
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Pembayaran aman didukung oleh Midtrans.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function ProductStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Gagal memuat produk", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full font-mono text-foreground">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Produk Digital CIVITA</h2>
          <p className="text-muted-foreground">Tingkatkan peluang lolos kerja kamu dengan template dan panduan eksklusif siap pakai.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-foreground rounded-full animate-spin mb-4"></div>
            Memuat daftar produk...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-background rounded-3xl border border-foreground/5 shadow-sm min-h-[300px] flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 shadow-inner border border-foreground/5">
              <ShoppingBagIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Belum Ada Produk</h3>
            <p className="text-muted-foreground max-w-sm">
              Produk digital sedang disiapkan dan akan segera tersedia di toko.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <AnimatePresence mode="popLayout">
                {currentItems.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group bg-background rounded-2xl overflow-hidden border border-foreground/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => openProductDetails(product)}
                  >
                    <div className={`relative aspect-[4/3] bg-muted overflow-hidden`}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                          <div className="w-20 h-24 bg-background/50 backdrop-blur-sm rounded-lg border border-foreground/10 shadow-sm flex items-center justify-center">
                            <FileTextIcon className="w-8 h-8 text-foreground/40" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur text-foreground border-none shadow-sm pointer-events-none">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {product.short_desc}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                        <span className="font-bold text-base">{formatRupiah(product.price)}</span>
                        <Button
                          size="sm"
                          className="rounded-full shadow-sm hover:scale-105 transition-transform px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductDetails(product);
                          }}
                        >
                          Detail
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-foreground/5 pt-6">
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Menampilkan <span className="font-bold text-foreground">{indexOfFirstItem + 1}</span> - <span className="font-bold text-foreground">{Math.min(indexOfLastItem, products.length)}</span> dari <span className="font-bold text-foreground">{products.length}</span> produk
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-9 h-9 border-foreground/10 disabled:opacity-50"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${currentPage === i + 1
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-9 h-9 border-foreground/10 disabled:opacity-50"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}