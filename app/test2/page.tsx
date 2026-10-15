"use client";

import { ModeToggle } from "@/components/theme-toggle-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, ChevronLeft, ChevronRight, FileText, Layout, Mail, MessageCircle, QuoteIcon, Sparkles, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin } from "react-icons/tfi";

// #region DOCUMENT MOCKUPS (NEO-POP STYLED)
interface DocumentMockupProps { className?: string; }

const DocumentMockupCV = ({ className }: DocumentMockupProps) => (
  <div className={`bg-background backdrop-blur-xl border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-[2rem] p-5 flex flex-col gap-4 ${className}`}>
    <div className="flex items-center gap-3 border-b-4 border-foreground/10 pb-4">
      <div className="w-12 h-12 rounded-full bg-[#f68e51] dark:bg-[#d97941] border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] animate-pulse" />
      <div className="flex flex-col gap-2">
        <div className="w-24 h-3 bg-foreground rounded-full" />
        <div className="w-16 h-2 bg-foreground/50 rounded-full" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-2.5 bg-muted-foreground/20 rounded-full" />
      <div className="w-5/6 h-2.5 bg-muted-foreground/20 rounded-full" />
      <div className="w-4/6 h-2.5 bg-muted-foreground/20 rounded-full" />
    </div>
    <div className="mt-2 space-y-3">
      <div className="flex gap-3">
        <div className="w-1/3 h-16 bg-[#ef3936]/10 dark:bg-[#d9302d]/20 rounded-xl border-2 border-[#ef3936] dark:border-[#d9302d]" />
        <div className="w-2/3 space-y-2.5 pt-1">
          <div className="w-full h-2.5 bg-foreground/20 rounded-full" />
          <div className="w-4/5 h-2.5 bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const DocumentMockupPortfolio = ({ className }: DocumentMockupProps) => (
  <div className={`bg-[#f68e51] dark:bg-[#d97941] backdrop-blur-xl border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-[2rem] p-5 flex flex-col gap-4 ${className}`}>
    <div className="w-32 h-4 bg-background rounded-full mb-2 border-2 border-foreground" />
    <div className="grid grid-cols-2 gap-3">
      <div className="aspect-square bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl" />
      <div className="aspect-square bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl" />
      <div className="aspect-square bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl" />
      <div className="aspect-square bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl" />
    </div>
  </div>
);

const DocumentMockupCoverLetter = ({ className }: DocumentMockupProps) => (
  <div className={`bg-background backdrop-blur-xl border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-[2rem] p-6 flex flex-col gap-3 ${className}`}>
    <div className="w-14 h-14 bg-[#ef3936] dark:bg-[#d9302d] rounded-2xl mb-4 flex items-center justify-center border-2 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
      <Sparkles className="text-white w-7 h-7" />
    </div>
    <div className="w-1/2 h-3 bg-foreground rounded-full mb-5" />
    <div className="space-y-3">
      <div className="w-full h-2 bg-foreground/20 rounded-full" />
      <div className="w-full h-2 bg-foreground/20 rounded-full" />
      <div className="w-5/6 h-2 bg-foreground/20 rounded-full" />
      <div className="w-full h-2 bg-foreground/20 rounded-full" />
      <div className="w-4/5 h-2 bg-foreground/20 rounded-full" />
    </div>
  </div>
);
// #endregion

