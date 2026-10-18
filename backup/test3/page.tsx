'use client';

import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle,
  CheckCircle2, ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin as Linkedin } from "react-icons/tfi";

/* ==========================================
   1. DATA & KONFIGURASI TERPUSAT
   ========================================== */
const CONTACT_CONFIG = {
  whatsappDefaultMessage: 'Halo, saya ingin berkonsultasi mengenai jasa pembuatan CV ATS-friendly dan produk digital.',
};

const SERVICES = [
  {
    id: 'cv-ats',
    title: 'Pembuatan CV ATS-Friendly',
    description: 'CV dirancang khusus lolos sistem Applicant Tracking System (ATS) perusahaan impian & BUMN.',
    price: 75000,
    features: ['Format & Layout Sesuai Standar HR', 'Optimasi Keyword Industri', 'File Revisi Word & PDF', 'Bonus Panduan Interview'],
    bgColor: 'bg-[#FFE66D] text-[#4A4310]',
    badge: 'Paling Laris'
  },
  {
    id: 'cv-creative',
    title: 'Desain CV Profesional & Kreatif',
    description: 'Visual memukau untuk industri kreatif, startup, agensi, dan posisi manajerial.',
    price: 95000,
    features: ['Desain Modern & Eyecatching', 'Struktur Tetap Profesional', 'Custom Warna & Font', 'File Siap Cetak & Digital'],
    bgColor: 'bg-[#98F5E1] text-[#154D40]',
  },
  {
    id: 'cover-letter',
    title: 'Surat Lamaran Kerja (Cover Letter)',
    description: 'Surat pengantar persuasif yang disesuaikan dengan posisi lowongan pekerjaan.',
    price: 35000,
    features: ['Bahasa Indonesia / Inggris', 'Format Formal & Profesional', 'Mudah Diedit Sesuai Kebutuhan'],
    bgColor: 'bg-[#B3A2FF] text-[#32275C]',
  },
  {
    id: 'linkedin-opt',
    title: 'Optimasi Profil LinkedIn',
    description: 'Tingkatkan visibilitas profil LinkedIn Anda di hadapan para recruiter dan headhunter.',
    price: 85000,
    features: ['Headline & About Menarik', 'Pengisian Experience Optimal', 'Tips Networking Efektif'],
    bgColor: 'bg-[#FF9E79] text-[#522814]',
    badge: 'Rekomendasi'
  }
];

const DIGITAL_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Bundle 50+ Template CV ATS & Portofolio Notion',
    description: 'Kumpulan template siap pakai di Word dan Canva yang terbukti lolos screening awal HR.',
    category: 'Template CV',
    price: 25000,
    originalPrice: 75000,
  },
  {
    id: 'prod-2',
    title: 'E-Book Rahasia Tembus Wawancara Kerja & Negosiasi Gaji',
    description: 'Panduan lengkap menjawab pertanyaan jebakan interview dan tips negosiasi gaji tinggi.',
    category: 'E-Book Karir',
    price: 19000,
    originalPrice: 50000,
  },
  {
    id: 'prod-3',
    title: 'Template Email Follow-up & Lamaran Kerja Profesional',
    description: 'Kumpulan template email siap kirim untuk melamar kerja dan menanyakan status rekrutmen.',
    category: 'E-Book Karir',
    price: 13000,
    originalPrice: 35000,
  },
  {
    id: 'prod-4',
    title: 'Aplikasi Tracker Lamaran Kerja (Google Sheets / Excel)',
    description: 'Kelola puluhan lamaran kerja Anda secara rapi, terstruktur, dan tidak ada yang terlewat.',
    category: 'Template CV',
    price: 15000,
    originalPrice: 40000,
  }
];

const PORTFOLIO_ITEMS = [
  {
    id: 'port-1',
    title: 'Transformasi CV Software Engineer',
    category: 'CV ATS-Friendly',
    description: 'Mengubah CV berantakan menjadi format ATS clean berstandar tech company multinasional.',
  },
  {
    id: 'port-2',
    title: 'CV Fresh Graduate Manajemen Bisnis',
    category: 'Fresh Graduate',
    description: 'Menonjolkan organisasi dan project kampus agar bernilai tinggi di mata Recruiter.',
  },
  {
    id: 'port-3',
    title: 'Template Notional Portfolio & Resume',
    category: 'Digital Product',
    description: 'Contoh layout produk digital template Notion yang estetis dan fungsional.',
  }
];

