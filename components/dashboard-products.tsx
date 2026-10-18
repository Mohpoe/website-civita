"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";
import { Category, Product } from "@/types/global";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUpIcon, ArrowRightIcon, AwardIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, MoveRightIcon, PackageSearchIcon, SearchIcon, ShoppingBagIcon, TagIcon, TagsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";
import { toast } from "./ui/toast";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { ROUTES } from "@/lib/constants";

interface DashboardProductsProps {
  products: Product[],
  categories: Category[],
}

// Konfigurasi Warna Neo-Pop untuk Light & Dark Mode
const NEO_COLORS = [
  { light: '#FFE66D', dark: '#4A4310', textLight: '#151722', textDark: '#FEFCE8' }, // Yellow / Mustard
  { light: '#FF9E79', dark: '#522814', textLight: '#151722', textDark: '#FFF7ED' }, // Orange / Rust
  { light: '#B3A2FF', dark: '#32275C', textLight: '#151722', textDark: '#F5F3FF' }, // Purple / Violet
  { light: '#98F5E1', dark: '#154D40', textLight: '#151722', textDark: '#F0FDFA' }, // Mint / Deep Teal
  { light: '#FFB5E8', dark: '#4D1B3E', textLight: '#151722', textDark: '#FDF2F8' }, // Pink / Plum
  { light: '#B2F0B2', dark: '#1E3E26', textLight: '#151722', textDark: '#F0FDF4' }, // Sage / Forest Green
];

