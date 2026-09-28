'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ChartPieIcon,
  CheckCircle2,
  ChevronRight,
  Command,
  CommandIcon,
  Flame,
  Layout,
  Mail,
  MessageSquare,
  PlaneIcon,
  ShieldCheck,
  Skull,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
  type LucideIcon
} from 'lucide-react';
import { useRef, useState } from 'react';

// --- TypeScript Interfaces ---
interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  highlights: string[];
  colSpan?: string;
}

interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  comment: string;
  status: string;
  avatarBg: string;
}

interface PricingOption {
  title: string;
  price: string;
  tag: string;
  desc: string;
  features: string[];
  isPopular?: boolean;
}

/* STREAMING_CHUNK:Main Component & Parallax hooks... */
export default function CivitaLandingPage() {
  // Parallax global scroll progress
  const { scrollYProgress } = useScroll();

  // Hero section floating elements parallax
  const floatHero1 = useTransform(scrollYProgress, [0, 0.5], [0, -180]);
  const floatHero2 = useTransform(scrollYProgress, [0, 0.5], [0, 140]);
  const floatHero3 = useTransform(scrollYProgress, [0, 0.5], [0, -90]);

  // Showcase section parallax scroll
  const showcaseRef = useRef(null);
  const { scrollYProgress: showcaseScroll } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"]
  });

  const mockupTranslateY = useTransform(showcaseScroll, [0, 1], [80, -80]);
  const textTranslateY = useTransform(showcaseScroll, [0, 1], [-40, 40]);
  const bgTextX = useTransform(showcaseScroll, [0, 1], [150, -350]);

  // Tab state untuk Interactive Preview
  const [activeTab, setActiveTab] = useState<'cv' | 'portfolio' | 'brosur' | 'resi'>('cv');

  // Link WhatsApp otomatis dengan pesan
  const waNumber = "6282312945365";
  const defaultWaMessage = encodeURIComponent("Halo CIVITA! Saya mau konsul / pesan desain CV & dokumen kerja nih ✨");
  const waUrl = `https://wa.me/${waNumber}?text=${defaultWaMessage}`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafafa]/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5 font-bold tracking-tighter text-base">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
              <Command className="w-4 h-4" />
            </div>
            <span>CIVITA<span className="text-zinc-400">_STUDIO</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs tracking-tight text-zinc-500 dark:text-zinc-400 font-medium">
            <a href="#layanan" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">/layanan</a>
            <a href="#showcase" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">/showcase</a>
            <a href="#paket" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">/paket_harga</a>
            <a href="#testi" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">/testimoni</a>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Order via WA</span>
          </a>
        </div>
      </nav >

      < section className="relative pt-36 pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center" >
        {/* Floating Gen-Z Status Tag */}
        < motion.div
          initial={{ opacity: 0, y: 15 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs mb-8 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="text-zinc-600 dark:text-zinc-300">v2.4 ATS & Creative Masterpiece 🔥</span>
        </motion.div >

        {/* Hero Title (Apple Monospace Minimalist) */}
        < motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1.08] mb-6 max-w-4xl"
        >
          CV MASIH DEKADEN ? <br />
          <span className="text-zinc-400 dark:text-zinc-500">HRD AUTO PASS, BRO.</span>
        </motion.h1 >

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-10"
        >
          Jasa pembuatan <span className="text-zinc-900 dark:text-zinc-100 font-bold underline decoration-zinc-300 dark:decoration-zinc-700 decoration-2">Desain CV, Surat Lamaran, Portfolio, Brosur & Resi</span> bergaya UI Apple. Ultra-clean, ATS-Friendly, dan berkelas biar lolos fast-track HRD tanpa drama.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-8 py-4 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 dark:shadow-none"
          >
            <span>Bikin CV Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#showcase"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 py-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all active:scale-95 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span>Lihat Sample UI</span>
          </a>
        </motion.div>

        {/* STREAMING_CHUNK:Parallax Mac Mockup Floating Cards... */}
        <div className="relative w-full h-[320px] mt-16 hidden md:block perspective-1000">

          {/* Card 1: HRD Status */}
          <motion.div
            style={{ y: floatHero1 }}
            className="absolute top-4 left-[8%] w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">HRD_Inbox.sh</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Status: Lolos Stage 1</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-tight">
              "Anjay layout CV-nya ala macOS, keliatan niat banget kandidat satu ini."
            </p>
          </motion.div>

          {/* Card 2: Main Floating Stats */}
          <motion.div
            style={{ y: floatHero2 }}
            className="absolute top-12 right-[10%] w-64 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 p-5 rounded-[2rem] shadow-2xl z-10 text-left"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">CIVITA_METRICS</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black tracking-tight">98.4%</div>
            <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> Fast track interview rate
            </div>
          </motion.div>

          {/* Card 3: Anti Ghosting Shield */}
          <motion.div
            style={{ y: floatHero3 }}
            className="absolute -bottom-6 left-[38%] w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-[2rem] shadow-xl z-20 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Anti-Ghosting Shield™</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Format ATS lolos sistem screening tanpa eror parsial.</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section >

      < section id="layanan" className="py-24 max-w-6xl mx-auto px-6" >
        <div className="mb-14 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <Terminal className="w-3.5 h-3.5" /> /layanan_kami
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Solusi Berkas Karir & Bisnis Skena.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xl">
            Bukan sekadar copas template gratisan. Setiap dokumen diracik khusus dengan tata letak ala Apple UI & tipografi presisi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicesData.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${service.colSpan || ''}`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 tracking-tight">{service.title}</h3>
                <p className="text-xs text-zinc-400 mb-4 font-semibold">{service.subtitle}</p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div>
                <ul className="space-y-2 mb-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  {service.highlights.map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo CIVITA, mau tanya tentang layanan ${service.title} dong!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Pesan Layanan Ini</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section >

      < section
        id="showcase"
        ref={showcaseRef}
        className="py-28 overflow-hidden relative border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/30"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">

            {/* Left Column: Text & Tabs */}
            <motion.div style={{ y: textTranslateY }} className="md:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                <Layout className="w-3.5 h-3.5" /> /preview_sistem
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                UI/UX Skena. <br />
                <span className="text-zinc-400 dark:text-zinc-500">Bukan Canva Biasa.</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Lupakan template pasaran yang dibaca HRD cuma 2 detik. CIVITA memadukan struktur profesional ATS dengan estetika *Apple HIG (Human Interface Guidelines)*.
              </p>

              {/* Interactive Tab Switcher */}
              <div className="flex flex-col gap-2 mb-6">
                {[
                  { id: 'cv', label: '01. Desain CV ATS & Creative', desc: 'Format lulus sistem robot & segar dipandang' },
                  { id: 'portfolio', label: '02. Portfolio Skena macOS', desc: 'Pamer karya ala gallery Notion/Apple' },
                  { id: 'brosur', label: '03. Brosur Promosi Bisnis', desc: 'Bikin brand lo kelihatan bonafit' },
                  { id: 'resi', label: '04. Resi / Invoice Invoice', desc: 'Desain transaksi usaha yang terpercaya' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                      }`}
                  >
                    <div className="text-xs font-bold">{tab.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{tab.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Parallax macOS Frame Mockup */}
            <motion.div
              style={{ y: mockupTranslateY }}
              className="md:col-span-7 relative rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2.5"
            >
              {/* macOS Window Controls */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-green-500/90 shadow-sm" />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                  ~/civita_viewer/{activeTab}_preview.pdf
                </span>
                <div className="w-8" />
              </div>

              <div className="bg-zinc-900 rounded-xl p-5 sm:p-6 min-h-[380px] text-left text-zinc-200 font-mono flex flex-col justify-between relative overflow-hidden border border-zinc-800">
                <AnimatePresence mode="wait">
                  {activeTab === 'cv' && (
                    <motion.div
                      key="cv"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-white">BUDI SANTOSO, S.T.</h4>
                          <p className="text-xs text-emerald-400">Senior Frontend Engineer & UI Designer</p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          ATS SCORE: 98%
                        </span>
                      </div>
                      <div className="text-xs space-y-2 text-zinc-400">
                        <p className="text-zinc-300 font-semibold">// EXPERIENCES</p>
                        <div className="pl-3 border-l border-zinc-700 space-y-1">
                          <p className="text-white font-medium">Tech Lead @ Unicorn Startup (2022 - Present)</p>
                          <p className="text-[11px]">Memimpin tim 12 dev, optimasi performa web hingga 40%.</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-2 text-zinc-400">
                        <p className="text-zinc-300 font-semibold">// SKILLS & TOOLS</p>
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          {['React', 'Next.js', 'TypeScript', 'Tailwind', 'Figma', 'System Design'].map((s, i) => (
                            <span key={i} className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">{s}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'portfolio' && (
                    <motion.div
                      key="portfolio"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="border-b border-zinc-800 pb-3">
                        <h4 className="text-sm font-bold text-white">WORK_PORTFOLIO_2026.PDF</h4>
                        <p className="text-xs text-zinc-400">Showcase Proyek Desain & Development</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 bg-zinc-800/80 rounded-lg border border-zinc-700/80 p-3 flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-400">PROYEK 01</span>
                          <span className="text-xs font-bold text-white">E-Commerce App</span>
                        </div>
                        <div className="h-24 bg-zinc-800/80 rounded-lg border border-zinc-700/80 p-3 flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-400">PROYEK 02</span>
                          <span className="text-xs font-bold text-white">Fintech Dashboard</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'brosur' && (
                    <motion.div
                      key="brosur"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 rounded-xl border border-zinc-700 text-center">
                        <p className="text-xs font-bold text-amber-400 tracking-widest">SPECIAL PROMO</p>
                        <h4 className="text-lg font-black text-white mt-1">COMPANY PROFILE & BROCHURE</h4>
                        <p className="text-[11px] text-zinc-400 mt-1">Desain cetak & digital siap edar untuk bisnis lo</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'resi' && (
                    <motion.div
                      key="resi"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-white">OFFICIAL INVOICE / RESI</span>
                        <span className="text-[10px] text-emerald-400 font-bold">PAID #INV-88392</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-400">
                        <div className="flex justify-between">
                          <span>Jasa Desain CV Premium</span>
                          <span className="text-white">Rp 75.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Surat Lamaran Fast Track</span>
                          <span className="text-white">Rp 25.000</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Render Engine: CIVITA_v2.4</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready to export
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        <motion.div
          style={{ x: bgTextX }}
          className="absolute top-1/2 -translate-y-1/2 text-[14rem] font-black text-zinc-200/40 dark:text-zinc-900/40 whitespace-nowrap -z-10 pointer-events-none select-none tracking-tighter"
        >
          CIVITA DESAIN KERJA
        </motion.div>
      </section >

      < section id="paket" className="py-24 max-w-6xl mx-auto px-6" >
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> /paket_harga
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Harga Ramah Kantong Mahasiswa.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
            Investasi sekali buat lolos karir impian. Tanpa biaya tersembunyi, pengerjaan cepat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingData.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-[2rem] p-8 border text-left flex flex-col justify-between relative ${plan.isPopular
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xl scale-102'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  MOST POPULAR 🔥
                </span>
              )}

              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.isPopular ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'}`}>
                  {plan.tag}
                </span>
                <h3 className="text-xl font-bold mt-1">{plan.title}</h3>
                <p className={`text-xs mt-2 leading-relaxed ${plan.isPopular ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {plan.desc}
                </p>

                <div className="my-6">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className={`text-xs ml-1 ${plan.isPopular ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'}`}>/berkas</span>
                </div>

                <ul className="space-y-3 text-xs mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.isPopular ? 'text-amber-400 dark:text-zinc-900' : 'text-emerald-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo CIVITA, saya tertarik ambil paket ${plan.title} (${plan.price})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl font-bold text-xs text-center transition-all ${plan.isPopular
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                  }`}
              >
                Pesan via WhatsApp
              </a>
            </motion.div>
          ))}
        </div>
      </section >

      < section id="testi" className="py-24 max-w-6xl mx-auto px-6 border-t border-zinc-200/80 dark:border-zinc-800/80" >
        <div className="mb-14 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <Skull className="w-3.5 h-3.5" /> /kata_mereka
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            User Testimoni (No Settingan).
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xl">
            Cerita asli dari mereka yang hampir putus asa kirim 100+ lamaran tapi auto-panggil pas ganti CV ke CIVITA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialsData.map((testi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] p-6 text-left flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${testi.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
                    {testi.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{testi.name}</h4>
                    <p className="text-[11px] text-zinc-400">{testi.role} @ {testi.company}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                  "{testi.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-emerald-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{testi.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section >

      < section className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80" >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#fafafa] dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-10 sm:p-14 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mx-auto mb-6 shadow-md">
              <MessageSquare className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              SIAP LOLOS INTERVIEW MINGGU INI?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Jangan biarkan berkas standar menghambat potensi karir lo. Chat admin CIVITA sekarang, konsultasi gratis tanpa dipungut biaya!
            </p>

            {/* Direct Contact Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-semibold text-xs flex items-center justify-center gap-2.5 shadow-lg active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Admin WA (+62 823-1294-5365)</span>
              </a>

              <a
                href="https://www.instagram.com/bikincivita/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-6 py-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-semibold text-xs flex items-center justify-center gap-2 active:scale-95"
              >
                <ChartPieIcon className="w-4 h-4 text-pink-500" />
                <span>@bikincivita</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Email: civitakerja@gmail.com</span>
            </div>
          </motion.div>
        </div>
      </section >

      < footer className="py-10 text-center text-xs text-zinc-400 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#fafafa] dark:bg-zinc-950" >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <Command className="w-4 h-4" />
            <span>CIVITA_STUDIO</span>
          </div>

          <p className="text-[11px]">
            Dibuat dengan 💻, ☕, dan harapan lulus HRD fast-track.
          </p>

          <p className="text-[11px]">
            © {new Date().getFullYear()} CIVITA. All rights reserved.
          </p>
        </div>
      </footer >
    </>
  );
}

const servicesData: ServiceItem[] = [
  {
    id: "cv",
    title: "Desain CV ATS & Creative",
    subtitle: "Lolos robot ATS + Disukai HRD",
    description: "Format resume profesional yang lolos sistem pemindaian ATS, namun tetap dibalut dengan visual ala Apple UI yang elegan.",
    badge: "BEST SELLER 🔥",
    icon: CommandIcon,
    highlights: [
      "Struktur kata kunci ATS ter-optimasi",
      "Format PDF ringan & anti-corrupt",
      "Bonus konsultasi posisi karir"
    ]
  },
  {
    id: "surat",
    title: "Surat Lamaran (Cover Letter)",
    subtitle: "Kata-kata persuasif non-ChatGPT",
    description: "Bikin HRD penasaran sejak paragraf pertama. Bebas kata-kata klise copy-paste yang bikin bosan.",
    badge: "FAST TRACK",
    icon: CommandIcon,
    highlights: [
      "Disesuaikan dengan posisi incaran",
      "Bahasa Indonesia / Inggris baku",
      "Siap kirim via Email / Portal Kerja"
    ]
  },
  {
    id: "portfolio",
    title: "Portfolio Kerja & Perusahaan",
    subtitle: "Layout Skena Minimalis macOS",
    description: "Majang hasil karya terbaik milik lo atau profil bisnis dalam bentuk katalog visual grid yang bersih & interaktif.",
    badge: "EXCLUSIVE",
    icon: CommandIcon,
    highlights: [
      "Tampilan grid gallery ala Apple",
      "Sangat cocok untuk Desainer & Dev",
      "Bisa versi PDF / Link interaktif"
    ]
  },
  {
    id: "brosur",
    title: "Brosur & Katalog Promosi",
    subtitle: "Tingkatkan kelas bisnis lo",
    description: "Promosikan produk atau jasa usaha lo dengan brosur modern berstandar agensi tanpa harga selangit.",
    badge: "BUSINESS",
    icon: CommandIcon,
    colSpan: "md:col-span-2",
    highlights: [
      "Siap cetak HD + Format Digital Share",
      "Pilihan susunan lipat 2 / lipat 3",
      "Revisi gratis sampai cocok"
    ]
  },
  {
    id: "resi",
    title: "Desain Resi & Invoice",
    subtitle: "Branding nota usaha terpercaya",
    description: "Nota transaksi digital yang rapi dan profesional untuk meningkatkan kepercayaan pelanggan UMKM / Online Shop lo.",
    badge: "UMKM FRIENDLY",
    icon: CommandIcon,
    highlights: [
      "Template editable Excel/PDF",
      "Kalkulasi rumus otomatis",
      "Watermark & Logo Brand gratis"
    ]
  }
];

// --- Data Dummy Pricing ---
const pricingData: PricingOption[] = [
  {
    title: "Paket Basic CV",
    price: "Rp 35.000",
    tag: "MAHASISWA / FRESHGRAD",
    desc: "Cocok buat lo yang butuh CV kilat siap kirim untuk magang atau entry-level.",
    features: [
      "1x Desain CV (ATS / Creative)",
      "Pengerjaan 1-2 Hari Kerja",
      "Format PDF Master",
      "1x Revisi Ringan"
    ]
  },
  {
    title: "Paket Combo Career",
    price: "Rp 65.000",
    tag: "PRO / EXPERIENCED",
    desc: "Paket komplit buat naklukin HRD di perusahaan BUMN / FMCG / Tech Startup.",
    isPopular: true,
    features: [
      "1x Desain CV ATS + Creative",
      "1x Surat Lamaran Persuasif",
      "Pengerjaan Prioritas Express",
      "Format PDF + Word Editable",
      "Bebas 3x Revisi"
    ]
  },
  {
    title: "Paket Biz & Portfolio",
    price: "Rp 120.000+",
    tag: "FREELANCER & UMKM",
    desc: "Khusus pemesanan Portfolio lengkap, Brosur Cetak, atau Resi Usaha.",
    features: [
      "Desain Multi-Halaman Clean UI",
      "High Resolution Print Ready",
      "Custom Brand Color Palette",
      "Konsultasi Layout Bebas"
    ]
  }
];

// --- Data Dummy Testimonials ---
const testimonialsData: TestimonialItem[] = [
  {
    name: "Rian Ardianto",
    role: "Frontend Dev",
    company: "Unicorn Startup",
    comment: "Gokil sih CIVITA! Dulu ngirim 50 lamaran ga ada dipanggil sama sekali. Pas ganti pake CV buatan CIVITA yang UI-nya ala macOS, besoknya langsung dipanggil interview!",
    status: "Lolos Interview FMCG",
    avatarBg: "bg-blue-600"
  },
  {
    name: "Siti Nurhaliza",
    role: "Social Media Specialist",
    company: "Creative Agency",
    comment: "Portfolio buatan CIVITA aesthetic parah! HRD-nya pas interview malah nanya beli template dimana. Auto diterima kerja dalam waktu 3 hari.",
    status: "Diterima Kerja",
    avatarBg: "bg-pink-600"
  },
  {
    name: "Kevin Sanjaya",
    role: "Owner Toko Online",
    company: "Fashion Brand",
    comment: "Bikin brosur dan resi usaha di CIVITA bikin brand online shop saya kelihatan jauh lebih profesional & terpercaya. Orderan naik pesat!",
    status: "Repeat Customer",
    avatarBg: "bg-emerald-600"
  }
];