// #region HEADER NAVIGATION
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
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
        ${scrolled ? "bg-background/80 backdrop-blur-md w-full max-w-3xl !border-2 !border-foreground" : "bg-background md:bg-background border-foreground w-full max-w-6xl"}
      `}>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-inner">
            <Image
              alt="Logo"
              src="/assets/Icon.svg"
              className="size-4 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-black tracking-tight text-xl">CIVITA.ID</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* CLERK AUTHENTICATION MENU (DESKTOP ONLY - Mobile ada di Bottom Bar) */}
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button variant="outline" className="h-10 px-5 font-bold rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] transition-all">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button className="h-10 px-5 font-bold rounded-full bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] transition-all">
                  Daftar
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ className: "h-10 px-5 font-bold !rounded-full !border-2 !border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] transition-all mr-2 !bg-[#f68e51] dark:!bg-[#d97941] !text-black" })}>
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>

          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-foreground mx-1" />

          {/* CTA Utama Desktop */}
          <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, "_blank")} className="hidden md:flex h-10 px-5 rounded-full font-bold bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] transition-all">
            Konsultasi <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Mode Toggle (Selalu tampil) */}
          <ModeToggle />
        </div>

      </div>
    </motion.header>
  );
};
// #endregion

// #region MOBILE BOTTOM BAR (Khusus Smartphone)
const MobileBottomBar = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t-4 border-foreground p-3 flex items-center justify-between gap-3 shadow-[0px_-4px_0px_0px_#000] dark:shadow-[0px_-4px_0px_0px_#fff]">
    <Show when="signed-out">
      <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
        <Button variant="outline" className="flex-1 h-12 rounded-full border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
          Masuk
        </Button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
        <Button className="flex-1 h-12 rounded-full border-2 border-foreground bg-[#f68e51] dark:bg-[#d97941] text-black font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
          Daftar
        </Button>
      </SignUpButton>
    </Show>

    <Show when="signed-in">
      <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ variant: "outline", className: "flex-1 h-12 rounded-full border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all" })}>
        Dashboard Utama
      </Link>
      <div className="flex items-center justify-center px-1">
        <UserButton />
      </div>
    </Show>

    <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, "_blank")} className="flex-none aspect-square p-0 w-12 h-12 rounded-full bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-1 active:shadow-none transition-all">
      <SiWhatsapp className="w-6 h-6" />
    </Button>
  </div>
);
// #endregion

// #region HERO SECTION
const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section ref={containerRef} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-32 pb-20 px-6 border-b-4 border-foreground">
      {/* Neo-Pop Background Blobs */}
      <div className="absolute inset-0 bg-background -z-20" />
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#ef3936]/20 dark:bg-[#d9302d]/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#f68e51]/20 dark:bg-[#d97941]/20 rounded-full blur-[80px] -z-10 mix-blend-multiply dark:mix-blend-screen" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-15 pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Content */}
        <motion.div
          className="flex flex-col items-start gap-6 z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f68e51] dark:bg-[#d97941] border-2 border-foreground text-sm font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-foreground"></span>
            </span>
            Harga Murah & Profesional
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-foreground">
            Bantu kamu <br />
            <span className="text-[#ef3936] dark:text-[#d9302d] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">lolos kerja!</span>
          </h1>

          <p className="text-lg text-foreground/80 font-medium max-w-md leading-relaxed border-l-4 border-[#f68e51] dark:border-[#d97941] pl-4">
            Tersedia berbagai desain CV (Curriculum Vitae) & resume, mulai dari ATS-friendly, CV Creative, maupun CV basic yang bisa disesuaikan dengan kebutuhanmu.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full mt-4">
            <Button className="rounded-full h-14 px-8 w-full sm:w-auto font-bold text-base bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all" size="lg" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, "_blank")}>
              <SiWhatsapp className="w-5 h-5 ml-0 mr-2" />
              Chat via WhatsApp
            </Button>
            <Button className="rounded-full h-14 px-8 w-full sm:w-auto font-bold text-base bg-background text-foreground border-2 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] hover:text-background transition-all" size="lg" onClick={() => window.open(APP_CONFIG.LINKS.INSTAGRAM, "_blank")}>
              <Instagram className="w-5 h-5 ml-0 mr-2" />
              Lihat Portofolio
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm font-bold text-foreground">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-foreground bg-muted flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                  <img src={`/assets/people/people${i}.jpg`} alt="client" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="bg-background border-2 border-foreground px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              Dipercaya oleh 1000+ orang.
            </p>
          </div>
        </motion.div>

        {/* Right Parallax Elements */}
        <div className="relative h-[600px] hidden lg:block perspective-[1000px] pointer-events-none">
          <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-10 left-10 w-64 z-20">
            <DocumentMockupCV className="rotate-[-3deg]" />
          </motion.div>
          <motion.div style={{ y: y2, rotate: rotate2 }} className="absolute top-40 right-0 w-72 z-10">
            <DocumentMockupPortfolio className="rotate-[5deg]" />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-10 left-32 w-56 z-30">
            <DocumentMockupCoverLetter className="rotate-[-2deg]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region SERVICES SECTION
const Services = () => {
  return (
    <section className="py-32 px-6 bg-muted/40 border-b-4 border-foreground">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground font-black text-sm shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">LAYANAN KAMI</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">90%+ Desain CV Disukai HRD</h2>
          <p className="text-foreground/70 font-medium text-lg">Telah terbukti disukai dan sangat mudah di-<em>screening</em> oleh para Recruiter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 - Red */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-[#ef3936] dark:bg-[#d9302d] text-white border-4 border-foreground p-8 transition-all hover:-translate-y-2 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff]">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-500 group-hover:rotate-12">
              <FileText className="w-40 h-40" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-background text-[#ef3936] dark:text-[#d9302d] border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">CV & Resume Design</h3>
                <p className="text-white/90 max-w-md font-medium text-lg leading-snug">Layout CV & Resume ATS-friendly yang simpel dan mudah di-screening para HR. Desain CV Kreatif yang aesthetic. Dan CV Basic yang ramah di kantong.</p>
              </div>
            </div>
          </div>

          {/* Card 2 - Orange */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-[#f68e51] dark:bg-[#d97941] text-black border-4 border-foreground p-8 transition-all hover:-translate-y-2 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff]">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-500 group-hover:-rotate-12">
              <MessageCircle className="w-32 h-32" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-background text-foreground border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Cover Letter</h3>
                <p className="text-black/80 font-bold leading-snug">Cover letter & surat lamaran kerja yang disusun secara profesional untuk perbesar peluang lolos kerja.</p>
              </div>
            </div>
          </div>

          {/* Card 3 - White/Bg */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-background border-4 border-foreground p-8 transition-all hover:-translate-y-2 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff]">
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center mb-6">
                <Layout className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Brosur, Flyer, & Resi</h3>
                <p className="text-foreground/70 font-medium">Buat bisnis kamu jadi lebih profesional dan menarik pelanggan saat promosi.</p>
              </div>
            </div>
          </div>

          {/* Card 4 - White/Bg */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-background border-4 border-foreground p-8 transition-all hover:-translate-y-2 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff] flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-72 translate-x-12 translate-y-12 opacity-30 transition-transform group-hover:scale-105 duration-500">
              <DocumentMockupPortfolio />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Company Profile & Portfolio</h3>
                <p className="text-foreground/70 font-medium max-w-md text-lg leading-snug">Showcase karyamu dengan profesional, dan tingkatkan peluang bisnis yang lebih baik di mata klien.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region PROCESS SECTION
const Process = () => {
  const steps = [
    { num: "01", title: "Konsultasi Kebutuhan", desc: "Diskusi via WhatsApp, konfirmasi jenis CV atau kebutuhan lain, baik berbahasa Indonesia atau English." },
    { num: "02", title: "Payment & Eksekusi", desc: "Dengan harga terjangkau mulai dari 13K dapatkan CV & Resume yang profesional." },
    { num: "03", title: "Revisi Tipis-Tipis", desc: "Untuk lebih menyesuaikan dengan kebutuhan kamu, kami siap revisi hingga maksimal 2 hari." },
    { num: "04", title: "Done & Good Luck!", desc: "Kami akan kirimkan semua yang kamu butuhkan untuk melamar pekerjaan yang kamu inginkan." }
  ];

  return (
    <section className="py-32 px-6 bg-background border-b-4 border-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(#f68e51_2px,transparent_2px)] dark:bg-[radial-gradient(#d97941_2px,transparent_2px)] [background-size:24px_24px] opacity-20 -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
          <div className="md:w-5/12">
            <div className="sticky top-32 bg-background p-8 rounded-[2rem] border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground font-black text-sm shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">PROSES CEPAT</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Murah, Cepat & Profesional.</h2>
              <p className="text-foreground/80 font-medium mb-10 text-lg leading-relaxed">Dirancang oleh profesional untuk kamu yang pusing cari pekerjaan <em>in this economy</em>. Kami tangani dengan cepat!</p>
              <Button className="h-14 px-8 w-full rounded-full font-bold text-lg bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, "_blank")}>
                Mulai Sekarang!
              </Button>
            </div>
          </div>

          <div className="md:w-7/12 py-8">
            <div className="space-y-12">
              {steps.map((step, i) => (
                <div key={i} className="group relative flex gap-6 md:gap-8 bg-card/50 p-6 rounded-3xl border-2 border-transparent hover:border-foreground hover:bg-background hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] transition-all duration-300">
                  {/* Line connector */}
                  {i !== steps.length - 1 && (
                    <div className="absolute left-[3rem] md:left-[3rem] top-20 bottom-[-8rem] w-1.5 bg-foreground/10 group-hover:bg-[#f68e51] dark:group-hover:bg-[#d97941] transition-colors rounded-full z-5" />
                  )}

                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-[#f68e51] dark:bg-[#d97941] border-4 border-foreground flex items-center justify-center text-xl font-black text-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#ef3936] dark:group-hover:bg-[#d9302d] group-hover:text-white">
                    {step.num}
                  </div>

                  <div className="pt-2">
                    <h3 className="text-2xl font-black mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-foreground/70 font-medium text-lg leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region PORTFOLIO SHOWCASE
const PortfolioShowcase = () => {
  const [activeTab, setActiveTab] = useState("Semua");
  const tabs = ["Semua", "ATS", "Resume", "Surat Lamaran"];

  const portfolioItems = [
    { id: 1, type: "ATS", title: "Jasa Pembuatan CV ATS Friendly Corporate", desc: "CV ATS friendly standar HRD untuk melamar lowongan kerja di BUMN, Corporate, dan Tech Company.", imageSrc: "/assets/portofolio/cv-ats-1.webp" },
    { id: 2, type: "Resume", title: "Desain CV Kreatif Estetik Gen-Z", desc: "Contoh CV kreatif dengan desain visual menonjol, sangat cocok untuk apply ke Agensi Kreatif dan Startup.", imageSrc: "/assets/portofolio/resume-1.webp" },
    { id: 3, type: "Surat Lamaran", title: "Jasa Surat Lamaran Kerja Profesional", desc: "Format Cover Letter formal yang sopan, terstruktur, dan ditulis custom (bukan template pasaran).", imageSrc: "/assets/portofolio/surat-lamaran-1.webp" },
    { id: 4, type: "ATS", title: "Template CV ATS Friendly Minimalis", desc: "Desain CV lamaran kerja yang fokus penuh pada bobot pengalaman kerja, pencapaian, dan skill profesional Anda.", imageSrc: "/assets/portofolio/cv-ats-2.webp" },
    { id: 5, type: "Resume", title: "Pembuatan CV Modern Layout 2 Kolom", desc: "Rekomendasi CV modern dengan perpaduan warna subtle dan layout efisien untuk merangkum riwayat hidup.", imageSrc: "/assets/portofolio/resume-2.webp" },
    { id: 6, type: "Surat Lamaran", title: "Jasa Pembuatan Cover Letter", desc: "Surat lamaran kerja profesional yang rapi dan tone profesional.", imageSrc: "/assets/portofolio/surat-lamaran-2.webp" },
  ];

  const filteredItems = portfolioItems.filter(
    (item) => activeTab === "Semua" || item.type === activeTab
  );

  return (
    <section className="py-32 px-6 bg-[#f68e51]/10 dark:bg-[#d97941]/10 border-b-4 border-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">Desain Yang Mudah di-<em>Screening</em>.</h2>
          <p className="text-foreground/70 font-medium text-lg">
            Setiap CV dan Resume dari kami disusun <em>custom</em> sesuai riwayat pendidikan, pengalaman kerja, dan <em>skills</em> yang kamu miliki!
          </p>
        </div>

        <div className="flex justify-center mb-14">
          <div className="bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-1.5 rounded-full flex gap-2 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 whitespace-nowrap ${activeTab === tab ? "text-background bg-foreground" : "text-foreground hover:bg-muted-foreground/50"}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="portfolioTab" className="absolute inset-0 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground rounded-full -z-10 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]" />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col gap-5"
              >
                <div className="relative bg-background rounded-[2rem] p-4 border-4 border-foreground shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff] transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-6 right-6 bg-[#f68e51] dark:bg-[#d97941] text-black text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider z-10 border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                    {item.type}
                  </div>
                  <div className="relative w-full aspect-[1/1.4] rounded-xl overflow-hidden bg-muted group-hover:scale-[1.02] transition-transform duration-500 ease-out border-2 border-foreground">
                    <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="font-black text-foreground text-xl tracking-tight mb-2">{item.title}</h3>
                  <p className="text-base text-foreground/70 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-20 flex justify-center">
          <Button className="rounded-full h-14 px-8 font-bold bg-background text-foreground border-2 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] hover:text-background transition-all" onClick={() => window.open(APP_CONFIG.LINKS.INSTAGRAM, "_blank")}>
            Lihat Lebih Banyak di Instagram <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region TESTIMONIALS SECTION
const TestimonialTextVariant = () => {
  const reviews = [
    { name: "Raka, 22", role: "Fresh Grad HTS", text: "Sumpah awalnya pesimis gara-gara IPK nasakom, eh desain CV dari Civita bikin HRD salfok. Besok langsung dapet panggilan interview njir." },
    { name: "Nisa, 25", role: "Budak Corporate", text: "ATS friendly tapi tetep aesthetic? Kirain mitos, ternyata beneran ada. Makasih Civita, portfolio gue jadi sekelas anak agensi Jaksel." },
    { name: "Bima, 24", role: "Jobseeker Berkedok Freelancer", text: "Bikin cover letter di sini bahasanya sopan tapi ngga kaku kaya template. HRD-nya notice, pantesan langsung dapet offering letter kemaren." }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {reviews.map((review, i) => (
        <div key={i} className="bg-background border-4 border-foreground rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff] hover:-translate-y-2 transition-all duration-300">
          <QuoteIcon className="w-10 h-10 text-[#ef3936] dark:text-[#d9302d] mb-6 fill-current" />
          <p className="text-foreground font-medium mb-8 text-lg leading-relaxed">"{review.text}"</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f68e51] dark:bg-[#d97941] border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center font-black text-black text-xl">
              {review.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-base text-foreground uppercase tracking-tight">{review.name}</p>
              <p className="text-sm font-bold text-foreground/60">{review.role}</p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const TestimonialChatVariant = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const screenshots = [
    "/assets/testimoni/testimoni1.webp",
    "/assets/testimoni/testimoni2.webp",
    "/assets/testimoni/testimoni3.webp",
    "/assets/testimoni/testimoni4.webp",
    "/assets/testimoni/testimoni5.webp",
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 280 : 344;
      scrollContainerRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="relative w-full max-w-5xl mx-auto">
      <button onClick={() => scroll("left")} className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#f68e51] dark:bg-[#d97941] text-black border-4 border-foreground rounded-full items-center justify-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[calc(-50%+2px)] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all z-10">
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button onClick={() => scroll("right")} className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#f68e51] dark:bg-[#d97941] text-black border-4 border-foreground rounded-full items-center justify-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-[calc(-50%+2px)] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all z-10">
        <ChevronRight className="w-7 h-7" />
      </button>

      <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 pb-8 px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="snap-center shrink-0 w-2 md:hidden"></div>
        {screenshots.map((src, idx) => (
          <div key={idx} className="snap-center shrink-0 w-[260px] md:w-[320px] aspect-[9/16] relative rounded-[2rem] overflow-hidden border-4 border-foreground bg-muted shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] group">
            <img src={src} alt={`WhatsApp Testimonial ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          </div>
        ))}
        <div className="snap-center shrink-0 w-2 md:hidden"></div>
      </div>

      <div className="flex md:hidden justify-center items-center gap-2 -mt-2 text-sm font-bold bg-background border-2 border-foreground w-max mx-auto px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
        <ArrowLeft className="w-4 h-4" /> Geser <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeVariant, setActiveVariant] = useState("chat"); // "text" | "chat"

  return (
    <section className="py-32 px-6 bg-background border-b-4 border-foreground overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">Kata Mereka Yang Keterima Kerja.</h2>
          <p className="text-foreground/70 font-medium text-lg">
            Sudah terbukti dari mereka yang telah diterima kerja di berbagai perusahaan dengan bantuan CV dan Resume dari CIVITA.
          </p>
        </div>

        <div className="flex justify-center mb-14">
          <div className="bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-1.5 rounded-full flex gap-2">
            <button onClick={() => setActiveVariant("text")} className={`relative px-8 py-3 rounded-full text-sm font-black transition-all duration-300 ${activeVariant === "text" ? "text-background bg-foreground" : "text-foreground hover:bg-muted-foreground/50"}`}>
              {activeVariant === "text" && <motion.div layoutId="testiPill" className="absolute inset-0 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground rounded-full -z-10 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]" />}
              <span className="relative z-10">Review Teks</span>
            </button>
            <button onClick={() => setActiveVariant("chat")} className={`relative px-8 py-3 rounded-full text-sm font-black transition-all duration-300 ${activeVariant === "chat" ? "text-background bg-foreground" : "text-foreground hover:bg-muted-foreground/50"}`}>
              {activeVariant === "chat" && <motion.div layoutId="testiPill" className="absolute inset-0 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground rounded-full -z-10 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]" />}
              <span className="relative z-10">Testimoni WA</span>
            </button>
          </div>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeVariant === "text" ? <TestimonialTextVariant key="text" /> : <TestimonialChatVariant key="chat" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region CTA SECTION
const CTA = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#ef3936] dark:bg-[#d9302d]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]">
          Butuh CV & Resume Secepatnya!?
        </h2>
        <p className="text-xl md:text-2xl font-bold text-white max-w-3xl mx-auto leading-relaxed border-b-4 border-transparent hover:border-white transition-all cursor-default">
          Langsung chat admin sekarang! CV kamu langsung jadi dalam 3 jam dan siap digunakan. Dibuat untuk maksimalin peluang dipanggil <em>interview</em>!
        </p>

        <div className="flex justify-center pt-8">
          <div className="flex flex-col w-full sm:w-auto gap-6">
            <button
              onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, "_blank")}
              className="group relative inline-flex items-center justify-center gap-3 h-16 px-10 bg-[#f68e51] dark:bg-[#d97941] text-black border-4 border-foreground rounded-full font-black text-xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-1 transition-all"
            >
              Chat Admin CIVITA
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform stroke-[3px]" />
            </button>

            <Show when="signed-out">
              <div className="flex items-center justify-center gap-4 text-sm font-bold text-white bg-black/20 dark:bg-black/40 p-4 rounded-full backdrop-blur-sm border-2 border-white/20">
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                  <Button variant="link" className="text-white hover:text-[#f68e51] dark:hover:text-[#d97941] transition-colors underline underline-offset-4 font-bold text-base">Masuk ke Akun</Button>
                </SignInButton>
                <Separator className="opacity-50 h-5" orientation="vertical" />
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <Button variant="link" className="text-white hover:text-[#f68e51] dark:hover:text-[#d97941] transition-colors underline underline-offset-4 font-bold text-base">Daftar Member Baru</Button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </section>
  );
};
// #endregion

