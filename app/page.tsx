"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  X,
  Zap
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
  type TouchEvent as ReactTouchEvent,
} from "react";

import { FaInstagram as Instagram } from "react-icons/fa";


// Site Global Configuration
const SITE = {
  name: "CIVITA",
  tagline: "Desain Dokumen & Visual Profesional",
  description:
    "CIVITA membantu Anda membuat CV, surat lamaran, portfolio, brosur, resi, dan kebutuhan desain lainnya dengan tampilan rapi, profesional, dan siap digunakan.",
  whatsappNumber: "6282312945365",
  whatsappFormatted: "+62 823-1294-5365",
  instagramUrl: "https://www.instagram.com/bikincivita/",
  instagramHandle: "@bikincivita",
  defaultWaMessage:
    "Halo CIVITA, saya tertarik dengan jasa desain. Buka diskusi untuk kebutuhan saya?",
};

// Helper for encoded WhatsApp URLs
const getWaLink = (customText?: string) => {
  const text = customText || SITE.defaultWaMessage;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
};

// Trust Pillars Data
const TRUST_ITEMS = [
  {
    icon: Award,
    title: "Desain Profesional",
    desc: "Layout & tipografi standar industri untuk kesan pertama berkelas.",
  },
  {
    icon: Layers,
    title: "Bisa Request & Revisi",
    desc: "Bebas konsultasi warna, struktur, dan penyesuaian konten.",
  },
  {
    icon: Zap,
    title: "Proses Cepat & Mudah",
    desc: "Cukup kirimkan draft atau brief via WhatsApp, kami kerjakan.",
  },
  {
    icon: FileCheck,
    title: "File Siap Digunakan",
    desc: "Format PDF resolusi tinggi, siap cetak atau dikirim via email.",
  },
];

// Services Data
const SERVICES_DATA = [
  {
    id: "cv",
    title: "CV Profesional",
    tagline: "Lolos Kurasi HRD & ATS Friendly",
    description:
      "Desain CV yang terstruktur, rapi, dan menonjolkan kualifikasi utama Anda. Cocok untuk fresh graduate hingga profesional berpengalaman.",
    badge: "Paling Populer",
    icon: FileText,
    features: [
      "Layout clean & eye-catching",
      "Struktur informasi terarah",
      "Format PDF High-Quality",
      "Gratis konsultasi konten",
    ],
    waMessage:
      "Halo CIVITA, saya ingin memesan Jasa Desain CV Profesional. Bisa bantu jelaskan prosedurnya?",
  },
  {
    id: "surat-lamaran",
    title: "Surat Lamaran Kerja",
    tagline: "Kesan Pertama yang Elegan & Formal",
    description:
      "Surat lamaran (Cover Letter) diselaraskan dengan tema desain CV Anda agar terlihat harmonis dan serasi saat dikirim ke HRD.",
    badge: "Pasangan CV",
    icon: MailIcon,
    features: [
      "Desain serasi dengan CV",
      "Tata bahasa formal & rapi",
      "Kustomisasi posisi lamaran",
      "Format PDF & Word editable",
    ],
    waMessage:
      "Halo CIVITA, saya berminat membuat Surat Lamaran Kerja yang profesional.",
  },
  {
    id: "portfolio-kerja",
    title: "Portfolio Kerja Personal",
    tagline: "Showcase Karya & Pengalaman Anda",
    description:
      "Showcase interaktif dan estetik untuk memamerkan project, hasil karya, dan bukti keahlian Anda secara lebih impresif.",
    badge: "Untuk Freelancer & Pro",
    icon: Briefcase,
    features: [
      "Layout visual modern",
      "Highlight pencapaian project",
      "Dukungan banyak halaman",
      "Ekspor PDF siap kirim",
    ],
    waMessage:
      "Halo CIVITA, saya butuh bantuan untuk pembuatan Desain Portfolio Kerja.",
  },
  {
    id: "company-profile",
    title: "Portfolio Perusahaan",
    tagline: "Tingkatkan Trust & Citra Bisnis",
    description:
      "Dokumen Company Profile yang merepresentasikan kredibilitas bisnis, layanan, visi, dan pencapaian perusahaan Anda.",
    badge: "Bisnis & B2B",
    icon: ShieldCheck,
    features: [
      "Branding visual eksklusif",
      "Infografis & visual pendukung",
      "Cocok untuk pitching client",
      "File PDF HD & Cetak",
    ],
    waMessage:
      "Halo CIVITA, kami butuh pembuatan Portfolio Perusahaan / Company Profile.",
  },
  {
    id: "brosur",
    title: "Brosur & Flier Promosi",
    tagline: "Materi Marketing yang Memikat",
    description:
      "Desain brosur promosi produk atau jasa yang informatif, menarik perhatian target pasar, dan meningkatkan daya jual.",
    badge: "Materi UMKM",
    icon: Sparkles,
    features: [
      "Desain 1 sisi, 2 sisi, atau lipat",
      "Komposisi warna tajam",
      "Siap cetak offset/digital",
      "Format JPG, PNG & PDF",
    ],
    waMessage:
      "Halo CIVITA, saya ingin berkonsultasi mengenai Desain Brosur Promosi.",
  },
  {
    id: "resi-nota",
    title: "Desain Resi & Nota Bisnis",
    tagline: "Branding Transaksi Lebih Rapi",
    description:
      "Nota, invoice, dan resi pengiriman custom bermerek untuk meningkatkan kepercayaan pelanggan toko online atau bisnis Anda.",
    badge: "Operational Tool",
    icon: FileCheck,
    features: [
      "Desain branded berpola logo",
      "Tata letak detail order jelas",
      "Format printable / digital",
      "Dukungan berbagai ukuran",
    ],
    waMessage:
      "Halo CIVITA, saya mau buat Desain Resi/Nota khusus untuk brand saya.",
  },
];

