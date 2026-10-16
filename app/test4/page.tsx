"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Star,
  Download,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin as Linkedin } from "react-icons/tfi";

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
  whatsappNumber: "6281234567890",
  whatsappDefaultMessage: "Halo, saya tertarik dengan layanan pembuatan CV ATS-friendly dan produk digital Anda.",
  email: "support@cvkarirku.id",
  instagram: "https://instagram.com/cvkarirku",
  linkedin: "https://linkedin.com/company/cvkarirku",
};

const WHATSAPP_URL = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappDefaultMessage)}`;

interface Product {
  id: string;
  title: string;
  price: number;
  formattedPrice: string;
  category: string;
  description: string;
  features: string[];
  badge?: string;
  color: string;
}

const DIGITAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "E-Book Panduan Interview Kerja & HR Q&A",
    price: 15000,
    formattedPrice: "Rp 15.000",
    category: "E-Book",
    description: "Panduan lengkap menghadapi interview HR dan user beserta 50+ contoh jawaban terbaik.",
    features: ["Format PDF siap baca", "Tips psikotes & body language", "Strategi negosiasi gaji"],
    badge: "Terlaris",
    color: "bg-[#FFE66D]",
  },
  {
    id: "prod-2",
    title: "Template Notion Freelance & Financial Tracker",
    price: 25000,
    formattedPrice: "Rp 25.000",
    category: "Template Notion",
    description: "Dashboard Notion all-in-one untuk mengatur proyek freelance, klien, dan pencatatan keuangan.",
    features: ["Invoice generator", "Project pipeline tracker", "Monthly financial summary"],
    badge: "Populer",
    color: "bg-[#98F5E1]",
  },
  {
    id: "prod-3",
    title: "Bundle 50+ Template Desain Canva Portofolio",
    price: 35000,
    formattedPrice: "Rp 35.000",
    category: "Design Bundle",
    description: "Kumpulan template Canva siap edit untuk portofolio kreatif, deck presentasi, dan media sosial.",
    features: ["100% editable di Canva gratis", "Desain modern & profesional", "Berbagai kategori profesi"],
    color: "bg-[#B3A2FF]",
  },
  {
    id: "prod-4",
    title: "UI/UX Starter Kit & Wireframe Components",
    price: 49000,
    formattedPrice: "Rp 49.000",
    category: "UI Kit",
    description: "Komponen wireframe siap pakai untuk desainer produk dan developer frontend.",
    features: ["Figma file included", "Responsive layout system", "Clean neobrutalism style"],
    badge: "Baru",
    color: "bg-[#FFB5E8]",
  },
];

const SERVICES = [
  {
    title: "Pembuatan CV ATS-Friendly",
    description: "Format CV dirancang khusus lolos sistem Applicant Tracking System (ATS) perusahaan impian Anda.",
    color: "bg-[#FFE66D]",
    icon: FileText,
  },
  {
    title: "Desain CV Profesional & Kreatif",
    description: "Visual menawan untuk industri kreatif, startup, dan posisi manajerial tanpa mengorbankan keterbacaan.",
    color: "bg-[#98F5E1]",
    icon: Sparkles,
  },
  {
    title: "Cover Letter & LinkedIn Optimization",
    description: "Optimalkan profil LinkedIn dan surat lamaran kerja agar recruiter melirik profil Anda.",
    color: "bg-[#B3A2FF]",
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    question: "Apa itu CV ATS-Friendly dan mengapa itu penting?",
    answer: "CV ATS-Friendly adalah format CV yang dioptimalkan agar mudah dibaca dan diindeks oleh sistem otomatis (ATS) yang digunakan perusahaan besar untuk menyaring kandidat sebelum dibaca HR."
  },
  {
    question: "Bagaimana cara memesan layanan pembuatan CV?",
    answer: "Anda dapat mengklik tombol WhatsApp untuk langsung terhubung dengan tim kami, mendiskusikan pengalaman Anda, dan memulai proses pembuatan CV."
  },
  {
    question: "Format apa saja yang saya dapatkan saat membeli produk digital?",
    answer: "Produk digital dikirimkan langsung melalui akses tautan unduhan (PDF, Notion template link, atau file Figma/Canva) setelah konfirmasi."
  },
  {
    question: "Apakah ada garansi revisi untuk pembuatan CV?",
    answer: "Tentu, kami menyediakan sesi revisi hingga Anda puas dengan hasil akhir CV profesional Anda."
  }
];

// ==========================================
// LOCAL COMPONENTS
// ==========================================

export default function LandingPage() {
  // Authentication state (Mock state ready for Clerk / Auth.js integration)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Promo Popup State
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check sessionStorage for promo popup
    const dismissed = sessionStorage.getItem("promo_popup_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("promo_popup_dismissed", "true");
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans selection:bg-[#FFE66D] selection:text-black">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#FFE66D] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-xl group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
              CV
            </div>
            <span className="text-2xl font-black tracking-tight">KarirKu</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-bold">
            <a href="#layanan" className="hover:underline decoration-2 underline-offset-4">Layanan</a>
            <a href="#katalog" className="hover:underline decoration-2 underline-offset-4">Produk Digital</a>
            <a href="#portofolio" className="hover:underline decoration-2 underline-offset-4">Portofolio</a>
            <a href="#faq" className="hover:underline decoration-2 underline-offset-4">FAQ</a>
          </nav>

          {/* Auth / Dashboard Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Button
                onClick={() => setIsLoggedIn(false)}
                className="bg-[#98F5E1] text-black border-3 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsLoggedIn(true)}
                  variant="outline"
                  className="bg-white text-black border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE66D] transition-all"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => setIsLoggedIn(true)}
                  className="bg-[#FF9E79] text-black border-3 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#FFE66D] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDFBF7] border-b-4 border-black p-4 space-y-4">
            <div className="flex flex-col space-y-3 font-bold text-lg">
              <a
                href="#layanan"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#FFE66D] border-2 border-black"
              >
                Layanan
              </a>
              <a
                href="#katalog"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#98F5E1] border-2 border-black"
              >
                Produk Digital
              </a>
              <a
                href="#portofolio"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#B3A2FF] border-2 border-black"
              >
                Portofolio
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#FFB5E8] border-2 border-black"
              >
                FAQ
              </a>
            </div>
            <div className="pt-2 border-t-2 border-black flex flex-col gap-2">
              {isLoggedIn ? (
                <Button
                  onClick={() => { setIsLoggedIn(false); setMobileMenuOpen(false); }}
                  className="w-full bg-[#98F5E1] text-black border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => { setIsLoggedIn(true); setMobileMenuOpen(false); }}
                    className="w-full bg-white text-black border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => { setIsLoggedIn(true); setMobileMenuOpen(false); }}
                    className="w-full bg-[#FF9E79] text-black border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Daftar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-[#FFE66D] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-[#FF9E79] text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🚀 Lolos ATS & Karir Impian Dimulai Di Sini
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Buat CV ATS-Friendly & Produk Digital Profesional
            </h1>

            <p className="text-lg sm:text-xl font-medium text-[#4A4310]">
              Tingkatkan peluang dipanggil interview hingga 3x lipat dengan CV berstandar industri dan koleksi produk digital berkualitas tinggi mulai dari Rp13 ribuan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto bg-[#FF9E79] text-black border-4 border-black font-black text-lg px-8 py-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <MessageCircle className="w-5 h-5 mr-2 fill-current" />
                  Buat CV Sekarang
                </Button>
              </a>
              <a href="#katalog">
                <Button className="w-full sm:w-auto bg-[#98F5E1] text-black border-4 border-black font-black text-lg px-8 py-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Lihat Produk Digital
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>100% ATS Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>Instan Download</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Preview Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            {/* CV Preview Card */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl transform rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B3A2FF] border-2 border-black rounded-full flex items-center justify-center font-bold">
                    RD
                  </div>
                  <div>
                    <h3 className="font-black">Rian Pratama</h3>
                    <p className="text-xs font-semibold text-gray-600">Senior Frontend Developer</p>
                  </div>
                </div>
                <Badge className="bg-[#98F5E1] text-black border border-black font-bold text-xs">ATS Score: 98%</Badge>
              </div>
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-3/5"></div>
              </div>
              <div className="mt-4 pt-3 border-t border-dashed border-gray-400 flex justify-between items-center text-xs font-bold">
                <span>Status: Siap Kirim HR</span>
                <span className="text-[#522814] bg-[#FF9E79] px-2 py-0.5 border border-black">Lolos HR</span>
              </div>
            </div>

            {/* Product Card Preview */}
            <div className="bg-[#98F5E1] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl transform -rotate-1 hover:rotate-0 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">Template Notion</span>
                <span className="font-black text-lg">Rp 25.000</span>
              </div>
              <h4 className="font-black text-lg mb-1">Freelance Financial & Project Tracker</h4>
              <p className="text-xs font-semibold text-[#154D40] mb-4">Kelola keuangan proyek dan klien dengan mudah dalam satu workspace.</p>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Star className="w-4 h-4 fill-black" />
                <span>4.9 / 5.0 Rating Pengguna</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section id="layanan" className="py-20 bg-[#FDFBF7] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-[#B3A2FF] text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Layanan Unggulan
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black">Solusi Profesional untuk Karir Anda</h2>
            <p className="font-medium text-gray-700">
              Dirancang oleh praktisi rekrutmen profesional untuk memastikan dokumen lamaran Anda tampil menonjol dan lolos seleksi awal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className={`${service.color} border-4 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 bg-white border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rounded-xl">
                      <Icon className="w-7 h-7 text-black" />
                    </div>
                    <h3 className="text-2xl font-black">{service.title}</h3>
                    <p className="font-medium text-sm leading-relaxed">{service.description}</p>
                  </div>
                  <div className="pt-6 mt-6 border-t-2 border-black flex items-center justify-between">
                    <span className="font-black text-sm">Konsultasi Gratis</span>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-white text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all">
                        Pesan <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DIGITAL PRODUCT CATALOG ================= */}
      <section id="katalog" className="py-20 bg-[#FFB5E8] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <Badge className="bg-white text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Katalog Produk Digital
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black">Aset Digital Siap Pakai</h2>
              <p className="font-medium text-[#4D1B3E]">
                Tingkatkan produktivitas kerja dan portofolio Anda dengan template, e-book, dan kit eksklusif kami.
              </p>
            </div>
            <div className="bg-white border-3 border-black p-3 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              💡 Harga terjangkau mulai dari Rp13 ribuan
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DIGITAL_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2.5 py-1 text-xs font-black border-2 border-black ${prod.color}`}>
                      {prod.category}
                    </span>
                    {prod.badge && (
                      <span className="bg-[#FFE66D] border-2 border-black px-2 py-0.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-xl mb-2 leading-tight">{prod.title}</h3>
                  <p className="text-xs font-medium text-gray-600 mb-4">{prod.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-black mb-4">
                    <span className="text-xs font-bold text-gray-500">Harga Spesial</span>
                    <span className="font-black text-xl text-black">{prod.formattedPrice}</span>
                  </div>
                  <Button
                    onClick={() => openProductDetail(prod)}
                    className="w-full bg-[#FFE66D] text-black border-3 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    Lihat Detail & Beli
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PORTFOLIO SECTION ================= */}
      <section id="portofolio" className="py-20 bg-[#FDFBF7] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-[#98F5E1] text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Portofolio & Hasil Kerja
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black">Bukti Nyata Kualitas Kami</h2>
            <p className="font-medium text-gray-700">
              Ratusan profesional telah mempercayakan dokumen karir mereka bersama CV KarirKu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: "Software Engineer", company: "Tech Unicorn", result: "Lolos 3 Interview Perusahaan Besar" },
              { role: "Digital Marketer", company: "Agensi Multinasional", result: "Peningkatan Callback Rate 80%" },
              { role: "Product Manager", company: "Startup Seri B", result: "Format ATS Bersih & Profesional" }
            ].map((item, i) => (
              <div key={i} className="bg-[#98F5E1] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center font-black">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-black text-xl">{item.role}</h3>
                  <p className="text-xs font-bold text-[#154D40]">Penempatan: {item.company}</p>
                </div>
                <p className="text-sm font-medium bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  "{item.result}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-20 bg-[#B2F0B2] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-white text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Keunggulan Kami
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black">Mengapa Memilih CV KarirKu?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="w-12 h-12 bg-[#FFE66D] border-2 border-black flex items-center justify-center font-black text-lg">01</div>
              <h3 className="font-black text-xl">Dibuat oleh Pakar HR</h3>
              <p className="text-sm font-medium text-gray-700">Disusun berdasarkan standar rekrutmen perusahaan nasional dan multinasional terkini.</p>
            </div>
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="w-12 h-12 bg-[#98F5E1] border-2 border-black flex items-center justify-center font-black text-lg">02</div>
              <h3 className="font-black text-xl">Pengerjaan Cepat</h3>
              <p className="text-sm font-medium text-gray-700">Waktu pengerjaan efisien tanpa mengorbankan kualitas isi dan penyesuaian kata kunci (keyword).</p>
            </div>
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="w-12 h-12 bg-[#FFB5E8] border-2 border-black flex items-center justify-center font-black text-lg">03</div>
              <h3 className="font-black text-xl">Produk Terjangkau</h3>
              <p className="text-sm font-medium text-gray-700">Koleksi e-book dan template digital berkualitas tinggi dengan harga ramah di kantong.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHATSAPP CTA BANNER ================= */}
      <section className="py-20 bg-[#FF9E79] border-b-4 border-black text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Badge className="bg-white text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Siap Tingkatkan Karir?
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black">Konsultasikan Kebutuhan CV Anda Sekarang</h2>
          <p className="text-lg font-medium text-[#522814] max-w-2xl mx-auto">
            Jangan biarkan CV Anda tertolak sistem ATS. Hubungi kami via WhatsApp untuk konsultasi cepat dan ramah.
          </p>
          <div className="pt-4">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-black border-4 border-black font-black text-xl px-10 py-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <MessageCircle className="w-6 h-6 mr-2 fill-current" />
                Hubungi via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="py-20 bg-[#FDFBF7] border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-[#FFE66D] text-black border-2 border-black font-black text-sm px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Pertanyaan Umum
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black">FAQ</h2>
            <p className="font-medium text-gray-700">Temukan jawaban seputar layanan dan produk kami.</p>
          </div>

          <Accordion className="space-y-4">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-6 py-2"
              >
                <AccordionTrigger className="font-black text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-medium text-gray-700 pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#32275C] text-white border-b-4 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FFE66D] text-black border-3 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center font-black text-xl">
                CV
              </div>
              <span className="text-2xl font-black tracking-tight text-white">KarirKu</span>
            </div>
            <p className="text-sm font-medium text-gray-300 max-w-sm">
              Platform profesional penyedia jasa pembuatan CV ATS-friendly dan kurasi produk digital terbaik untuk meningkatkan produktivitas karir Anda.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-lg text-[#FFE66D]">Navigasi Cepat</h4>
            <ul className="space-y-2 text-sm font-bold text-gray-300">
              <li><a href="#layanan" className="hover:text-white transition-colors">Layanan CV</a></li>
              <li><a href="#katalog" className="hover:text-white transition-colors">Produk Digital</a></li>
              <li><a href="#portofolio" className="hover:text-white transition-colors">Portofolio</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-lg text-[#FFE66D]">Kontak & Sosial Media</h4>
            <div className="flex items-center gap-3 pt-2">
              <a href={CONFIG.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href={`mailto:${CONFIG.email}`} aria-label="Email" className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <Mail className="w-5 h-5" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs font-medium text-gray-300 pt-2">Email: {CONFIG.email}</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-700 text-center text-xs font-bold text-gray-400">
          © {new Date().getFullYear()} CV KarirKu. Seluruh hak cipta dilindungi.
        </div>
      </footer>

      {/* ================= FLOATING WHATSAPP BUTTON ================= */}
      <aside aria-label="Bantuan WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white border-4 border-black px-5 py-3 rounded-full font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
        >
          <MessageCircle className="w-6 h-6 fill-current text-white" />
          <span className="hidden sm:inline text-black font-black">Chat WhatsApp</span>
        </a>
      </aside>

      {/* ================= PRODUCT DETAIL DIALOG ================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#FDFBF7] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl max-w-lg p-6">
          {selectedProduct && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`border-2 border-black font-black ${selectedProduct.color}`}>
                    {selectedProduct.category}
                  </Badge>
                  <span className="font-black text-2xl text-black">{selectedProduct.formattedPrice}</span>
                </div>
                <DialogTitle className="text-2xl font-black">{selectedProduct.title}</DialogTitle>
                <DialogDescription className="font-medium text-gray-700 text-sm">
                  {selectedProduct.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-3">
                <h4 className="font-black text-sm text-black uppercase tracking-wider">Fitur & Keunggulan Produk:</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <DialogFooter className="pt-4 border-t-2 border-black flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-3 border-black font-bold"
                >
                  Tutup
                </Button>
                <a
                  href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Halo, saya ingin membeli produk digital: ${selectedProduct.title} seharga${selectedProduct.formattedPrice}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full bg-[#FFE66D] text-black border-3 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                    Beli Sekarang via WhatsApp
                  </Button>
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= PROMO POPUP ================= */}
      {showPopup && (
        <aside aria-label="Promo Khusus" className="fixed bottom-6 left-6 z-50 max-w-xs bg-[#FFE66D] border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce-short">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="bg-black text-white px-2 py-0.5 text-xs font-black rounded">PROMO SPESIAL</span>
            <button
              onClick={dismissPopup}
              className="p-1 hover:bg-black/10 rounded font-black text-lg leading-none"
              aria-label="Tutup promo"
            >
              ×
            </button>
          </div>
          <h4 className="font-black text-base mb-1">Produk digital mulai Rp13 ribuan! 🔥</h4>
          <p className="text-xs font-medium text-gray-800 mb-3">Tingkatkan produktivitas kerja dan portofolio Anda sekarang juga.</p>
          <a
            href="#katalog"
            onClick={dismissPopup}
            className="block text-center bg-black text-white py-2 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-800 transition-all"
          >
            Lihat Katalog
          </a>
        </aside>
      )}

    </div>
  );
}