// #region FOOTER & POPUP
const Footer = () => {
  return (
    <footer className="bg-background border-t-4 border-foreground pt-16 pb-32 md:pb-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-xl flex items-center justify-center">
              <Image alt="Logo" src="/assets/Icon.svg" className="size-5 [filter:brightness(0)_invert(1)]" width={1} height={1} />
            </div>
            <span className="font-black tracking-tight text-2xl uppercase">CIVITA.ID</span>
          </div>

          <div className="flex flex-col gap-4 text-base font-bold">
            <a href={APP_CONFIG.LINKS.WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#ef3936] dark:hover:text-[#d9302d] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              <SiWhatsapp className="w-5 h-5" /> +62 823-1294-5365
            </a>
            <a href={APP_CONFIG.LINKS.EMAIL} className="flex items-center gap-3 hover:text-[#f68e51] dark:hover:text-[#d97941] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              <Mail className="w-5 h-5" /> civitakerja@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 text-base font-black">
          <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="hover:bg-[#ef3936] dark:hover:bg-[#d9302d] hover:text-white bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <Instagram className="w-5 h-5" /> Instagram
          </a>
          <a href={APP_CONFIG.LINKS.LINKEDIN} target="_blank" rel="noreferrer" className="hover:bg-[#f68e51] dark:hover:bg-[#d97941] hover:text-black bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <TfiLinkedin className="w-5 h-5" /> LinkedIn
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t-4 border-foreground flex flex-col md:flex-row justify-between items-center gap-6 font-bold text-sm">
        <p>© {new Date().getFullYear()} <a href="https://mohpoe.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2">Mohpoe</a>. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <Link href={ROUTES.TERMS} className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2 underline-offset-4">Syarat & Ketentuan</Link>
          <Link href={ROUTES.POLICY} className="hover:text-[#f68e51] dark:hover:text-[#d97941] underline decoration-2 underline-offset-4">Kebijakan Privasi</Link>
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
          className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-10 z-[40] flex items-center gap-4 p-3 pr-4 bg-background border-4 border-foreground rounded-full w-max max-w-[90vw]"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col mr-3">
            <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase leading-none mb-1.5">
              Harga Terjangkau
            </span>
            <span className="text-base font-bold text-foreground leading-none">
              Harga mulai dari <strong className="font-black text-[#ef3936] dark:text-[#d9302d] border-b-2 border-foreground">13K</strong> aja!
            </span>
          </div>
          <button onClick={() => setIsVisible(false)} className="p-2 bg-muted border-2 border-transparent hover:border-foreground rounded-full transition-all ml-1 active:translate-y-1">
            <XIcon className="w-5 h-5 text-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// #endregion

// #region APP WRAPPER
export default function App() {
  return (
    <div className="font-mono text-foreground antialiased selection:bg-[#f68e51] dark:selection:bg-[#d97941] selection:text-black min-h-screen bg-background pb-20 md:pb-0 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        body {
          font-family: var(--font-mono);
          scroll-behavior: smooth;
        }

        /* Neo-Pop Scrollbar */
        ::-webkit-scrollbar {
          width: 14px;
        }
        ::-webkit-scrollbar-track {
          background: hsl(var(--background));
          border-left: 4px solid hsl(var(--foreground));
        }
        ::-webkit-scrollbar-thumb {
          background: #ef3936;
          border-left: 4px solid hsl(var(--foreground));
          border-bottom: 4px solid hsl(var(--foreground));
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #f68e51;
        }

        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-thumb {
            background: #d9302d;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #d97941;
          }
        }
      `}} />

      <Navigation />
      <MobileBottomBar />

      <main>
        <Hero />
        <Services />
        <Process />
        <PortfolioShowcase />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
      <PricingPopup />
    </div>
  );
}
// #endregion