type PortfolioItem = {
  id: number;
  title: string;
  category: string;
  clientType: string;
  tags: string[];
  accentColor: string;
  bgPattern: string;
  previewType: string;
};

// Portfolio Sample Data
const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 1,
    title: "Curriculum Vitae Minimalist Slate",
    category: "CV",
    clientType: "Senior Marketing Specialist",
    tags: ["Minimalist", "ATS-Friendly", "Clean typography"],
    accentColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bgPattern: "from-slate-900 to-slate-800",
    previewType: "cv-slate",
  },
  {
    id: 2,
    title: "Portfolio Kerja Product Designer",
    category: "Portfolio",
    clientType: "UI/UX & Graphic Designer",
    tags: ["Editorial", "Grid Layout", "High Impact"],
    accentColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bgPattern: "from-indigo-900 to-slate-900",
    previewType: "portfolio-design",
  },
  {
    id: 3,
    title: "Brosur Katalog Produk UMKM",
    category: "Brosur",
    clientType: "Artisan Coffee & Bakery",
    tags: ["Promosional", "Warm Aesthetics", "Clean Callout"],
    accentColor: "bg-amber-50 text-amber-700 border-amber-200",
    bgPattern: "from-stone-900 to-amber-950",
    previewType: "brosur-coffee",
  },
  {
    id: 4,
    title: "Surat Lamaran Kerja Executive",
    category: "Surat Lamaran",
    clientType: "Management Trainee",
    tags: ["Formal", "Branded Header", "Structured"],
    accentColor: "bg-blue-50 text-blue-700 border-blue-200",
    bgPattern: "from-blue-950 to-slate-900",
    previewType: "surat-executive",
  },
  {
    id: 5,
    title: "Company Profile Tech Agency",
    category: "Portfolio",
    clientType: "Digital Transformation Studio",
    tags: ["Corporate", "Modern Blue", "Infographic"],
    accentColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    bgPattern: "from-cyan-950 to-slate-900",
    previewType: "company-tech",
  },
  {
    id: 6,
    title: "Custom Invoice & Resi Pengiriman",
    category: "Resi",
    clientType: "Fashion E-commerce Brand",
    tags: ["Branded Invoice", "Clean Grid", "Receipt"],
    accentColor: "bg-rose-50 text-rose-700 border-rose-200",
    bgPattern: "from-rose-950 to-slate-900",
    previewType: "resi-invoice",
  },
];

