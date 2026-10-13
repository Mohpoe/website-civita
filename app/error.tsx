"use client";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import {
  Coffee,
  Frown,
  Home,
  RefreshCcw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error secara background
    console.error("Oops, something tripped the server:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col gap-10 items-center justify-center p-4 md:p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-50 selection:bg-zinc-200 dark:selection:bg-zinc-800">

      {/* --- INJECTED CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-left {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes float-right {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(1deg); }
        }
        @keyframes spark-glitch {
          0%, 100% { opacity: 0.8; transform: scale(1) translate(0, 0); }
          10% { opacity: 1; transform: scale(1.1) translate(-2px, 1px); }
          20% { opacity: 0.2; transform: scale(0.9) translate(1px, -2px); }
          30% { opacity: 0.9; transform: scale(1.05) translate(0px, 2px); }
          40%, 90% { opacity: 0.8; transform: scale(1) translate(0, 0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .anim-float-l { animation: float-left 4s ease-in-out infinite; }
          .anim-float-r { animation: float-right 4s ease-in-out infinite 0.5s; }
          .anim-spark { animation: spark-glitch 2s infinite; }
          .anim-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        }
      `}} />

      {/* Decorative Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      {/* Main Glassmorphism Container */}
      <div className="relative w-full max-w-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)] ring-1 ring-zinc-200/50 dark:ring-white/10 overflow-hidden flex flex-col transform transition-all">

        {/* macOS Window Controls */}
        <div className="absolute top-5 left-6 flex gap-2 z-20">
          <div className="w-3 h-3 rounded-full bg-red-400/80 border border-red-500/50 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/50 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-500/50 shadow-sm" />
        </div>

        {/* --- TOP SECTION: UNPLUGGED CABLE ANIMATION --- */}
        <div className="relative h-[220px] md:h-[280px] w-full bg-gradient-to-b from-zinc-100/50 to-transparent dark:from-zinc-950/50 border-b border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden flex items-center justify-center">

          {/* Subtle Ambient Light (Danger Glow) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/15 dark:bg-red-500/20 blur-[50px] rounded-full pointer-events-none anim-pulse-soft" />

          {/* Code-Generated SVG Illustration (Unplugged Cable) */}
          <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full object-cover pointer-events-none drop-shadow-sm">
            <defs>
              <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Left Wire & Plug (Animates Left/Up) */}
            <g className="anim-float-l text-zinc-700 dark:text-zinc-300">
              {/* Wire */}
              <path d="M-20,150 Q40,155 90,150" stroke="url(#wireGradient)" strokeWidth="14" strokeLinecap="round" fill="none" />
              {/* Plug Body */}
              <rect x="80" y="125" width="70" height="50" rx="14" fill="currentColor" />
              <rect x="135" y="135" width="6" height="30" rx="3" fill="#fff" className="opacity-20 dark:opacity-10" />
              {/* Prongs */}
              <rect x="150" y="136" width="30" height="8" rx="4" fill="currentColor" />
              <rect x="150" y="156" width="30" height="8" rx="4" fill="currentColor" />
            </g>

            {/* Right Wire & Socket (Animates Right/Down) */}
            <g className="anim-float-r text-zinc-700 dark:text-zinc-300" style={{ transformOrigin: "right center" }}>
              {/* Wire */}
              <path d="M420,165 Q360,160 310,165" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" opacity="1" />
              {/* Socket Body */}
              <rect x="250" y="128" width="70" height="58" rx="14" fill="currentColor" />
              <rect x="260" y="138" width="6" height="38" rx="3" fill="#000" className="opacity-20 dark:opacity-40" />
              {/* Prong Holes (Darker inside) */}
              <rect x="240" y="141" width="20" height="12" rx="4" fill="#000" className="opacity-30 dark:opacity-50" />
              <rect x="240" y="161" width="20" height="12" rx="4" fill="#000" className="opacity-30 dark:opacity-50" />
            </g>

            {/* Sparks & Glitch Effects (Center) */}
            <g className="anim-spark text-red-500 dark:text-red-400">
              {/* Main Lightning Jagged Line */}
              <path d="M 190,140 L 210,155 L 195,160 L 225,175" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Floating Spark Dots */}
              <circle cx="215" cy="135" r="3" fill="currentColor" />
              <circle cx="185" cy="165" r="2.5" fill="currentColor" />
              <circle cx="230" cy="155" r="2" fill="currentColor" opacity="0.8" />
              <circle cx="205" cy="180" r="3" fill="currentColor" opacity="0.6" />
              {/* Action lines */}
              <path d="M 215,125 L 220,120 M 180,170 L 175,175" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
          </svg>
        </div>

        {/* --- BOTTOM SECTION: KASUAL & KEKINIAN CONTENT --- */}
        <div className="p-8 md:p-10 lg:px-12 flex flex-col relative z-10">

          {/* Fun Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 dark:bg-red-500/10 ring-1 ring-red-200 dark:ring-red-500/20 backdrop-blur-md">
              <Frown className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-[13px] font-semibold text-red-600 dark:text-red-400 tracking-wide uppercase">
                Ada yang salah
              </span>
            </div>

            {/* Casual Error Ref */}
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
              <span>ERR_REF: {error.digest || 'MINTA_HEALING'}</span>
            </div>
          </div>

          {/* Typography - Kasual Tone */}
          <h1 className="text-2xl md:text-[32px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3 leading-snug">
            Halaman ini gagal dimuat!
          </h1>
          <p className="text-[15px] md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-[480px]">
            Telah terjadi masalah pada halaman ini, mungkin ada algoritma yang gagal. Silakan <em>refresh</em> atau kembali ke halaman utama.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => reset()}
              className="h-12 px-6 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-[0.98] font-medium flex-1 sm:flex-none group"
            >
              <RefreshCcw className="w-4 h-4 mr-2 text-zinc-400 dark:text-zinc-600 group-hover:rotate-180 transition-transform duration-500" />
              Coba Refresh Dulu
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="h-12 px-6 py-2 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] font-medium flex-1 sm:flex-none"
            >
              <Home className="w-4 h-4 mr-2 text-zinc-400" />
              Balik ke Beranda
            </Button>
          </div>

        </div>
      </div>

      {/* Footer / Fun Tech Support link */}
      <div className="bottom-6 flex items-center gap-2 text-[13px] font-medium text-zinc-500 dark:text-zinc-500">
        <Coffee className="w-4 h-4" />
        <span>Masih error? Ngopi dulu aja atau lapor ke <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-zinc-700 dark:text-zinc-300 hover:underline decoration-zinc-400 underline-offset-2 transition-all">tim {APP_CONFIG.NAME}</a>.</span>
      </div>
    </div>
  );
}