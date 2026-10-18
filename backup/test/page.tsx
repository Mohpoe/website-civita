"use client";

import { ModeToggle } from "@/components/theme-toggle-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, ChevronRightIcon, FileText, Layout, Mail, MessageCircle, Sparkles, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin } from "react-icons/tfi";

// Palet Warna Neo-Brutalism Kustom
const NEO_PALETTE = [
  { light: '#FFE66D', dark: '#4A4310' }, // Kuning
  { light: '#FF9E79', dark: '#522814' }, // Oranye
  { light: '#B3A2FF', dark: '#32275C' }, // Ungu
  { light: '#98F5E1', dark: '#154D40' }, // Mint
  { light: '#FFB5E8', dark: '#4D1B3E' }, // Pink
  { light: '#B2F0B2', dark: '#1E3E26' }, // Hijau
];

// Konfigurasi Link Hardcoded (Bisa disesuaikan dengan constants Anda nanti)
const LINKS = {
  WHATSAPP: "https://wa.me/6281234567890",
  INSTAGRAM: "https://instagram.com/civitakerja",
  LINKEDIN: "https://linkedin.com/company/civitakerja",
  EMAIL: "mailto:halo@civita.id",
  DASHBOARD: "/dashboard"
};

// #region HEADER NAVIGATION
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`
        pointer-events-auto flex items-center justify-between px-5 md:px-6 py-3 md:py-3.5 rounded-full transition-all duration-500 border-4 border-transparent shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]
        ${scrolled ? "bg-background/90 backdrop-blur-md w-full max-w-4xl !border-2 !border-foreground" : "bg-background md:bg-background border-foreground w-full max-w-6xl"}
      `}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--brand-color)] border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl flex items-center justify-center" style={{ '--brand-color': NEO_PALETTE[0].light } as React.CSSProperties}>
            <Image alt="Logo" src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg" className="size-5 [filter:brightness(0)]" width={1} height={1} />
          </div>
          <span className="font-black tracking-tight text-xl md:text-2xl">CIVITA</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={LINKS.DASHBOARD}>
                <Button variant="outline" className="h-11 px-6 font-black rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_#000] dark:hover:shadow-[0px_0px_0px_0px_#fff] transition-all">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={LINKS.DASHBOARD}>
                <Button className="h-11 px-6 font-black rounded-full bg-[#B2F0B2] dark:bg-[#1E3E26] text-black dark:text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_#000] dark:hover:shadow-[0px_0px_0px_0px_#fff] transition-all">
                  Daftar Baru
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href={LINKS.DASHBOARD} className={buttonVariants({ className: "h-11 px-6 font-black !rounded-full !border-2 !border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_#000] dark:hover:shadow-[0px_0px_0px_0px_#fff] transition-all mr-2 !bg-[#B3A2FF] dark:!bg-[#32275C] !text-black dark:!text-white" })}>
                Dashboard
              </Link>
              <div className="border-2 border-foreground rounded-full shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                <UserButton />
              </div>
            </Show>
          </div>

          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-foreground mx-1" />

          <Button onClick={() => window.open(LINKS.WHATSAPP, "_blank")} className="hidden md:flex h-11 px-6 rounded-full font-black bg-[#FF9E79] dark:bg-[#522814] text-black dark:text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_#000] dark:hover:shadow-[0px_0px_0px_0px_#fff] transition-all">
            Konsultasi <ArrowRight className="w-5 h-5 ml-2 stroke-[3px]" />
          </Button>

          <ModeToggle />
        </div>
      </div>
    </motion.header>
  );
};
// #endregion

// #region MOBILE BOTTOM BAR
const MobileBottomBar = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t-4 border-foreground p-3 flex items-center justify-between gap-3 shadow-[0px_-4px_0px_0px_#000] dark:shadow-[0px_-4px_0px_0px_#fff]">
    <Show when="signed-out">
      <SignInButton mode="modal" fallbackRedirectUrl={LINKS.DASHBOARD}>
        <Button variant="outline" className="flex-1 h-14 rounded-full border-2 border-foreground font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
          Masuk
        </Button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl={LINKS.DASHBOARD}>
        <Button className="flex-1 h-14 rounded-full border-2 border-foreground bg-[#B2F0B2] dark:bg-[#1E3E26] text-black dark:text-white font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
          Daftar
        </Button>
      </SignUpButton>
    </Show>

    <Show when="signed-in">
      <Link href={LINKS.DASHBOARD} className={buttonVariants({ variant: "outline", className: "flex-1 h-14 rounded-full border-2 border-foreground font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all !bg-[#B3A2FF] dark:!bg-[#32275C] !text-black dark:!text-white" })}>
        Dashboard Utama
      </Link>
      <div className="flex items-center justify-center px-1 border-2 border-foreground rounded-full shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
        <UserButton />
      </div>
    </Show>

    <Button onClick={() => window.open(LINKS.WHATSAPP, "_blank")} className="flex-none aspect-square p-0 w-14 h-14 rounded-full bg-[#FF9E79] dark:bg-[#522814] text-black dark:text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
      <SiWhatsapp className="w-7 h-7" />
    </Button>
  </div>
);
// #endregion