// Testimonials Data
const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Rian Ardiansyah",
    role: "Job Seeker - Digital Marketing",
    text: "Setelah rapihin CV sama CIVITA, tampilan CV saya jadi beda banget dari sekadar hasil pengerjaan Canva gratisan. Penataan pengalamannya rapi dan terarah!",
    category: "Job Seeker",
    rating: 5,
    initials: "RA",
  },
  {
    id: 2,
    name: "Nabila Putri",
    role: "Fresh Graduate Universita Negeri",
    text: "Minta tolong bikin CV + surat lamaran h-1 interview, pengerjaannya cepat dan komunikasinya enak via WhatsApp. Revisi minor langsung ditanggapi ramah.",
    category: "Fresh Graduate",
    rating: 5,
    initials: "NP",
  },
  {
    id: 3,
    name: "Dimas Setyo",
    role: "Freelance Photographer & Videographer",
    text: "Portfolio karya saya tadinya cuma ditumpuk di Google Drive. Dibuatkan PDF portfolio profesional sama CIVITA, klien institusi langsung pada trust!",
    category: "Freelancer",
    rating: 5,
    initials: "DS",
  },
  {
    id: 4,
    name: "Owner Kopi Kenangan Lokal",
    role: "UMKM Kuliner",
    text: "Bikin brosur menu promo bulanan dan invoice cetak untuk pengiriman catering. Hasilnya rapi, warnanya pas cetak juga tajam.",
    category: "UMKM Owner",
    rating: 5,
    initials: "OK",
  },
];

// Why CIVITA Advantages
const WHY_CIVITA = [
  {
    title: "Tampilan Elegan & Rapi",
    desc: "Bukan sekadar template instan. Setiap elemen diatur presisi dengan hirarki visual yang seimbang.",
  },
  {
    title: "Fokus Pada Detail & Konten",
    desc: "Tipografi, kontras warna, hingga alur baca diperhatikan agar informasi utama mudah dicerna HRD atau Klien.",
  },
  {
    title: "Bisa Request Sesuai Kebutuhan",
    desc: "Punya acuan warna sendiri atau ingin menyesuaikan gaya industri? Anda bisa mendiskusikannya.",
  },
  {
    title: "Proses Praktis via WhatsApp",
    desc: "Tidak perlu ribet daftar akun atau mengisi form rumit. Cukup diskusi santai langsung melalui WhatsApp.",
  },
  {
    title: "Fleksibel Untuk Berbagai Kebutuhan",
    desc: "Melayani individu (CV/Portfolio kerja) hingga pelaku usaha (Brosur, Resi, Company Profile).",
  },
  {
    title: "Komunikasi Langsung & Responsif",
    desc: "Diskusi transparan tanpa perantara bot, langsung ditangani desainer yang memahami brief Anda.",
  },
];

// 5 Step Process
const PROCESS_STEPS = [
  {
    num: "01",
    title: "Chat CIVITA",
    desc: "Hubungi tim CIVITA via WhatsApp dan konsultasikan kebutuhan dokumen Anda.",
  },
  {
    num: "02",
    title: "Kirim Brief & Teks",
    desc: "Kirimkan teks draft, foto, atau acuan data yang ingin dimasukkan ke dalam desain.",
  },
  {
    num: "03",
    title: "Proses Pengerjaan",
    desc: "Tim desainer CIVITA mengolah layout, visual, dan struktur dokumen Anda secara profesional.",
  },
  {
    num: "04",
    title: "Review & Revisi",
    desc: "Anda menerima draft untuk dicek. Sampaikan penyesuaian jika ada detail yang ingin diubah.",
  },
  {
    num: "05",
    title: "File Siap Digunakan",
    desc: "Terima file final resolusi tinggi (PDF/JPG/PNG) yang siap dikirim atau dicetak.",
  },
];

