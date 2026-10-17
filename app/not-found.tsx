'use client'; // Gunakan use client karena kita memakai useRouter untuk tombol 'Kembali'

import { ROUTES } from '@/lib/constants';
import { ArrowLeft, Home, Map } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#fdfaf8] dark:bg-[#171311] flex items-center justify-center p-6 selection:bg-[#f68e51] dark:selection:bg-[#d16f34] selection:text-foreground">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.05)_20px,rgba(0,0,0,0.05)_40px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.02)_20px,rgba(255,255,255,0.02)_40px)] pointer-events-none" />

      {/* Kontainer Utama Neobrutalism */}
      <div className="relative w-full max-w-lg bg-[#fdfaf8] dark:bg-[#171311] border-[4px] border-foreground shadow-[12px_12px_0px_0px] shadow-foreground rounded-2xl p-8 md:p-10 z-10">

        {/* Ornamen Dekoratif Neobrutalism (Badge Oranye) */}
        <div className="absolute -top-4 -right-4 bg-[#f68e51] dark:bg-[#d16f34] border-[3px] border-foreground shadow-[4px_4px_0px_0px] shadow-foreground px-4 py-1 transform -rotate-6 z-20">
          <span className="font-black text-black uppercase tracking-widest text-sm">
            Status: Nyasar
          </span>
        </div>

        {/* Ikon 404 / Nyasar */}
        <div className="w-20 h-20 bg-[#ef3936] dark:bg-[#c9302c] border-[4px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground rounded-full flex items-center justify-center mb-8">
          <Map className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>

        {/* Tipografi Super Tebal */}
        <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight mb-4 uppercase">
          Hmmm,
          <span className="text-[#ef3936] dark:text-[#c9302c] underline decoration-foreground decoration-[4px] underline-offset-8">
            Nyasar
          </span> Bosku!?
        </h1>

        <p className="text-lg text-foreground/80 font-medium mb-8 border-l-[4px] border-[#f68e51] dark:border-[#d16f34] pl-4">
          <em>Pergi ke pasar beli hadiah, halaman yang kamu buka gak tersedia.</em> Mungkin udah dihapus atau dipindahin, mending balik ke halaman sebelumnya.
        </p>

        {/* Area Tombol */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tombol Sekunder - Oranye (Kembali ke halaman sebelumnya) */}
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#f68e51] dark:bg-[#d16f34] text-black font-black uppercase tracking-wide border-[3px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground px-6 py-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            Putar Balik
          </button>

          {/* Tombol Utama - Merah (Ke Beranda) */}
          <Link
            href={ROUTES.ROOT}
            className="flex-1 flex items-center justify-center gap-2 bg-[#ef3936] dark:bg-[#c9302c] text-white font-black uppercase tracking-wide border-[3px] border-foreground shadow-[6px_6px_0px_0px] shadow-foreground px-6 py-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <Home className="w-5 h-5" strokeWidth={3} />
            Ke Beranda
          </Link>
        </div>
      </div>

      {/* Ornamen Latar Belakang (Aksen Tambahan) */}
      <div className="fixed top-16 left-10 w-28 h-28 bg-[#f68e51] dark:bg-[#d16f34] border-[4px] border-foreground -z-0 opacity-20 transform -rotate-12 pointer-events-none"></div>
      <div className="fixed bottom-20 right-16 w-24 h-24 bg-[#ef3936] dark:bg-[#c9302c] border-[4px] border-foreground rounded-full -z-0 opacity-20 pointer-events-none"></div>

      {/* Teks 404 Besar di Background */}
      <div className="fixed top-3/8 left-2/5 -translate-x-1/2 -translate-y-1/2 text-[80vw] xl:text-[30vw] -rotate-10 font-black text-foreground opacity-5 z-5 pointer-events-none select-none">
        404
      </div>
    </div>
  );
}