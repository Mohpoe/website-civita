'use client'; // Memakai useRouter untuk tombol "Putar Balik".

import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowLeft, Home, Map } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-paper p-6 text-ink selection:bg-coral selection:text-on-accent bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,color-mix(in_srgb,var(--ink)_6%,transparent)_20px,color-mix(in_srgb,var(--ink)_6%,transparent)_40px)]">
      {/* Teks 404 besar di latar */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none font-heading text-[70vw] font-bold leading-none text-ink opacity-5 xl:text-[26vw]">
        404
      </div>

      {/* Ornamen latar neobrutal dengan token tema. */}
      <div className="pointer-events-none absolute -left-10 top-16 size-28 -rotate-12 border-2 border-ink bg-coral opacity-25" />
      <div className="pointer-events-none absolute -bottom-10 right-10 size-32 rounded-full border-2 border-ink bg-sage opacity-25" />

      <div className="relative z-10 w-full max-w-lg rounded-xl border-2 border-ink bg-paper p-8 shadow-[10px_10px_0_0_var(--ink)] md:p-10">
        {/* Badge dekoratif */}
        <div className="absolute -right-3 -top-4 -rotate-6 border-2 border-ink bg-coral px-4 py-1 shadow-[3px_3px_0_0_var(--ink)]">
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-on-accent">
            Status: Nyasar
          </span>
        </div>

        {/* Ikon nyasar */}
        <div className="mb-7 flex size-16 items-center justify-center rounded-full border-2 border-ink bg-coral shadow-[4px_4px_0_0_var(--ink)]">
          <Map className="size-8 text-on-accent" strokeWidth={2.5} />
        </div>

        <h1 className="font-heading text-4xl font-bold uppercase leading-none tracking-tight text-ink md:text-5xl">
          Hmmm,{' '}
          <span className="text-coral-deep underline decoration-ink decoration-4 underline-offset-8">
            Nyasar
          </span>{' '}
          Bosku!?
        </h1>

        <p className="mt-6 border-l-4 border-coral pl-4 text-base font-medium leading-relaxed text-ink-soft">
          <em>Pergi ke pasar beli hadiah, halaman yang kamu buka gak tersedia.</em> Mungkin
          udah dihapus atau dipindahin, mending balik ke halaman sebelumnya.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'nb-press h-11 flex-1 px-5 text-sm font-semibold',
            )}
          >
            <ArrowLeft className="size-5" strokeWidth={2.5} />
            Putar Balik
          </button>

          <Link
            href={ROUTES.ROOT}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'nb-press h-11 flex-1 px-5 text-sm font-semibold',
            )}
          >
            <Home className="size-5" strokeWidth={2.5} />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