// FAQ Data
const FAQ_DATA = [
  {
    q: "Apa saja dokumen yang bisa dibuat di CIVITA?",
    a: "CIVITA melayani pembuatan Desain CV, Surat Lamaran Kerja, Portfolio Kerja Personal, Portfolio Perusahaan (Company Profile), Brosur Promosi, Resi/Nota Bisnis, dan berbagai dokumen visual profesional lainnya.",
  },
  {
    q: "Bagaimana cara melakukan pemesanan?",
    a: "Prosesnya sangat simpel! Klik tombol 'Chat via WhatsApp' di website ini. Anda akan langsung terhubung ke WhatsApp CIVITA untuk mengirimkan data dan mendiskusikan konsep yang diinginkan.",
  },
  {
    q: "Apakah saya bisa request desain atau warna tertentu?",
    a: "Tentu saja! Anda bebas mengusulkan warna favorit, gaya desain (minimalis, formal, modern, kreatif), atau menyertakan contoh acuan yang Anda sukai.",
  },
  {
    q: "Bagaimana jika ada kesalahan tulisan atau perlu perbaikan (revisi)?",
    a: "Setiap pemesanan mendapatkan sesi review. Anda bisa meminta penyesuaian seperti perbaikan pengetikan, perubahan foto, atau pergeseran posisi elemen sebelum file dikirimkan secara final.",
  },
  {
    q: "Format file apa yang akan saya dapatkan?",
    a: "Secara standar Anda akan menerima file PDF resolusi tinggi (siap cetak / kirim email). Untuk kebutuhan seperti brosur atau resi, kami juga menyediakan format gambar PNG/JPG.",
  },
  {
    q: "Berapa lama estimasi waktu pengerjaan?",
    a: "Waktu pengerjaan bervariasi tergantung jenis dokumen dan kelengkapan bahan dari Anda. Estimasi tepatnya akan kami sampaikan saat diskusi awal di WhatsApp.",
  },
];


