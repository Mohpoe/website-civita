'use client'; // Wajib untuk komponen error di Next.js App Router

import { buttonVariants } from '@/components/ui/button';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
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
    // Bisa disambungkan ke layanan reporting seperti Sentry.
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-paper p-6 text-ink selection:bg-coral selection:text-on-accent bg-[radial-gradient(color-mix(in_srgb,var(--ink)_12%,transparent)_1px,transparent_1px)] [background-size:20px_20px]">
      {/* Ornamen latar neobrutal dengan token tema. */}
      <div className="pointer-events-none absolute -bottom-12 -left-10 size-44 rounded-full border-2 border-ink bg-sage opacity-25" />
      <div className="pointer-events-none absolute -top-10 right-8 size-28 rotate-12 border-2 border-ink bg-coral opacity-25" />

      <div className="relative z-10 w-full max-w-lg rounded-xl border-2 border-ink bg-paper p-8 shadow-[10px_10px_0_0_var(--ink)] md:p-10">
        {/* Badge dekoratif */}
        <div className="absolute -right-3 -top-4 rotate-6 border-2 border-ink bg-coral px-4 py-1 shadow-[3px_3px_0_0_var(--ink)]">
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-on-accent">
            Status: Gawat
          </span>
        </div>

        {/* Ikon error */}
        <div className="mb-7 flex size-16 items-center justify-center rounded-full border-2 border-ink bg-coral shadow-[4px_4px_0_0_var(--ink)]">
          <AlertOctagon className="size-8 text-on-accent" strokeWidth={2.5} />
        </div>

        <h1 className="font-heading text-4xl font-bold uppercase leading-none tracking-tight text-ink md:text-5xl">
          Yaaah, <br />
          <span className="text-coral-deep underline decoration-ink decoration-4 underline-offset-8">
            Error
          </span>{' '}
          Nih!
        </h1>

        <p className="mt-6 border-l-4 border-coral pl-4 text-base font-medium leading-relaxed text-ink-soft">
          <em>Ubur-ubur ikan lele, error nih le!</em> Kamu bisa refresh atau hubungi admin di{' '}
          <a
            href={APP_CONFIG.LINKS.EMAIL}
            className="font-bold text-coral-deep underline decoration-2 underline-offset-2"
          >
            email
          </a>{' '}
          atau{' '}
          <a
            href={APP_CONFIG.LINKS.WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-coral-deep underline decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>
          .
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'nb-press h-11 flex-1 px-5 text-sm font-semibold',
            )}
          >
            <RefreshCcw className="size-5" strokeWidth={2.5} />
            Coba Lagi
          </button>

          <Link
            href={ROUTES.ROOT}
            className={cn(
              buttonVariants({ variant: 'outline' }),
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