const FAQS = [
  {
    question: 'Apa itu CV ATS-Friendly dan mengapa penting?',
    answer: 'CV ATS-Friendly adalah format CV yang dirancang agar mudah dibaca dan diindeks oleh software pemindai otomatis (Applicant Tracking System) yang digunakan perusahaan untuk menyaring ribuan CV.'
  },
  {
    question: 'Berapa lama proses pengerjaan jasa pembuatan CV?',
    answer: 'Proses pengerjaan standar membutuhkan waktu 1-2 hari kerja setelah data diri lengkap Anda kami terima. Tersedia juga layanan kilat (express) 24 jam.'
  },
  {
    question: 'Bagaimana cara mengakses produk digital setelah pembelian?',
    answer: 'Setelah pembayaran dikonfirmasi, Anda akan langsung mendapatkan tautan unduh (download link) ke email dan dashboard akun Anda.'
  },
  {
    question: 'Apakah ada garansi revisi untuk jasa CV?',
    answer: 'Ya! Kami memberikan garansi revisi minor hingga 3 hari setelah hasil CV dikirimkan demi kepuasan maksimal Anda.'
  }
];

/* ==========================================
   2. MAIN LANDING PAGE COMPONENT
   ========================================== */
export default function NeobrutalismLandingPage() {
  // Simulasi status autentikasi (dapat diganti dengan sistem auth Anda)
  const [session, setSession] = useState<{ isAuthenticated: boolean }>({ isAuthenticated: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof DIGITAL_PRODUCTS[0] | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showPopup, setShowPopup] = useState(false);

  // Timer untuk pop-up harga awal
  useEffect(() => {
    const isClosed = sessionStorage.getItem('pricePopupClosed');
    if (!isClosed) {
      const timer = setTimeout(() => setShowPopup(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('pricePopupClosed', 'true');
  };

  const waGlobalUrl = `https://wa.me/${APP_CONFIG.WHATSAPP}?text=${encodeURIComponent(CONTACT_CONFIG.whatsappDefaultMessage)}`;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1A1A1A] selection:bg-black selection:text-white">
      {
        // #region NAVBAR
      }
      <header className="sticky top-0 z-50 bg-[#FFFDF9] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#FFE66D] text-[#4A4310] text-xl px-2 py-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] rounded-lg group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Image
                alt="Logo"
                src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg"
                className="size-4 [filter:brightness(0)]"
                width={1}
                height={1}
              />
            </div>
            <span className="font-black text-xl tracking-tight">{APP_CONFIG.NAME}<span className="text-[#FF9E79]">.id</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
            <a href="#layanan" className="hover:underline decoration-2 underline-offset-4">Layanan CV</a>
            <a href="#katalog" className="hover:underline decoration-2 underline-offset-4">Katalog Produk</a>
            <a href="#portofolio" className="hover:underline decoration-2 underline-offset-4">Portofolio</a>
            <a href="#keunggulan" className="hover:underline decoration-2 underline-offset-4">Keunggulan</a>
            <a href="#faq" className="hover:underline decoration-2 underline-offset-4">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <button
                  className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-white px-4 py-2 rounded-xl text-sm font-extrabold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
                >
                  Masuk
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <button
                  className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#FFE66D] text-[#4A4310] px-4 py-2 rounded-xl text-sm font-extrabold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
                >
                  Daftar
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href={ROUTES.DASHBOARD.HOME}
                className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#98F5E1] text-[#154D40] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            </Show>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border-3 border-black shadow-[3px_3px_0px_0px_#000] p-2 rounded-xl bg-[#FFE66D] text-[#4A4310]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF9] border-b-4 border-black px-4 py-6 flex flex-col gap-4 font-bold">
            <a href="#layanan" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b-2 border-gray-200">Layanan CV</a>
            <a href="#katalog" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b-2 border-gray-200">Katalog Produk</a>
            <a href="#portofolio" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b-2 border-gray-200">Portofolio</a>
            <a href="#keunggulan" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b-2 border-gray-200">Keunggulan</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b-2 border-gray-200">FAQ</a>

            <div className="flex gap-3 pt-2">
              {session.isAuthenticated ? (
                <Link href="/dashboard" className="w-full text-center border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#98F5E1] text-[#154D40] py-3 rounded-xl flex items-center justify-center gap-2 font-black">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              ) : (
                <>
                  <button onClick={() => setSession({ isAuthenticated: true })} className="flex-1 border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-white py-3 rounded-xl font-black">Login</button>
                  <button onClick={() => setSession({ isAuthenticated: true })} className="flex-1 border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#FFE66D] text-[#4A4310] py-3 rounded-xl font-black">Daftar</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      {
        // #endregion
      }

      {
        // #region HERO SECTION
      }
      <section className="relative overflow-hidden py-16 lg:py-24 border-b-4 border-black bg-[radial-gradient(#d1cabc_1px,transparent_1px)] bg-[#FFFDF9] [background-size:20px_20px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-[#FFE66D] text-[#4A4310] px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000] rounded-xl w-fit font-bold text-sm">
              <Sparkles size={18} />
              <span>Spesialis Pembuatan CV ATS & Produk Digital Karir</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Tembus Rekrutmen Impian dengan <span className="bg-[#FF9E79] px-2 py-1 border-3 border-black shadow-[3px_3px_0px_0px_#000] inline-block rotate-1">CV ATS-Friendly</span> & Produk Digital Terbaik
            </h1>

            <p className="text-lg font-medium text-gray-700">
              Tingkatkan peluang dipanggil interview hingga 3x lipat. Solusi lengkap pembuatan CV profesional dan koleksi produk digital penunjang karier mulai dari Rp13 ribuan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={waGlobalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#FFE66D] text-[#4A4310] px-6 py-4 rounded-xl flex items-center gap-3 text-base font-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                <span>Buat CV Sekarang</span>
                <ArrowRight size={20} />
              </a>
              <a
                href="#katalog"
                className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#98F5E1] text-[#154D40] px-6 py-4 rounded-xl flex items-center gap-3 text-base font-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                <Download size={20} />
                <span>Lihat Katalog Produk</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-3 border-black">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <span>100% Lolos ATS Scanner</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <span>Pengerjaan Cepat 24 Jam</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <span>Harga Terjangkau & Garansi</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative bg-[#B3A2FF] text-[#32275C] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000]">
              <div className="absolute -top-4 -right-4 bg-[#FF9E79] text-[#522814] px-4 py-2 font-black text-xs rounded-lg border-3 border-black shadow-[3px_3px_0px_0px_#000] rotate-6">
                Mulai Rp13rb!
              </div>

              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] text-black">
                <FileText size={28} className="text-[#522814]" />
                <div>
                  <h3 className="font-black text-sm">Preview ATS Resume Format</h3>
                  <p className="text-xs text-gray-500 font-bold">Format Word (.docx) & PDF Ready</p>
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] text-black">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-2 bg-gray-100 rounded w-full"></div>
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center bg-[#FFE66D] text-[#4A4310] p-3 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                <span className="font-black text-sm">Paket Bundling Terlaris</span>
                <span className="font-black text-base">Rp 25.000</span>
              </div>
            </div>
          </div>

        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region TRUST INDICATORS
      }
      <section className="py-12 bg-gray-100 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Standar ATS Teruji', desc: 'Disusun sesuai algoritma pemindai HR modern.', color: 'bg-[#98F5E1] text-[#154D40]' },
              { icon: Zap, title: 'Proses Cepat & Praktis', desc: 'Pemesanan praktis dengan pengerjaan kilat.', color: 'bg-[#FFE66D] text-[#4A4310]' },
              { icon: Smile, title: 'Garansi Revisi', desc: 'Kepuasan utama dengan revisi minor gratis.', color: 'bg-[#FFB5E8] text-[#4D1B3E]' },
              { icon: DollarSign, title: 'Harga Bersahabat', desc: 'Kualitas tinggi dengan harga terjangkau.', color: 'bg-[#FF9E79] text-[#522814]' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_#000] ${item.color} flex flex-col gap-3`}>
                  <div className="p-3 bg-white text-black w-fit rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-black text-lg">{item.title}</h3>
                  <p className="text-sm font-bold opacity-90">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region LAYANAN PEMBUATAN CV
      }
      <section id="layanan" className="py-16 lg:py-24 bg-[#FFFDF9] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-[#B3A2FF] text-[#32275C] px-4 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-xs uppercase tracking-wider">
              Layanan Profesional
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">Pilihan Jasa Pembuatan CV & Karier</h2>
            <p className="text-gray-700 font-bold mt-2">
              Pilih layanan terbaik yang sesuai dengan kebutuhan pencarian kerja Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => {
              const waUrl = `https://wa.me/${APP_CONFIG.WHATSAPP}?text=${encodeURIComponent(`Halo, saya tertarik dengan layanan ${service.title}.`)}`;
              return (
                <div key={service.id} className={`rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000] ${service.bgColor} p-6 flex flex-col justify-between relative`}>
                  {service.badge && (
                    <span className="absolute -top-3 right-4 bg-black text-white px-3 py-1 text-xs font-black rounded-lg border-2 border-black">
                      {service.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="font-black text-xl mb-2">{service.title}</h3>
                    <p className="text-sm font-bold opacity-90 mb-6">{service.description}</p>

                    <div className="space-y-2 mb-8">
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm font-bold">
                          <Check size={18} className="shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <span className="text-xs uppercase font-black opacity-75">Mulai dari</span>
                      <div className="text-2xl font-black">
                        Rp {service.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-white text-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
                    >
                      <span>Pesan via WhatsApp</span>
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region KATALOG PRODUK DIGITAL
      }
      <section id="katalog" className="py-16 lg:py-24 bg-gray-100 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-[#FFE66D] text-[#4A4310] px-4 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-xs uppercase tracking-wider">
              E-Shop Karir
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">Katalog Produk Digital</h2>
            <p className="text-gray-700 font-bold mt-2">
              Mulai dari Rp13 ribuan, tingkatkan kompetensi dan persiapan melamar kerja Anda dengan template siap pakai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DIGITAL_PRODUCTS.map((product) => {
              const waUrl = `https://wa.me/${APP_CONFIG.WHATSAPP}?text=${encodeURIComponent(`Halo, saya ingin membeli produk digital: ${product.title}`)}`;

              return (
                <div key={product.id} className="bg-[#FFFDF9] rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-[#FFB5E8] text-[#4D1B3E] px-3 py-1 rounded-lg border-2 border-black font-black text-xs">
                        {product.category}
                      </span>
                      {product.originalPrice && (
                        <span className="bg-[#FF9E79] text-[#522814] px-2 py-0.5 rounded border-2 border-black font-black text-xs">
                          Diskon
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-lg mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-sm font-bold text-gray-700 mb-6 line-clamp-3">{product.description}</p>
                  </div>

                  <div>
                    <div className="mb-4">
                      {product.originalPrice && (
                        <span className="text-xs line-through text-gray-400 font-bold block">
                          Rp {product.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                      <div className="text-2xl font-black">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="border-3 border-black shadow-[3px_3px_0px_0px_#000] bg-white py-2 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all"
                      >
                        <Eye size={16} />
                        <span>Detail</span>
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-3 border-black shadow-[3px_3px_0px_0px_#000] bg-[#FFE66D] text-[#4A4310] py-2 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all"
                      >
                        <ShoppingCart size={16} />
                        <span>Beli</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region PORTOFOLIO
      }
      <section id="portofolio" className="relative overflow-hidden py-16 lg:py-24 bg-[#B2F0B2] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-[#FF9E79] text-black px-4 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-xs uppercase tracking-wider">
              Portofolio & Contoh
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">Hasil Karya & Contoh CV</h2>
            <p className="text-gray-700 font-bold mt-2">
              Beberapa contoh hasil optimasi CV ATS-friendly dan template digital yang telah kami buat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PORTFOLIO_ITEMS.map((item) => (
              <div key={item.id} className="bg-[#FFE66D] text-[#4A4310] rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-white text-black p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] mb-4 h-48 flex items-center justify-center font-bold text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Award size={36} className="text-[#522814]" />
                      <span className="text-sm font-black">{item.category} Preview</span>
                    </div>
                  </div>
                  <span className="bg-black text-white px-2.5 py-1 rounded text-xs font-black">{item.category}</span>
                  <h3 className="font-black text-xl mt-3 mb-2">{item.title}</h3>
                  <p className="text-sm font-bold opacity-90">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.05)_20px,rgba(0,0,0,0.05)_40px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.02)_20px,rgba(255,255,255,0.02)_40px)] pointer-events-none" />
      </section>
      {
        // #endregion
      }

      {
        // #region KEUNGGULAN
      }
      <section id="keunggulan" className="py-16 lg:py-24 bg-gray-100 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="bg-[#FF9E79] text-[#522814] px-4 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-xs uppercase">
              Mengapa Pilih Kami?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-5">Standar Kualitas Terbaik untuk Karier Profesional Anda</h2>
            <p className="text-gray-700 font-bold">
              Kami berkomitmen membantu setiap pencari kerja menampilkan potensi terbaik mereka melalui dokumen lamaran yang profesional dan produk pendukung berkualitas.
            </p>

            <div className="space-y-4 pt-2">
              {[
                'Format CV bersih tanpa tabel rumit atau kolom ganda yang sering mengecoh sistem ATS.',
                'Disusun oleh profesional berpengalaman yang memahami kriteria rekrutmen perusahaan.',
                'Pemesanan super praktis langsung terhubung via WhatsApp tanpa ribet.',
                'Harga produk digital dan jasa layanan ramah di kantong mahasiswa & fresh graduate.'
              ].map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-[#FFFDF9] p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                  <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
                  <span className="font-bold text-sm">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#B3A2FF] text-[#32275C] p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <h3 className="text-2xl font-black mb-4">Siap Melangkah ke Jenjang Karier Lebih Baik?</h3>
            <p className="font-bold text-sm mb-6 opacity-90">
              Jangan biarkan CV Anda terus-menerus ditolak sistem otomatis HR. Konsultasikan kebutuhan CV Anda sekarang juga.
            </p>
            <div className="bg-white text-black p-6 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-4">
              <div className="font-black text-sm">💡 Tips Karir Hari Ini:</div>
              <p className="text-xs font-bold text-gray-700">
                Pastikan gunakan keyword yang sesuai dengan deskripsi lowongan (Job Description) pada bagian pengalaman kerja di CV Anda.
              </p>
            </div>
          </div>
        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region FAQ SECTION
      }
      <section id="faq" className="py-16 lg:py-24 bg-[#FFFDF9] border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="bg-[#FFE66D] text-[#4A4310] px-4 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-xs uppercase">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-gray-700 font-bold mt-2">
              Temukan jawaban seputar layanan CV dan produk digital kami.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex justify-between items-center font-black text-base sm:text-lg"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm font-bold text-gray-700 border-t-3 border-black pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {
        // #endregion
      }

      {
        // #region FOOTER
      }
      <footer className="bg-[#FFFDF9] border-t-4 border-black pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFE66D] text-[#4A4310] font-black text-xl px-2 py-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] rounded-lg">
                <Image
                  alt="Logo"
                  src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg"
                  className="size-4 [filter:brightness(0)]"
                  width={1}
                  height={1}
                />
              </div>
              <span className="font-black text-xl tracking-tight">{APP_CONFIG.NAME}<span className="text-[#FF9E79]">.id</span></span>
            </div>
            <p className="text-sm font-bold text-gray-700 max-w-sm">
              Solusi profesional pembuatan CV ATS-friendly dan penyedia produk digital karier terpercaya untuk meningkatkan peluang diterima kerja.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noopener noreferrer" className="border-3 border-black shadow-[3px_3px_0px_0px_#000] p-2 rounded-xl bg-[#FFB5E8] text-[#4D1B3E] hover:scale-105 transition" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={APP_CONFIG.LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="border-3 border-black shadow-[3px_3px_0px_0px_#000] p-2 rounded-xl bg-[#98F5E1] text-[#154D40] hover:scale-105 transition" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href={`mailto:${APP_CONFIG.EMAIL}`} className="border-3 border-black shadow-[3px_3px_0px_0px_#000] p-2 rounded-xl bg-[#B3A2FF] text-[#32275C] hover:scale-105 transition" aria-label="Email">
                <Mail size={18} />
              </a>
              <a href={waGlobalUrl} target="_blank" rel="noopener noreferrer" className="border-3 border-black shadow-[3px_3px_0px_0px_#000] p-2 rounded-xl bg-[#FFE66D] text-[#4A4310] hover:scale-105 transition" aria-label="WhatsApp">
                <SiWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-base mb-4">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li><a href="#layanan" className="hover:underline">Layanan CV</a></li>
              <li><a href="#katalog" className="hover:underline">Katalog Produk</a></li>
              <li><a href="#portofolio" className="hover:underline">Portofolio</a></li>
              <li><a href="#keunggulan" className="hover:underline">Keunggulan</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-base mb-4">Kontak & Dukungan</h4>
            <ul className="space-y-2 text-sm font-bold text-gray-700">
              <li>WhatsApp: <a href={waGlobalUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">+{APP_CONFIG.WHATSAPP}</a></li>
              <li>Email: <a href={APP_CONFIG.LINKS.EMAIL} className="hover:opacity-70">{APP_CONFIG.EMAIL}</a></li>
              <li className="pt-2">
                <a
                  href={waGlobalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#FFE66D] text-[#4A4310] px-4 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px]"
                >
                  <SiWhatsapp size={16} /> Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t-3 border-black text-center text-xs font-black text-gray-600">
          &copy; {new Date().getFullYear()} {APP_CONFIG.NAME}.id. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </footer>
      {
        // #endregion
      }

      {
        // #region MODAL / DIALOG DETAIL PRODUK
      }
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] border-4 border-black shadow-[8px_8px_0px_0px_#000] max-w-lg w-full rounded-2xl p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-[#FF9E79] p-2 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] font-black hover:scale-105 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <span className="bg-[#FFE66D] text-[#4A4310] px-3 py-1 rounded-lg border-2 border-black font-black text-xs uppercase">
              {selectedProduct.category}
            </span>

            <h3 className="text-2xl font-black mt-4 mb-2">{selectedProduct.title}</h3>
            <p className="text-sm font-bold text-gray-700 mb-6">{selectedProduct.description}</p>

            <div className="bg-gray-100 p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000] mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle size={18} className="text-green-600" />
                <span>Akses instan setelah konfirmasi pembayaran</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle size={18} className="text-green-600" />
                <span>Format file siap edit (Word / Canva / Excel / PDF)</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-gray-500 font-bold block">Harga Spesial</span>
                <div className="text-3xl font-black text-[#522814]">
                  Rp {selectedProduct.price.toLocaleString('id-ID')}
                </div>
              </div>
              {selectedProduct.originalPrice && (
                <div className="line-through text-gray-400 font-black text-lg">
                  Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}
                </div>
              )}
            </div>

            <a
              href={`https://wa.me/${APP_CONFIG.WHATSAPP}?text=${encodeURIComponent(`Halo, saya ingin membeli produk digital: ${selectedProduct.title} seharga Rp${selectedProduct.price.toLocaleString('id-ID')}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-[#98F5E1] text-[#154D40] py-4 rounded-xl flex items-center justify-center gap-2 font-black text-base hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
            >
              <ShoppingCart size={20} />
              <span>Beli Sekarang via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
      {
        // #endregion
      }

      {
        // #region POP-UP HARGA AWAL
      }
      {showPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs bg-[#FFE66D] text-[#4A4310] p-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000] motion-safe:animate-bounce hover:animate-none">
          <button
            onClick={handleClosePopup}
            className="absolute top-1 right-1 text-black p-1 hover:scale-110 transition"
            aria-label="Close popup"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            <div className="bg-white p-2 rounded-xl border-2 border-black text-black">
              <Sparkles size={20} className="text-[#522814]" />
            </div>
            <div>
              <h4 className="font-black text-sm">Produk mulai Rp13K!</h4>
              <p className="text-xs font-bold mt-1">Dapatkan template CV & E-Book siap pakai sekarang.</p>
              <a
                href={waGlobalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block border-2 border-black shadow-[2px_2px_0px_0px_#000] bg-[#FF9E79] text-black px-3 py-1.5 rounded-lg text-xs font-black"
              >
                Lihat Promo
              </a>
            </div>
          </div>
        </div>
      )}

      {
        // #endregion
      }

    </div>
  );
}