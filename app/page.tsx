"use client";

import { ModeToggle } from '@/components/theme-toggle-button';
import { Button, buttonVariants } from '@/components/ui/button';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileText,
  Layout,
  Mail,
  MessageCircle,
  QuoteIcon,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SiInstagram as Instagram, SiWhatsapp } from 'react-icons/si';

interface DocumentMockupProps {
  className?: string;
}

const DocumentMockupCV = ({ className }: DocumentMockupProps) => (
  <div className={`bg-background/80 backdrop-blur-xl border border-foreground/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center gap-3 border-b border-foreground/5 pb-3">
      <div className="w-10 h-10 rounded-full bg-input/80 animate-pulse" />
      <div className="flex flex-col gap-1.5">
        <div className="w-24 h-2.5 bg-border/80 rounded-full" />
        <div className="w-16 h-2 bg-input/80 rounded-full" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-2 bg-muted rounded-full" />
      <div className="w-5/6 h-2 bg-muted rounded-full" />
      <div className="w-4/6 h-2 bg-muted rounded-full" />
    </div>
    <div className="mt-2 space-y-3">
      <div className="flex gap-2">
        <div className="w-1/3 h-16 bg-muted rounded-lg border border-muted" />
        <div className="w-2/3 space-y-2">
          <div className="w-full h-2 bg-input/50 rounded-full" />
          <div className="w-4/5 h-2 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const DocumentMockupPortfolio = ({ className }: DocumentMockupProps) => (
  <div className={`bg-background/80 backdrop-blur-xl border border-foreground/5 shadow-[0_20px_40px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex flex-col gap-3 ${className}`}>
    <div className="w-32 h-3 bg-border/80 rounded-full mb-2" />
    <div className="grid grid-cols-2 gap-2">
      <div className="aspect-square bg-muted rounded-xl" />
      <div className="aspect-square bg-muted rounded-xl" />
      <div className="aspect-square bg-muted rounded-xl" />
      <div className="aspect-square bg-muted rounded-xl" />
    </div>
  </div>
);

const DocumentMockupCoverLetter = ({ className }: DocumentMockupProps) => (
  <div className={`bg-background/90 backdrop-blur-xl border border-foreground/5 shadow-[0_12px_30px_rgb(0,0,0,0.03)] rounded-2xl p-5 flex flex-col gap-2 ${className}`}>
    <div className="w-12 h-12 bg-foreground rounded-xl mb-4 flex items-center justify-center shadow-inner">
      <Sparkles className="text-background w-6 h-6" />
    </div>
    <div className="w-1/2 h-2.5 bg-border rounded-full mb-4" />
    <div className="space-y-2">
      <div className="w-full h-1.5 bg-muted rounded-full" />
      <div className="w-full h-1.5 bg-muted rounded-full" />
      <div className="w-5/6 h-1.5 bg-muted rounded-full" />
      <div className="w-full h-1.5 bg-muted rounded-full" />
      <div className="w-4/5 h-1.5 bg-muted rounded-full" />
    </div>
  </div>
);

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`
        pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500
        ${scrolled ? 'bg-background/70 backdrop-blur-xl border border-foreground/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl' : 'bg-transparent w-full max-w-6xl'}
      `}>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
            <Image
              alt="Logo"
              src="/assets/Icon.svg"
              className="size-3.5 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-bold tracking-tight text-lg">CIVITA.ID</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Menu Kiri */}
          <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="hidden lg:flex text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
            Instagram
          </a>

          {/* Auth Menu (Ditambahkan) */}
          <div className="hidden md:flex items-center gap-2 border-l border-foreground/10 pl-3 ml-1">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'h-9 px-3 text-muted-foreground rounded-full' })}
            >
              Masuk
            </Link>
            <Link
              href={ROUTES.AUTH.SIGNUP}
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-9 px-3 shadow-sm rounded-full' })}
            >
              Daftar
            </Link>
          </div>

          {/* CTA Utama */}
          <Button size="sm" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, '_blank')} className="h-9 px-3 ml-1 md:ml-0 rounded-full">
            <span className="hidden md:flex items-center gap-1">
              Konsultasi <ArrowRight className="w-4 h-4 ml-2" />
            </span>
            <span className="flex md:hidden">
              <SiWhatsapp />
            </span>
          </Button>

          <ModeToggle />
        </div>

      </div>
    </motion.header>
  );
};

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
    <section ref={containerRef} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-32 pb-20 px-6">
      {/* Background subtleties */}
      <div className="absolute inset-0 bg-[#fdfdfd] -z-20" />
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-input/30 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-muted/50 rounded-full blur-[80px] -z-10 mix-blend-multiply" />

      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

        {/* Left Content */}
        <motion.div
          className="flex flex-col items-start gap-6 z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-input/50 text-xs text-muted-foreground font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Harga murah & profesional
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-foreground">
            Bantu kamu <br />
            <span className="text-muted-foreground">lolos kerja!</span>
          </h1>

          <p className="text-lg text-zinc-600 max-w-md leading-relaxed">
            Tersedia berbagai desain, mulai dari ATS-friendly, CV Creative, maupun CV basic yang bisa kamu sesuaikan dengan background kerja dan pendidikan kamu.
          </p>

          <div className="flex flex-col items-start gap-4 mt-4">
            <Button className="rounded-full h-12 px-8" size="lg" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, '_blank')}>
              <SiWhatsapp className="w-5 h-5 ml-0 mr-2" />
              Chat via WhatsApp
            </Button>
            <Button className="rounded-full h-12 px-8" variant="outline" size="lg" onClick={() => window.open(APP_CONFIG.LINKS.INSTAGRAM, '_blank')}>
              <Instagram className="w-5 h-5 ml-0 mr-2" />
              Lihat Portofolio
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                  <img src={`/assets/people${i}.jpg`} alt="client" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                </div>
              ))}
            </div>
            <p>Dipercaya oleh 500+ job seeker & profesional.</p>
          </div>
        </motion.div>

        {/* Right Parallax Elements */}
        <div className="relative h-[600px] hidden lg:block perspective-[1000px] pointer-events-none">
          <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-10 left-10 w-64 z-20">
            <DocumentMockupCV className="rotate-[-2deg]" />
          </motion.div>
          <motion.div style={{ y: y2, rotate: rotate2 }} className="absolute top-40 right-0 w-72 z-10">
            <DocumentMockupPortfolio className="rotate-[4deg]" />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-10 left-32 w-56 z-30">
            <DocumentMockupCoverLetter className="rotate-[-1deg]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  return (
    <section className="py-32 px-6 bg-muted">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">Senjata Ampuh Job Seeker.</h2>
          <p className="text-muted-foreground text-lg">Bukan cuma rapi, tapi ATS friendly dan enak dilihat mata manusia (iya, HRD juga manusia, mereka suka yang cantik-cantik).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-background border border-foreground/5 p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <FileText className="w-32 h-32" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-6">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">CV & Resume Design</h3>
                <p className="text-muted-foreground max-w-md">Layout clean, hierarki informasi jelas. Bikin experience baca CV kamu se-smooth scroll TikTok.</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-foreground text-background p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <MessageCircle className="w-32 h-32" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center mb-6">
                <MessageCircle className="w-5 h-5 text-background" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Cover Letter</h3>
                <p className="text-muted-foreground">Kata-kata manis yang profesional, bikin peluang dilirik makin gede.</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-background border border-foreground/5 p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-6">
                <Layout className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Brosur & Resi</h3>
                <p className="text-muted-foreground">Buat bisnis kamu terlihat sekelas enterprise, walau masih dirintis dari kamar kos.</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-background border border-foreground/5 p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-64 translate-x-8 translate-y-8 opacity-20 transition-transform group-hover:scale-105 duration-500">
              <DocumentMockupPortfolio />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-6">
                <Briefcase className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Company & Work Portfolio</h3>
                <p className="text-muted-foreground max-w-md">Showcase karyamu dengan elegan. Biar skill dan pencapaianmu nggak cuma jadi mitos belaka.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    { num: "01", title: "Spill Kebutuhan", desc: "Konsultasi santai via WhatsApp. Kasih tau mau apply ke mana atau butuh desain seperti apa." },
    { num: "02", title: "Kita Eksekusi", desc: "Duduk manis. Desainer kami lagi ngeracik pixel dan typography biar hasilnya premium." },
    { num: "03", title: "Revisi Tipis-Tipis", desc: "Udah cakep sih, tapi kalau ada yang kurang pas di hati, kita sesuaikan lagi." },
    { num: "04", title: "Done & Good Luck!", desc: "File high-res meluncur. Siap dipakai buat nge-apply dan naklukin hati HRD." }
  ];

  return (
    <section className="py-32 px-6 bg-background border-y border-foreground/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
          <div className="md:w-1/3">
            <div className="sticky top-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Gak Pake Ribet.</h2>
              <p className="text-muted-foreground mb-8">Proses kerja yang dirancang sesimpel mungkin. Karena nyari kerja aja udah ribet, bikin CV jangan ikutan ribet.</p>
              <Button className="h-10 px-4 py-2 rounded-full" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, '_blank')}>
                Mulai Sekarang
              </Button>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="space-y-12">
              {steps.map((step, i) => (
                <div key={i} className="group relative flex gap-6">
                  {/* Line connector */}
                  {i !== steps.length - 1 && (
                    <div className="absolute left-[1.15rem] top-12 bottom-[-3rem] w-px bg-muted group-hover:bg-input transition-colors" />
                  )}

                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-input flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {step.num}
                  </div>

                  <div className="pt-2">
                    <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-zinc-600 transition-colors">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">{step.desc}</p>
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

const TestimonialTextVariant = () => {
  const reviews = [
    {
      name: "Raka, 22",
      role: "Fresh Grad HTS (Harap-harap Tidak Sulit)",
      text: "Sumpah awalnya pesimis gara-gara IPK nasakom, eh desain CV dari Civita bikin HRD salfok. Besok langsung dapet panggilan interview njir."
    },
    {
      name: "Nisa, 25",
      role: "Budak Corporate",
      text: "ATS friendly tapi tetep aesthetic? Kirain mitos, ternyata beneran ada. Makasih Civita, portfolio gue jadi sekelas anak agensi Jaksel."
    },
    {
      name: "Bima, 24",
      role: "Jobseeker Berkedok Freelancer",
      text: "Bikin cover letter di sini bahasanya sopan tapi ngga kaku kaya template. HRD-nya notice, pantesan langsung dapet offering letter kemaren."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {reviews.map((review, i) => (
        <div key={i} className="bg-background border border-foreground/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow">
          <QuoteIcon className="w-8 h-8 text-input mb-6" />
          <p className="text-zinc-600 mb-8 leading-relaxed">"{review.text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
              {review.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.role}</p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const TestimonialChatVariant = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ganti URL ini dengan path gambar screenshot WhatsApp Anda yang sebenarnya
  // Contoh: "/images/testi-wa-1.jpg" atau URL dari CDN Anda.
  const screenshots = [
    "/assets/testimoni1.webp",
    "/assets/testimoni2.webp",
    "/assets/testimoni3.webp",
    "/assets/testimoni4.webp",
    "/assets/testimoni5.webp",
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 280 : 344; // Menyesuaikan lebar card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Navigation Buttons (Desktop) */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-md border border-foreground/5 rounded-full items-center justify-center shadow-sm hover:scale-105 hover:shadow-md transition-all z-10"
      >
        <ChevronRight className="w-5 h-5 text-zinc-600 rotate-180" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-md border border-foreground/5 rounded-full items-center justify-center shadow-sm hover:scale-105 hover:shadow-md transition-all z-10"
      >
        <ChevronRight className="w-5 h-5 text-zinc-600" />
      </button>

      {/* Slider Container with Native Scroll Snap */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Spacer awal untuk padding mobile */}
        <div className="snap-center shrink-0 w-2 md:hidden"></div>

        {screenshots.map((src, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 w-[260px] md:w-[320px] aspect-[9/16] relative rounded-[2rem] overflow-hidden border border-foreground/5 bg-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)] group"
          >
            <img
              src={src}
              alt={`WhatsApp Testimonial ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle glare overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay pointer-events-none" />
          </div>
        ))}

        {/* Spacer akhir untuk padding mobile */}
        <div className="snap-center shrink-0 w-2 md:hidden"></div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex md:hidden justify-center items-center gap-2 -mt-2 text-xs text-muted-foreground font-medium">
        <ArrowRight className="w-3 h-3 rotate-180" />
        <span>Geser untuk melihat screenshot</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeVariant, setActiveVariant] = useState('chat'); // 'text' | 'chat'

  return (
    <section className="py-32 px-6 bg-muted overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">Kata Mereka Yang Lolos Screening.</h2>
          <p className="text-muted-foreground text-lg">
            Bukan testimoni fiktif yang diketik admin pas lagi gabut. Beneran hasil karya yang ngebantu mereka dapet kerja.
          </p>
        </div>

        {/* macOS-style Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="bg-input/50 backdrop-blur-md p-1 rounded-full flex gap-1 border border-foreground/5">
            <button
              onClick={() => setActiveVariant('text')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeVariant === 'text' ? 'text-foreground shadow-sm' : 'text-muted-foreground hover:text-zinc-700'
                }`}
            >
              {activeVariant === 'text' && (
                <motion.div layoutId="activePill" className="absolute inset-0 bg-background rounded-full -z-10 shadow-sm" />
              )}
              <span className="relative z-10">Review</span>
            </button>
            <button
              onClick={() => setActiveVariant('chat')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeVariant === 'chat' ? 'text-foreground shadow-sm' : 'text-muted-foreground hover:text-zinc-700'
                }`}
            >
              {activeVariant === 'chat' && (
                <motion.div layoutId="activePill" className="absolute inset-0 bg-background rounded-full -z-10 shadow-sm" />
              )}
              <span className="relative z-10">Testimoni</span>
            </button>
          </div>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeVariant === 'text' ? (
              <TestimonialTextVariant key="text" />
            ) : (
              <TestimonialChatVariant key="chat" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-card/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-background">
          Deadline ngelamar besok?
        </h2>
        <p className="text-xl text-background max-w-2xl mx-auto">
          Tenang, tarik napas dulu... mending langsung chat admin sekarang. Biar kita yang urus visualnya, kamu siapin mental buat interview aja.
        </p>

        <div className="flex justify-center pt-8">
          <div className="flex flex-col w-full sm:w-auto gap-5">
            <button
              onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, '_blank')}
              className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 bg-background text-foreground rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            >
              Chat Admin CIVITA
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <Link href="#" className="text-background/60 hover:text-background transition-colors underline underline-offset-4 decoration-background hover:decoration-background">
                Masuk ke Akun
              </Link>
              <span className="text-zinc-700">|</span>
              <Link href="#" className="text-background/60 hover:text-background transition-colors underline underline-offset-4 decoration-background hover:decoration-background">
                Daftar Member Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-foreground/5 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Image
              alt="Logo"
              src="/assets/Icon.svg"
              className="size-3.5 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-bold tracking-tight text-xl">CIVITA.ID</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
            <Instagram className="w-4 h-4" /> Instagram
          </a>
          <a href={APP_CONFIG.LINKS.EMAIL} className="hover:text-foreground transition-colors flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} CIVITA Design. All rights reserved.</p>
        <p>Crafted with minimalist principles.</p>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="font-mono text-foreground antialiased selection:bg-input selection:text-foreground min-h-screen bg-background">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          /* Enforcing premium monospace look globally */
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        body {
          font-family: var(--font-mono);
          /* Smooth scrolling base */
          scroll-behavior: smooth;
        }

        /* Subtle scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #fdfdfd;
        }
        ::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}} />

      <Navigation />
      <main>
        <Hero />
        <Services />
        <Process />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}