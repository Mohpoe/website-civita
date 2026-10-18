'use client'; // Wajib untuk komponen error di Next.js App Router

import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { AlertOctagon, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Anda bisa menyambungkan ini ke layanan reporting seperti Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#fdfaf8] dark:bg-[#171311] flex items-center justify-center p-6 selection:bg-[#f68e51] dark:selection:bg-[#d16f34] selection:text-foreground bg-[radial-gradient(color-mix(in_srgb,currentColor_30%,transparent)_1px,transparent_1px)] dark:bg-[radial-gradient(color-mix(in_srgb,currentColor_13%,transparent)_1px,transparent_1px)] [background-size:20px_20px]">

      {/* Kontainer Utama Neobrutalism */}
      <div className="relative w-full max-w-lg bg-[#fdfaf8] dark:bg-[#171311] border-[4px] border-foreground shadow-[12px_12px_0px_0px] shadow-foreground rounded-2xl p-8 md:p-10 z-10">

        {/* Ornamen Dekoratif Neobrutalism (Badge Oranye) */}
        <div className="absolute -top-4 -right-4 bg-[#f68e51] dark:bg-[#d16f34] border-[3px] border-foreground shadow-[4px_4px_0px_0px] shadow-foreground px-4 py-1 transform rotate-6 z-20">
          <span className="font-black text-black uppercase tracking-widest text-sm">
            Status: Gawat
          </span>
        </div>

        {/* Ikon Error */}
        <div className="w-20 h-20 bg-[#ef3936] dark:bg-[#c9302c] border-[4px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground rounded-full flex items-center justify-center mb-8">
          <AlertOctagon className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>

        {/* Tipografi Super Tebal */}
        <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight mb-4 uppercase">
          Yaaah, <br />
          <span className="text-[#ef3936] dark:text-[#c9302c] underline decoration-foreground decoration-[4px] underline-offset-8">
            Error
          </span> Nih!
        </h1>

        <p className="text-lg text-foreground/80 font-medium mb-8 border-l-[4px] border-[#f68e51] dark:border-[#d16f34] pl-4">
          <em>Ubur-ubur ikan lele, error nih le!</em> Kamu bisa refresh atau hubungi admin di <a href={`mailto:${APP_CONFIG.EMAIL}`} className="font-bold underline decoration-2 underline-offset-2 text-[#ef3936] dark:text-[#c9302c]">email</a> atau <a href={`${APP_CONFIG.LINKS.WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-2 text-[#ef3936] dark:text-[#c9302c]">WhatsApp</a>.
        </p>

        {/* Area Tombol */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tombol Utama - Merah */}
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#ef3936] dark:bg-[#c9302c] text-white font-black uppercase tracking-wide border-[3px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground px-6 py-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <RefreshCcw className="w-5 h-5" strokeWidth={3} />
            Coba Lagi
          </button>

          {/* Tombol Sekunder - Oranye */}
          <Link
            href={ROUTES.ROOT}
            className="flex-1 flex items-center justify-center gap-2 bg-[#f68e51] dark:bg-[#d16f34] text-black font-black uppercase tracking-wide border-[3px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground px-6 py-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <Home className="w-5 h-5" strokeWidth={3} />
            Ke Beranda
          </Link>
        </div>
      </div>

      {/* Ornamen Latar Belakang (Aksen Tambahan) */}
      <div className="fixed bottom-10 left-10 w-24 h-24 bg-[#f68e51] dark:bg-[#d16f34] border-[4px] border-foreground rounded-full -z-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-32 h-32 bg-[#ef3936] dark:bg-[#c9302c] border-[4px] border-foreground -z-0 opacity-20 transform rotate-12 pointer-events-none"></div>
    </div>
  );
}