// Custom Mail Icon component to ensure missing lucide-react icons don't break
function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Layanan", href: "#layanan" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Transformasi", href: "#transformasi" },
    { name: "Kenapa CIVITA", href: "#keunggulan" },
    { name: "Cara Pesan", href: "#cara-pesan" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 py-3.5 shadow-xl shadow-black/20"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xl tracking-wider shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                CIVITA<span className="text-emerald-400">.</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-1">
                Design Studio
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={getWaLink("Halo CIVITA, saya ingin tanya mengenai jasa desain dokumen.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 shadow-lg py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 stroke-emerald-500" />
              <span>Chat WhatsApp</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-4 pb-6 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-200 hover:text-emerald-400 font-medium py-2.5 px-3 rounded-lg hover:bg-slate-900 transition-colors text-base"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-center text-sm shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat via WhatsApp</span>
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 font-medium text-center text-xs"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram {SITE.instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-slate-950 text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jasa Desain Dokumen Profesional & Bisnis</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Bikin Dokumen Profesional yang Bikin Kamu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Lebih Siap Melangkah.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              CIVITA membantu Anda membuat CV, surat lamaran, portfolio, brosur,
              resi, dan kebutuhan desain lainnya dengan tampilan yang rapi,
              profesional, dan siap digunakan.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <a
                href={getWaLink(
                  "Halo CIVITA, saya ingin berkonsultasi mengenai pemesanan dokumen profesional."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>Chat via WhatsApp</span>
              </a>

              <a
                href="#portfolio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Lihat Portfolio</span>
              </a>
            </div>

            {/* Micro Social Guarantee Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tanpa Form Rumit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Format PDF High Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bisa Diskusi Dulu</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Document Mockup Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10" />

              {/* Main Document Frame Stack */}
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                {/* Simulated Editorial Document Canvas */}
                <div className="bg-stone-50 rounded-2xl p-5 sm:p-6 text-slate-900 shadow-inner relative overflow-hidden space-y-4">
                  {/* Mock CV Header */}
                  <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                    <div>
                      <div className="h-5 w-36 bg-slate-900 rounded-md mb-1.5" />
                      <div className="h-3 w-28 bg-emerald-600 rounded-md" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      PRO
                    </div>
                  </div>

                  {/* Mock CV Content Columns */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 space-y-2.5 pr-2 border-r border-stone-200">
                      <div className="h-2.5 w-full bg-stone-300 rounded" />
                      <div className="h-2 w-4/5 bg-stone-200 rounded" />
                      <div className="h-2 w-3/4 bg-stone-200 rounded" />
                      <div className="pt-2">
                        <div className="h-2.5 w-full bg-slate-800 rounded mb-1" />
                        <div className="h-1.5 w-full bg-emerald-500 rounded" />
                      </div>
                    </div>
                    <div className="col-span-8 space-y-3">
                      <div>
                        <div className="h-3 w-32 bg-slate-800 rounded mb-1" />
                        <div className="h-2 w-full bg-stone-300 rounded mb-1" />
                        <div className="h-2 w-5/6 bg-stone-200 rounded" />
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-slate-800 rounded mb-1" />
                        <div className="h-2 w-full bg-stone-300 rounded mb-1" />
                        <div className="h-2 w-4/6 bg-stone-200 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Stamp Overlay */}
                  <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wider uppercase">
                    CIVITA Clean Layout
                  </div>
                </div>

                {/* Floating Document Badge 1 */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">CV & Portfolio</div>
                    <div className="text-[10px] text-slate-400">Struktur Rapi & ATS Ready</div>
                  </div>
                </div>

                {/* Floating Document Badge 2 */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Brosur & Resi</div>
                    <div className="text-[10px] text-slate-400">Branding Bisnis Elegan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="bg-slate-900 border-y border-slate-800/80 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700/80 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="layanan" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Layanan Kami
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Butuh Desain Apa Hari Ini?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            CIVITA menyediakan berbagai solusi desain dokumen profesional dan materi
            visual bisnis yang disesuaikan dengan kebutuhan Anda.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mb-3">
                    {service.tagline}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Key Points */}
                  <ul className="space-y-2 border-t border-slate-800/80 pt-4 mb-6">
                    {service.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct WA Order Button */}
                <a
                  href={getWaLink(service.waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-slate-200 text-xs font-bold transition-all duration-200 group/btn"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 group-hover/btn:text-slate-950" />
                  <span>Pesan {service.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Custom Design Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white">
              Punya Kebutuhan Desain Dokumen Lainnya?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Sampaikan ide atau kebutuhan custom Anda via WhatsApp. Tim desainer
              CIVITA siap membantu.
            </p>
          </div>
          <a
            href={getWaLink(
              "Halo CIVITA, saya punya kebutuhan desain khusus (custom). Bisa bantu diskusikan?"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Konsultasi Custom Design
          </a>
        </div>
      </div>
    </section>
  );
}

function PortfolioGallery() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const categories = [
    "Semua",
    "CV",
    "Portfolio",
    "Surat Lamaran",
    "Brosur",
    "Resi",
  ];

  const filteredItems =
    activeTab === "Semua"
      ? PORTFOLIO_DATA
      : PORTFOLIO_DATA.filter((item) => item.category === activeTab);

  return (
    <section id="portfolio" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Portfolio & Sample Karya
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Lihat Hasil Desain CIVITA
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Eksplorasi contoh tata letak dan gaya visual yang kami buat khusus
            untuk berbagai kebutuhan karir dan bisnis.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === cat
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Artwork Preview Box */}
                <div
                  onClick={() => setSelectedItem(item)}
                  className={`relative h-64 bg-gradient-to-b ${item.bgPattern} p-6 flex flex-col justify-between cursor-pointer overflow-hidden group/canvas`}
                >
                  {/* Subtle Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Category Pill */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${item.accentColor}`}
                    >
                      {item.category}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-slate-300 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Rendered Mockup Card Inside Canvas */}
                  <div className="relative z-10 bg-white/95 text-slate-900 p-4 rounded-xl shadow-xl space-y-2 border border-white/20 transform group-hover/canvas:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                      <div className="font-extrabold text-xs tracking-tight">
                        {item.title}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">
                      Client Target: {item.clientType}
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-stone-200 rounded w-full" />
                      <div className="h-1.5 bg-stone-200 rounded w-4/5" />
                      <div className="h-1.5 bg-emerald-100 rounded w-3/5" />
                    </div>
                  </div>

                  {/* Bottom Hover CTA overlay */}
                  <div className="relative z-10 text-[11px] font-medium text-slate-300 flex items-center gap-1 group-hover/canvas:text-emerald-400 transition-colors">
                    <span>Klik untuk preview detail</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link inside Card */}
              <div className="px-5 pb-5 pt-0">
                <a
                  href={getWaLink(
                    `Halo CIVITA, saya tertarik dengan contoh desain "${item.title}". Bisakah saya pesan desain dengan gaya ini?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Pesan Style Ini</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-md border ${selectedItem.accentColor}`}
              >
                {selectedItem.category}
              </span>

              <h3 className="text-2xl font-bold text-white">
                {selectedItem.title}
              </h3>

              {/* Modal Visual Canvas */}
              <div
                className={`h-56 bg-gradient-to-br ${selectedItem.bgPattern} rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden`}
              >
                <div className="bg-white text-slate-900 p-5 rounded-xl shadow-2xl max-w-md w-full text-left space-y-2">
                  <div className="font-extrabold text-sm border-b pb-2">
                    {selectedItem.title}
                  </div>
                  <div className="text-xs text-stone-600">
                    Skenario Penggunaan: {selectedItem.clientType}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                    ✓ Format PDF Siap Kirim HRD / Klien
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200">
                  Keunggulan Layout Ini:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Hierarki baca terstruktur dan tidak membingungkan.</li>
                  <li>
                    Pemilihan font dan spasial disesuaikan dengan standar industri.
                  </li>
                  <li>
                    Kombinasi warna berkelas yang memberikan kesan profesional.
                  </li>
                </ul>
              </div>

              {/* Modal Action CTA */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWaLink(
                    `Halo CIVITA, saya mau buat desain seperti contoh "${selectedItem.title}".`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Pesan Template Ini via WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 5) pos = 5;
    if (pos > 95) pos = 95;
    setSliderPos(pos);
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <section id="transformasi" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Transformasi Visual
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Lihat Perbedaannya Secara Nyata
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Geser slider di bawah untuk melihat perbedaan dokumen biasa berbanding
            dengan hasil desain profesional CIVITA.
          </p>
        </div>

        {/* Comparison Container */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 select-none shadow-2xl cursor-ew-resize"
          >
            {/* AFTER SIDE (Full background element: CIVITA Professional Layout) */}
            <div className="absolute inset-0 bg-stone-100 text-slate-900 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b-2 border-emerald-600 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      ANDIKA PRATAMA, S.Kom
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider">
                      Senior Business Analyst & Systems Specialist
                    </p>
                  </div>
                  <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    CIVITA RESULT
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8 space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        PENGALAMAN KERJA RELEVAN
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            PT Tech Innovations Indonesia — Lead Analyst
                          </div>
                          <div className="text-[11px] text-stone-600">
                            2021 - Sekarang | Jakarta
                          </div>
                          <p className="text-[11px] text-stone-700 leading-relaxed mt-1">
                            • Memimpin optimalisasi alur kerja digital untuk 15+
                            klien korporat.
                            <br />• Berhasil meningkatkan efisiensi proses
                            operasional hingga 34%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 bg-stone-200/60 p-3.5 rounded-xl space-y-3">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-800 uppercase mb-1">
                        KONTAK
                      </h5>
                      <div className="text-[10px] text-stone-600 space-y-0.5">
                        <div>andika@email.com</div>
                        <div>+62 812 3456 7890</div>
                        <div>linkedin.com/in/andika</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-800 uppercase mb-1">
                        KEAHLIAN
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-medium">
                          SQL
                        </span>
                        <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-medium">
                          Agile
                        </span>
                        <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-medium">
                          Tableau
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-stone-400 border-t border-stone-200 pt-3 flex justify-between">
                <span>Dokumen Rapi, Terstruktur & Eye-Catching</span>
                <span className="font-bold text-emerald-600">HASIL CIVITA</span>
              </div>
            </div>

            {/* BEFORE SIDE (Clipped element: Plain Draft Layout) */}
            <div
              style={{ width: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 left-0 bg-white border-r-2 border-emerald-400 overflow-hidden text-slate-800 p-6 sm:p-10 flex flex-col justify-between"
            >
              <div className="w-[700px] sm:w-[800px]">
                <div className="border-b pb-3 mb-4">
                  <span className="text-xs bg-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded mr-2">
                    SEBELUM (Draft Biasa)
                  </span>
                  <h3 className="text-base font-serif mt-2">
                    Curriculum Vitae - Andika Pratama
                  </h3>
                </div>

                <div className="font-serif text-xs space-y-3 leading-snug text-stone-800">
                  <p>Nama: Andika Pratama, S.Kom</p>
                  <p>Alamat: Jl. Merdeka No. 123, Jakarta</p>
                  <p>Email: andika_pratama_old99@gmail.com</p>

                  <div className="pt-2">
                    <p className="font-bold">Pengalaman Kerja:</p>
                    <p>
                      1. PT Tech Innovations Indonesia (2021-sekarang)
                      <br />
                      Saya bekerja sebagai analist. Tugas saya analisa data dan
                      bikin laporan meeting tiap minggu untuk bos.
                    </p>
                    <p className="mt-2">
                      2. Staf Magang IT (2020)
                      <br />
                      Membantu perbaikan komputer kantor dan input data excel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 border-t pt-2 w-[700px]">
                *Dokumen biasa tanpa hirarki desain sering kali terlewatkan saat
                skrining awal.
              </div>
            </div>

            {/* Drag Handle Bar */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 -ml-4 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 border-2 border-white shadow-xl flex items-center justify-center">
                <Sliders className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>← Dras/Draft Biasa</span>
            <span className="text-emerald-400 font-semibold">
              Geser Slider Untuk Membandingkan
            </span>
            <span>Hasil CIVITA →</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyCivita() {
  return (
    <section id="keunggulan" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
              Keunggulan Layanan
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Kenapa Banyak Orang Memilih CIVITA?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Kami percaya dokumen profesional adalah investasi untuk karir dan
              bisnis Anda. Karena itu, kami tidak sekadar menempelkan teks ke
              dalam template generik.
            </p>

            <div className="pt-2">
              <a
                href={getWaLink(
                  "Halo CIVITA, saya ingin bertanya lebih lanjut mengenai keunggulan jasa desain."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Mulai Konsultasi WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Grid of Advantages */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_CIVITA.map((adv, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-sm text-white">{adv.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="cara-pesan" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Alur Pemesanan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cara Pesan yang Sangat Praktis
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            5 langkah mudah mendapatkan dokumen profesional tanpa ribet.
          </p>
        </div>

        {/* Process Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <span className="text-2xl font-black text-emerald-400/30 group-hover:text-emerald-400 transition-colors block mb-2">
                  {step.num}
                </span>
                <h3 className="font-bold text-base text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Process Guarantee Note */}
        <div className="mt-10 text-center text-xs text-slate-400">
          <span>
            Punya pertanyaan mengenai materi yang perlu disiapkan?{" "}
          </span>
          <a
            href={getWaLink(
              "Halo CIVITA, materi apa saja yang perlu saya siapkan untuk membuat CV/dokumen?"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-semibold"
          >
            Tanyakan langsung di WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Ulasan Pelanggan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Apa Kata Mereka?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Pengalaman nyata dari job seeker, freelancer, dan pemilik bisnis
            yang mempercayakan kebutuhan desainnya kepada CIVITA.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS_DATA.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote Body */}
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{item.text}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 border-t border-slate-900 mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  {item.initials}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">
                    {item.name}
                  </h3>
                  <div className="text-[10px] text-slate-400">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  return (
    <section className="py-20 bg-slate-950 text-white border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-pink-400 text-xs font-semibold">
          <Instagram className="w-4 h-4 text-pink-400" />
          <span>Follow Us On Instagram</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Lihat Lebih Banyak Update & Portofolio Kami
        </h2>

        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Dapatkan inspirasi tata letak dokumen, tips karir, dan contoh hasil karya
          terbaru CIVITA di akun resmi Instagram kami{" "}
          <strong className="text-slate-200">{SITE.instagramHandle}</strong>.
        </p>

        <div className="pt-2">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <Instagram className="w-4 h-4" />
            <span>Kunjungi Instagram {SITE.instagramHandle}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Tanya Jawab
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pertanyaan Yang Sering Diajukan
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Temukan jawaban langsung untuk pertanyaan seputar layanan CIVITA.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900/80 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Sudah Siap Bikin Desain yang Lebih Profesional?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Jelaskan kebutuhanmu ke CIVITA dan diskusikan desain yang paling
            sesuai untuk karir atau bisnis Anda hari ini.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={getWaLink(
                "Halo CIVITA, saya siap membuat dokumen profesional. Mohon dibantu."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>Chat via WhatsApp Sekarang</span>
            </a>

            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:text-white transition-all"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram CIVITA</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>Ada pertanyaan? Chat CIVITA</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Button */}
      <a
        href={getWaLink("Halo CIVITA, saya ingin tanya langsung via WhatsApp.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="relative group w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all transform hover:scale-110 active:scale-95"
      >
        <MessageCircle className="w-7 h-7 fill-slate-950 stroke-emerald-500" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-slate-950" />
      </a>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
                C
              </div>
              <span className="text-lg font-bold text-white">CIVITA.</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CIVITA adalah penyedia layanan desain profesional untuk kebutuhan
              karir individu dan materi visual operasional bisnis.
            </p>
            <div className="pt-2 text-slate-300 font-medium">
              WhatsApp:{" "}
              <a
                href={getWaLink()}
                className="text-emerald-400 hover:underline"
              >
                {SITE.whatsappFormatted}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Navigasi Layanan
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#layanan" className="hover:text-emerald-400">
                  Desain CV Profesional
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-emerald-400">
                  Surat Lamaran Kerja
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-emerald-400">
                  Portfolio Kerja & Perusahaan
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-emerald-400">
                  Brosur & Flier Promosi
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-emerald-400">
                  Resi & Nota Bisnis
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Hubungi Kami
            </h3>
            <p className="text-slate-400">
              Diskusi santai & konsultasi cepat langsung melalui WhatsApp resmi
              CIVITA.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-emerald-400 font-semibold"
              >
                WhatsApp Chat
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-pink-400 font-semibold"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} CIVITA Design Studio. Hak Cipta
            Dilindungi.
          </div>
          <div>Dokumen & Visual Profesional Indonesia</div>
        </div>
      </div>
    </footer>
  );
}

function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CIVITA",
    description: SITE.description,
    telephone: SITE.whatsappFormatted,
    url: "https://bikincivita.com",
    sameAs: [SITE.instagramUrl],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
    },
    offers: SERVICES_DATA.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.description,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      <StructuredData />
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <PortfolioGallery />
        <BeforeAfter />
        <WhyCivita />
        <ProcessSection />
        <Testimonials />
        <InstagramSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}