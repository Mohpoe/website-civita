"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, SparklesIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  price: number;
  category: string;
  features: string[];
  imageSrc: string;
  imageColor: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardProducs() {
  const PRODUCTS = [
    {
      id: "prod_1",
      title: "Template CV ATS - Bundle Corporate",
      shortDesc: "3 varian template CV ATS Word (.docx) siap pakai untuk melamar ke BUMN.",
      longDesc: "Bundle komprehensif yang berisi 3 variasi template CV ATS-Friendly (Bahasa Indonesia & English) dengan panduan pengisian instruktif di dalamnya. Format Microsoft Word (.docx) sehingga sangat mudah diedit tanpa perlu skill desain.",
      price: 35000,
      category: "Template",
      features: ["3 Template Word (.docx)", "Panduan Pengisian", "Font Family Included", "Lifetime Access"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-zinc-200",
    },
    {
      id: "prod_2",
      title: "E-Book: Rahasia Menembus HRD",
      shortDesc: "Panduan lengkap membuat CV, merespon interview, dan negosiasi gaji.",
      longDesc: "Buku digital 50 halaman yang membongkar rahasia rekrutmen dari sudut pandang HRD. Berisi template jawaban interview jebakan, cara menyusun deskripsi pengalaman kerja, dan taktik negosiasi gaji untuk fresh graduate.",
      price: 75000,
      category: "E-Book",
      features: ["50 Halaman PDF", "Template Jawaban Interview", "Studi Kasus Asli", "Cheat Sheet Negosiasi"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-blue-100",
    },
    {
      id: "prod_3",
      title: "Notion Job Tracker System",
      shortDesc: "Sistem pelacakan lamaran kerja yang terorganisir untuk Notion.",
      longDesc: "Berhenti menggunakan Excel yang membosankan. Gunakan template Notion ini untuk melacak status lamaran kerja, menyimpan database pertanyaan interview, dan mengatur jadwal tes perusahaan dengan rapi.",
      price: 25000,
      category: "Notion",
      features: ["Kanban Board Status", "Database Perusahaan", "Interview Prep Section", "Mudah Dikustomisasi"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-green-100",
    },
    {
      id: "prod_4",
      title: "Cover Letter Pro Templates",
      shortDesc: "5 Template Surat Lamaran Kerja (Cover Letter) yang tidak kaku.",
      longDesc: "Template cover letter yang dirancang untuk berbagai skenario: melamar via email, portal job, fresh graduate, atau berpengalaman. Dilengkapi dengan contoh kalimat pembuka yang memancing HRD untuk membaca CV Anda.",
      price: 20000,
      category: "Template",
      features: ["5 Format Word", "Bahasa ID & EN", "Panduan Menulis di Body Email"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-orange-100",
    },
    {
      id: "prod_5",
      title: "Bundle Desain CV Kreatif",
      shortDesc: "Template CV 2-kolom untuk industri kreatif, agensi, dan startup.",
      longDesc: "Jika Anda melamar ke posisi kreatif (Designer, Marketing, dll), CV ATS kadang terlalu kaku. Bundle ini berisi template CV kreatif yang tetap rapi, elegan, dan menonjolkan visual tanpa mengorbankan readability.",
      price: 45000,
      category: "Template",
      features: ["Format PSD & Canva", "Layout 2 Kolom", "Icon Pack Included"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-purple-100",
    },
    {
      id: "prod_6",
      title: "Interview Prep Workbook",
      shortDesc: "Buku kerja untuk merancang jawaban interview berbasis STAR method.",
      longDesc: "Latihan praktis menyusun jawaban interview menggunakan metode Situation, Task, Action, Result (STAR). Berisi puluhan prompt dan lembar kerja yang bisa dicetak.",
      price: 30000,
      category: "E-Book",
      features: ["Printable PDF", "STAR Method Framework", "Contoh Jawaban Lolos"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-rose-100",
    },
    {
      id: "prod_7",
      title: "LinkedIn Optimization Guide",
      shortDesc: "Tarik perhatian recruiter dengan profil LinkedIn yang optimal.",
      longDesc: "Panduan step-by-step mengatur headline, about, dan experience di LinkedIn agar profil Anda muncul di pencarian recruiter. Termasuk cara networking yang elegan.",
      price: 40000,
      category: "E-Book",
      features: ["Setting & Keyword SEO", "Networking Template", "Checklist Profil"],
      imageSrc: "/assets/portofolio/cv-ats-1.webp",
      imageColor: "bg-cyan-100",
    },
  ];

  const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
      // Inject Script Snap Midtrans secara dinamis saat modal dirender
      const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

      if (!document.querySelector(`script[src="${snapScript}"]`)) {
        const script = document.createElement("script");
        script.src = snapScript;
        script.setAttribute("data-client-key", clientKey as string);
        script.async = true;
        document.body.appendChild(script);
      }
    }, []);

    const handleCheckout = async () => {
      if (!product) return;
      setIsProcessing(true);

      try {
        // 1. Panggil API kita untuk mendapatkan Token
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            title: product.title,
            price: product.price
          })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // 2. Munculkan Pop-up Midtrans
        (window as any).snap.pay(data.token, {
          onSuccess: function (result: any) {
            console.log('Pembayaran Berhasil!', result);
            onClose(); // Tutup modal
            // TODO: Beri notifikasi ke user untuk cek tab "Pesanan Saya"
          },
          onPending: function (result: any) {
            console.log('Menunggu Pembayaran', result);
            onClose();
          },
          onError: function (result: any) {
            console.error('Pembayaran Gagal', result);
            setIsProcessing(false);
          },
          onClose: function () {
            // Jika user menutup pop-up sebelum selesai bayar
            setIsProcessing(false);
          }
        });
      } catch (error: any) {
        console.error("Gagal memproses checkout:", error);
        setIsProcessing(false);
      }
    }

    if (!product) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="w-full max-w-2xl bg-background border border-foreground/10 shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Image Section (Left) */}
                <div className={`w-full md:w-2/5 p-8 flex items-center justify-center ${product.imageColor} relative`}>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur shadow-sm border-none">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="w-full aspect-[3/4] bg-background/50 rounded-xl border border-foreground/5 shadow-sm flex items-center justify-center">
                    <img
                      src={product.imageSrc}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Details Section (Right) */}
                <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold tracking-tight pr-8">{product.title}</h2>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-muted hover:bg-input rounded-full transition-colors">
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
                        {product.longDesc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Yang Kamu Dapatkan</h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle2Icon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Actions */}
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Menampilkan 6 produk per halaman

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination Logic
  const totalPages = Math.ceil(PRODUCTS.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = PRODUCTS.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="w-full font-mono text-foreground">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Produk Digital CIVITA</h2>
        <p className="text-muted-foreground">Tingkatkan peluang lolos kerja kamu dengan template dan panduan eksklusif siap pakai.</p>
      </div>

      {/* Product Grid */}
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
              {/* Product Image Placeholder */}
              <div className={`relative aspect-[4/3] ${product.imageColor} overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                  <div className="h-full bg-background/50 backdrop-blur-sm rounded-lg border border-foreground/10 shadow-sm flex items-center justify-center">
                    <img
                      src={product.imageSrc}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur text-foreground border-none shadow-sm pointer-events-none">
                  {product.category}
                </Badge>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {product.shortDesc}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                  <span className="font-bold text-base">{formatRupiah(product.price)}</span>
                  <Button
                    size="sm"
                    className="rounded-full shadow-sm hover:scale-105 transition-transform px-4"
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah modal terbuka saat mengklik tombol beli langsung
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

      {/* Custom Pagination UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-foreground/5 pt-6">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Menampilkan <span className="font-bold text-foreground">{indexOfFirstItem + 1}</span> - <span className="font-bold text-foreground">{Math.min(indexOfLastItem, PRODUCTS.length)}</span> dari <span className="font-bold text-foreground">{PRODUCTS.length}</span> produk
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

      {/* Detil Produk Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}