// #region HERO SECTION
const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 px-6 border-b-4 border-foreground bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="absolute inset-0 bg-background/80 -z-10" />

      <motion.div
        className="max-w-4xl w-full mx-auto flex flex-col items-center text-center gap-8 z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFE66D] dark:bg-[#4A4310] border-4 border-foreground text-sm md:text-base text-black dark:text-white font-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <span className="relative flex h-3 w-3 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground"></span>
          </span>
          Jasa CV Profesional & ATS Friendly
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] text-foreground uppercase drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff] stroke-foreground">
          Bikin HRD <br />
          <span className="text-[#FF9E79] dark:text-[#522814]">Langsung Lirik!</span>
        </h1>

        <p className="text-xl md:text-2xl text-foreground font-bold max-w-2xl leading-relaxed bg-background border-4 border-foreground p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
          Dapatkan desain CV, Resume, Cover Letter, hingga berbagai Produk Digital premium untuk mengakselerasi karir dan bisnismu!
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 w-full mt-6">
          <Button className="rounded-full h-16 px-10 w-full sm:w-auto font-black text-xl bg-[#98F5E1] dark:bg-[#154D40] text-black dark:text-white border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:translate-y-[4px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all" onClick={() => window.open(LINKS.WHATSAPP, "_blank")}>
            <SiWhatsapp className="w-6 h-6 mr-3" />
            Chat WhatsApp
          </Button>
          <Button className="rounded-full h-16 px-10 w-full sm:w-auto font-black text-xl bg-[#FFB5E8] dark:bg-[#4D1B3E] text-black dark:text-white border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:translate-y-[4px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all" onClick={() => window.open(LINKS.INSTAGRAM, "_blank")}>
            <Instagram className="w-6 h-6 mr-3" />
            Portofolio Kami
          </Button>
        </div>
      </motion.div>
    </section>
  );
};
// #endregion