export default function DashboardProducts({ products, categories }: DashboardProductsProps) {
  const router = useRouter();

  // Dialog/Modal State
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // #region Filter & Sort States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Reset pagination ke halaman 1 setiap kali user mengubah pencarian, filter, atau sort
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Ekstrak daftar kategori unik dari data produk untuk tombol filter
  const activeCategories = useMemo(() => {
    if (!categories || !products) return [];
    return categories
      .map((cat) => {
        // Hitung produk yang memakai nama kategori ini
        const count = products.filter((p) => p.category?.name === cat.name).length;
        return { ...cat, count };
      })
      // Saring agar hanya merender kategori yang memiliki 1 produk atau lebih
      .filter((cat) => cat.count > 0);
  }, [categories, products]);

  // Logika Filter dan Sortir (Pre-compute)
  const processedProducts = useMemo(() => {
    let result = [...(products || [])];

    // 1. Jalankan Pencarian Teks
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.short_desc && p.short_desc.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Jalankan Filter Kategori
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category?.name === selectedCategory);
    }

    // 3. Jalankan Sortir Harga
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price); // Termurah
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price); // Termahal
    }
    // Jika 'newest' (default), kita biarkan urutan dari DB (karena biasanya sudah DESC dari kueri backend)

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);
  // #endregion

  // Pagination Logic (Diarahkan ke processedProducts, BUKAN products mentah)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil((processedProducts?.length ?? 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (processedProducts ?? []).slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const openProductModal = (product: Product, idx: number) => {
    setSelectedProduct(product);
    setSelectedColorIdx(idx % NEO_COLORS.length);
    setDetailDialog(true);
  };

  // #region Checkout Handler
  const checkoutHandler = async () => {
    if (!selectedProduct || detailDialog === false || isProcessing) return;

    setIsProcessing(true);

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
          router.push(ROUTES.DASHBOARD.INVENTORY);
          router.refresh();
        },
        onPending: function (result: any) {
          console.log("Menunggu Pembayaran", result);
          toast.add({
            title: "Pesanan Dibuat",
            description: "Silakan selesaikan pembayaran di tab 'Pesanan Saya'.",
            type: "info",
          });
          setIsProcessing(false);
          router.push(ROUTES.DASHBOARD.INVENTORY);
          router.refresh();
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

  const featureList = typeof selectedProduct?.features === "string"
    ? JSON.parse(selectedProduct.features || "[]")
    : (selectedProduct?.features || []);

  const activeDialogTheme = NEO_COLORS[selectedColorIdx];
  const dialogStyleProps = {
    "--bg-light": activeDialogTheme.light,
    "--bg-dark": activeDialogTheme.dark,
    "--text-light": activeDialogTheme.textLight,
    "--text-dark": activeDialogTheme.textDark,
  } as React.CSSProperties;

  const categoryItems = [
    { value: "all", label: `Semua Kategori (${products?.length || 0})` },
    ...(activeCategories || []).map(cat => ({ value: cat.name, label: `${cat.name} (${cat.count})` }))
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Katalog Produk
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Akselerasikan karirmu dengan berbagai produk digital dari CIVITA!
            </p>
          </div>

          {/* Search Input Neo-Pop menggantikan teks Badge statis */}
          <div className="w-full lg:w-80 shrink-0">
            <InputGroup className="w-full h-10 px-2 rounded-none border-2 !border-foreground font-bold bg-card shadow-[4px_4px_0_0] shadow-foreground has-[:focus]:outline-none has-[:focus]:translate-y-[2px] has-[:focus]:shadow-[2px_2px_0_0] shadow-foreground transition-all !ring-offset-0 !ring-0">
              <InputGroupInput
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <Separator className="border-border" />

        {(products?.length ?? 0) > 0 && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-3.5 rounded-none border-4 border-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all">

            {
              // #region Filter Category
              activeCategories.length <= 6 ? (
                <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2 pb-1 md:pb-0">
                  <Button
                    onClick={() => setSelectedCategory("all")}
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className={`rounded-none border-2 font-bold px-5 shrink-0 transition-all ${selectedCategory === "all"
                      ? "border-foreground"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    Semua ({products?.length || 0})
                  </Button>
                  {/* Looping langsung dari database (categories) */}
                  {activeCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      variant={selectedCategory === cat.name ? "default" : "outline"}
                      className={`rounded-none border-2 font-bold px-5 shrink-0 transition-all ${selectedCategory === cat.name
                        ? "border-foreground"
                        : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      {cat.name} ({cat.count})
                    </Button>
                  ))}
                </div>
              ) : (
                /* Fallback Kategori Banyak (> 6) */
                <div className="w-full md:w-64">
                  <Select
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val || "all")}
                    items={categoryItems}
                  >
                    <SelectTrigger className="w-full rounded-none border-2 border-foreground font-bold bg-background h-10">
                      <div className="flex items-center gap-2 truncate">
                        <TagsIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="Pilih Kategori" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-foreground font-bold shadow-[4px_4px_0_0] shadow-foreground max-h-60">
                      <SelectItem value="all">Semua Kategori ({products?.length || 0})</SelectItem>
                      {/* Looping langsung dari database (categories) */}
                      {activeCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
              // #endregion
            }
            {
              // #region Price Sort
              <div className="w-full md:w-56 shrink-0">
                <Select
                  value={sortBy}
                  onValueChange={(val) => setSortBy(val || "newest")}
                  items={[
                    { value: "newest", label: "Terbaru" },
                    { value: "price_asc", label: "Harga Terendah" },
                    { value: "price_desc", label: "Harga Tertinggi" },
                  ]}
                >
                  <SelectTrigger className="w-full rounded-none border-2 border-foreground font-bold bg-background h-10">
                    <div className="flex items-center gap-2">
                      <ArrowDownUpIcon className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Urutkan" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-foreground font-bold w-full shadow-[4px_4px_0_0] shadow-foreground rounded-xl">
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="price_asc">Harga Terendah</SelectItem>
                    <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              // #endregion
            }

          </div>
        )}

        {/* Empty State (Disesuaikan untuk kondisi Filter Kosong) */}
        {(processedProducts?.length ?? 0) === 0 ? (
          <div className="bg-background/50 backdrop-blur-sm rounded-[2.2rem] border-2 border-dashed border-muted-foreground/30 min-h-[400px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-foreground/5 relative overflow-hidden">
              {searchQuery.trim() !== "" ? (
                <SearchIcon className="w-10 h-10 text-muted-foreground/40 absolute z-10" />
              ) : (
                <ShoppingBagIcon className="w-10 h-10 text-muted-foreground/40 absolute z-10" />
              )}
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              {searchQuery.trim() !== ""
                ? "Pencarian Tidak Ditemukan"
                : products.length > 0 ? "Produk Tidak Ditemukan" : "Produk Belum Tersedia"}
            </h3>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              {searchQuery.trim() !== ""
                ? `Tidak ada produk yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                : products.length > 0
                  ? `Tidak ada produk yang cocok dengan kategori "${selectedCategory}". Silakan pilih kategori lain.`
                  : "Saat ini belum ada produk yang tersedia di katalog ini, silakan kembali lagi nanti."}
            </p>
          </div>
        ) : (
          <>
            {
              // #region Product Grid
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {currentItems.map((product, idx) => {
                    const theme = NEO_COLORS[idx % NEO_COLORS.length];
                    const rotationClass = idx % 2 === 0 ? 'rotate-2' : '-rotate-2';

                    const styleProps = {
                      "--bg-light": theme.light,
                      "--bg-dark": theme.dark,
                      "--text-light": theme.textLight,
                      "--text-dark": theme.textDark,
                    } as React.CSSProperties;

                    return (
                      <motion.article
                        key={product.id}
                        style={styleProps}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: (idx % itemsPerPage) * 0.09, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => openProductModal(product, idx)}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-foreground/10 dark:hover:border-white/10 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-light)] dark:text-[var(--text-dark)]"
                      >
                        <div>
                          {/* Header Kartu */}
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold tracking-wider text-background">
                              <TagIcon className="w-3.5 h-3.5" /> {product.category?.name || "Digital"}
                            </span>
                            <span className="text-lg font-bold">
                              {formatRupiah(product.price)}
                            </span>
                          </div>

                          {/* Gambar Quirky dengan Border Putih/Gelap */}
                          <div className={`relative mt-6 ${rotationClass} overflow-hidden rounded-2xl border-4 border-white dark:border-foreground shadow-md transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-105 bg-white dark:bg-card`}>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.title}
                                loading="lazy"
                                className="aspect-[5/4] w-full object-cover"
                              />
                            ) : (
                              <div className="aspect-[5/4] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                                <FileTextIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                              </div>
                            )}
                          </div>

                          {/* Judul */}
                          <h3 className="mt-6 text-2xl font-bold leading-snug line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="mt-2 text-sm font-medium leading-relaxed opacity-75 line-clamp-2">
                            {product.short_desc}
                          </p>
                        </div>

                        {/* Tombol Magnetik */}
                        <div className="mt-8">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 dark:bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-black transition-all duration-300 group-hover:bg-white group-hover:text-black dark:group-hover:bg-slate-900 dark:group-hover:text-white border-2 border-transparent group-hover:border-slate-950 dark:group-hover:border-slate-50 hover:scale-105">
                            Lihat Detail
                            <MoveRightIcon className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
              // #endregion
            }

            {
              // #region Pagination
              totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">
                    Menampilkan <span className="text-foreground">{indexOfFirstItem + 1}</span> - <span className="text-foreground">{Math.min(indexOfLastItem, (processedProducts?.length ?? 0))}</span> dari <span className="text-foreground">{(processedProducts?.length ?? 0)}</span> produk
                  </p>

                  <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-full border border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-9 h-9 hover:bg-background shadow-sm disabled:opacity-30"
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
                      className="rounded-full w-9 h-9 hover:bg-background shadow-sm disabled:opacity-30"
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
        // #region Detail Dialog
        <Dialog open={detailDialog} onOpenChange={setDetailDialog} modal={true}>
          <DialogContent
            style={dialogStyleProps}
            className="sm:max-w-xl p-0 overflow-hidden max-h-screen border-4 border-foreground rounded-4xl"
          >
            <div className="flex flex-col gap-4 no-scrollbar max-h-[80vh] overflow-y-auto">
              {/* Header Bawaan (Tersembunyi secara visual, untuk Screen Reader) */}
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedProduct?.title}</DialogTitle>
                <DialogDescription>{selectedProduct?.short_desc}</DialogDescription>
              </DialogHeader>

              {/* Area Top Banner Warna-warni */}
              <div className="w-full px-6 py-8 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] border-b-4 border-foreground flex items-center justify-center">
                {/* Gambar Miring di Dalam Modal */}
                <div className="w-[75%] relative rotate-2 hover:rotate-0 transition-transform duration-500 rounded-2xl overflow-hidden border-4 border-white dark:border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] bg-card aspect-[5/4] flex items-center justify-center">
                  {selectedProduct?.image_url ? (
                    <img
                      src={selectedProduct?.image_url}
                      alt={selectedProduct?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileTextIcon className="w-16 h-16 text-muted-foreground/30" />
                  )}
                </div>
              </div>

              {/* Konten Scrollable */}
              <div className="flex flex-col gap-5 px-6">
                <div className="flex flex-row justify-between items-center">
                  <div className="font-extrabold text-2xl text-foreground">
                    {formatRupiah(selectedProduct?.price || 0)}
                  </div>

                  <Badge className="bg-foreground/90 text-background border-none px-3 py-3">
                    <TagsIcon className="w-3.5 h-3.5 mr-2" /> {selectedProduct?.category?.name || "Digital"}
                  </Badge>
                </div>

                {/* Area Judul Utama */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-foreground tracking-tight">
                    {selectedProduct?.title}
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                    {selectedProduct?.short_desc}
                  </p>
                </div>

                {/* Fitur Box Neo-Brutalism */}
                <div className="bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-light)] dark:text-[var(--text-dark)] p-4 rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0] shadow-foreground">
                  <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-3">
                    <AwardIcon className="w-5 h-5" /> Yang Anda Dapatkan
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {featureList.length > 0 ? (
                      featureList.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold">
                          <CheckCircle2Icon className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm opacity-70 col-span-2 italic font-medium">Detail fitur tidak tersedia.</li>
                    )}
                  </ul>
                </div>

                {/* Area Deskripsi Panjang */}
                {selectedProduct?.long_desc && (
                  <div className="p-5 rounded-2xl border-2 border-dashed border-border relative group bg-[var(--bg-light)]/10 dark:bg-[var(--bg-dark)]/10">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-125 group-hover:rotate-6 duration-300">
                      <PackageSearchIcon className="w-24 h-24" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-foreground/70">Deskripsi Lengkap</h4>
                    <p className="text-foreground/80 text-sm leading-relaxed">{selectedProduct?.long_desc}</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pb-8 px-8 border-t-2 pt-6 mt-2">
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <DialogClose render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-bold border-2 border-foreground hover:scale-110 transition-transform"
                  />
                }>
                  Batal
                </DialogClose>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full font-bold !border-2 !border-foreground hover:scale-110 transition-transform !bg-foreground !text-background hover:!bg-foreground hover:!text-background"
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
                      <ShoppingBagIcon className="w-4 h-4" />
                      Beli Sekarang
                    </>
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