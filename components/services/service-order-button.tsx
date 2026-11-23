"use client";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

/**
 * Tombol pemesanan di halaman detail jasa.
 *
 * Pengunjung yang belum masuk melihat modal Clerk dan dikembalikan ke halaman
 * detail setelah berhasil masuk. Setelah masuk, tombol membuka form pesanan.
 */
export function ServiceOrderButton({
  slug,
  detailPath,
}: {
  slug: string;
  detailPath: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const href = `${ROUTES.DASHBOARD.SERVICE_NEW}?service=${encodeURIComponent(slug)}`;

  const classes = cn(
    buttonVariants({ variant: "default" }),
    "nb-sm nb-press h-11 w-full bg-coral px-5 text-sm font-semibold text-on-accent hover:bg-coral",
  );

  if (!isLoaded) {
    return <Skeleton className="h-11 w-full rounded-md" />;
  }

  if (isSignedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Link href={href} className={classes}>
          Pesan jasa ini <ArrowRight className="ml-2 size-4" />
        </Link>
        <p className="text-center text-[11px] text-ink-soft">
          Kamu akan mengisi data dan mengunggah berkas di form pesanan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SignInButton mode="modal" fallbackRedirectUrl={detailPath}>
        <button type="button" className={classes}>
          <Lock className="mr-2 size-4" />
          Masuk untuk memesan
        </button>
      </SignInButton>
      <p className="text-center text-[11px] text-ink-soft">
        Belum punya akun? Kamu bisa mendaftar saat masuk.
      </p>
    </div>
  );
}