// #region SERVICES SECTION
const Services = () => {
  const services = [
    { title: "CV ATS Friendly", desc: "Standar baku HRD perusahaan BUMN, Corporate, dan Tech Company. Mudah lolos screening robot ATS.", icon: FileText, color: NEO_PALETTE[3] }, // Mint
    { title: "CV Kreatif & Estetik", desc: "Visual menonjol dan out of the box. Sangat cocok untuk apply ke Agensi Kreatif, Media, dan Startup.", icon: Sparkles, color: NEO_PALETTE[4] }, // Pink
    { title: "Cover Letter Pro", desc: "Surat lamaran kerja formal, sopan, dan terstruktur. Ditulis custom khusus untuk Anda.", icon: MessageCircle, color: NEO_PALETTE[2] }, // Ungu
    { title: "Desain Portofolio", desc: "Showcase karyamu dengan profesional. Tingkatkan peluang karir dengan presentasi yang meyakinkan.", icon: Briefcase, color: NEO_PALETTE[0] }, // Kuning
    { title: "Produk Digital", desc: "Template, tools, dan aset digital siap pakai dengan harga terjangkau untuk menunjang produktivitas.", icon: Layout, color: NEO_PALETTE[1] }, // Oranye
  ];

  return (
    <section className="py-32 px-6 bg-background border-b-4 border-foreground">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-block px-6 py-2 rounded-full bg-[#B3A2FF] dark:bg-[#32275C] text-black dark:text-white border-4 border-foreground font-black text-lg shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] uppercase">Kenapa Memilih Kami?</div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">Layanan <br className="md:hidden" />Super Lengkap</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-[2.5rem] border-4 border-foreground p-8 transition-all hover:-translate-y-2 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] hover:shadow-[12px_12px_0px_0px_#000] dark:hover:shadow-[12px_12px_0px_0px_#fff] ${idx === 3 || idx === 4 ? 'lg:col-span-1.5' : ''}`}
              style={{
                '--card-bg-light': svc.color.light,
                '--card-bg-dark': svc.color.dark,
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] -z-10" />
              <div className="absolute top-0 right-0 p-6 opacity-20 transition-transform group-hover:scale-125 duration-500">
                <svc.icon className="w-32 h-32 text-black dark:text-white" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex items-center justify-center mb-8">
                  <svc.icon className="w-8 h-8 text-foreground" />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight text-black dark:text-white uppercase">{svc.title}</h3>
                  <p className="text-black/80 dark:text-white/80 font-bold text-lg leading-snug">{svc.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region CTA FOOTER SECTION
const CTAFooter = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#B2F0B2] dark:bg-[#1E3E26] border-b-4 border-foreground">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.05)_20px,rgba(0,0,0,0.05)_40px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.02)_20px,rgba(255,255,255,0.02)_40px)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black dark:text-white drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff] uppercase">
          Tunggu Apa Lagi?
        </h2>
        <p className="text-2xl font-black text-black dark:text-white max-w-3xl mx-auto leading-relaxed bg-background/20 dark:bg-background/40 backdrop-blur-sm border-4 border-foreground p-6 rounded-3xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
          Jangan biarkan karirmu mandek karena CV yang kurang maksimal. Hubungi kami sekarang dan buat HRD terkesan pada pandangan pertama!
        </p>

        <div className="flex justify-center pt-8">
          <Button
            onClick={() => window.open(LINKS.WHATSAPP, "_blank")}
            className="group relative inline-flex items-center justify-center gap-4 h-20 px-12 bg-[#FF9E79] dark:bg-[#522814] text-black dark:text-white border-4 border-foreground rounded-full font-black text-2xl shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-2 transition-all uppercase"
          >
            Chat Admin Sekarang
            <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-2 transition-transform stroke-[4px]" />
          </Button>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region FOOTER & POPUP
const Footer = () => {
  return (
    <footer className="bg-background pt-20 pb-32 md:pb-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFE66D] dark:bg-[#4A4310] border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rounded-2xl flex items-center justify-center">
              <Image alt="Logo" src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg" className="size-8 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]" width={1} height={1} />
            </div>
            <span className="font-black tracking-tight text-4xl uppercase">CIVITA.ID</span>
          </div>

          <div className="flex flex-col gap-4 text-lg font-black">
            <a href={LINKS.WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:bg-[#FFB5E8] dark:hover:bg-[#4D1B3E] transition-colors bg-card w-max px-6 py-3 rounded-full border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] active:translate-y-1 active:shadow-none">
              <SiWhatsapp className="w-6 h-6" /> +62 823-1294-5365
            </a>
            <a href={LINKS.EMAIL} className="flex items-center gap-4 hover:bg-[#98F5E1] dark:hover:bg-[#154D40] transition-colors bg-card w-max px-6 py-3 rounded-full border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] active:translate-y-1 active:shadow-none">
              <Mail className="w-6 h-6" /> civitakerja@gmail.com
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 text-lg font-black">
          <a href={LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="w-full sm:w-auto hover:bg-[#FF9E79] dark:hover:bg-[#522814] hover:text-black dark:hover:text-white bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] px-8 py-4 rounded-full transition-all flex justify-center items-center gap-3 active:translate-y-1 active:shadow-none">
            <Instagram className="w-6 h-6" /> Instagram
          </a>
          <a href={LINKS.LINKEDIN} target="_blank" rel="noreferrer" className="w-full sm:w-auto hover:bg-[#B3A2FF] dark:hover:bg-[#32275C] hover:text-black dark:hover:text-white bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] px-8 py-4 rounded-full transition-all flex justify-center items-center gap-3 active:translate-y-1 active:shadow-none">
            <TfiLinkedin className="w-6 h-6" /> LinkedIn
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-20 pt-10 border-t-4 border-foreground flex flex-col md:flex-row justify-between items-center gap-6 font-black text-base uppercase">
        <p>© {new Date().getFullYear()} <span className="bg-[#FFE66D] dark:bg-[#4A4310] px-2 py-1 border-2 border-foreground rounded-md">Mohpoe</span>. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <Link href="/terms" className="hover:underline decoration-4 underline-offset-4">Syarat & Ketentuan</Link>
          <Link href="/privacy" className="hover:underline decoration-4 underline-offset-4">Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
};

const PricingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(5px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-28 md:bottom-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-12 z-[70] flex items-center gap-4 p-4 pr-5 bg-[#FFE66D] dark:bg-[#4A4310] text-black dark:text-white border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-[2rem] w-max max-w-[90vw]"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground text-background shadow-inner shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex flex-col mr-4">
            <span className="text-[13px] font-black tracking-widest uppercase leading-none mb-2">
              Produk Digital
            </span>
            <span className="text-lg font-black leading-none">
              Mulai dari <strong className="text-[#ef3936] dark:text-[#FF9E79] border-b-4 border-foreground pb-0.5">13 Ribu!</strong>
            </span>
          </div>
          <button onClick={() => setIsVisible(false)} className="p-2 bg-background border-4 border-foreground hover:bg-[#FFB5E8] dark:hover:bg-[#4D1B3E] rounded-full transition-all ml-2 active:translate-y-1 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <XIcon className="w-6 h-6 text-foreground stroke-[3px]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// #endregion

// #region APP WRAPPER
export default function LandingPageTemplate() {
  return (
    <div className="font-mono text-foreground antialiased selection:bg-[#FF9E79] dark:selection:bg-[#522814] selection:text-black min-h-screen bg-background pb-20 md:pb-0 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        body {
          font-family: var(--font-mono);
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 16px;
        }
        ::-webkit-scrollbar-track {
          background: hsl(var(--background));
          border-left: 4px solid hsl(var(--foreground));
        }
        ::-webkit-scrollbar-thumb {
          background: #B3A2FF;
          border-left: 4px solid hsl(var(--foreground));
          border-bottom: 4px solid hsl(var(--foreground));
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #FFE66D;
        }
        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-thumb {
            background: #32275C;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #4A4310;
          }
        }
      `}} />

      <Navigation />
      <MobileBottomBar />

      <main>
        <Hero />
        <Services />
        <CTAFooter />
      </main>

      <Footer />
      <PricingPopup />
    </div>
  );
}
// #endregion