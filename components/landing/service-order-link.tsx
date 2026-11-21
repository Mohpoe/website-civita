"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tombol "Pesan" layanan jasa.
 *
 * Pengunjung yang belum masuk diarahkan ke modal Clerk, lalu dikembalikan ke
 * form pemesanan setelah berhasil login.
 */
export function ServiceOrderLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const href = `/dashboard/services/new?service=${encodeURIComponent(slug)}`;

  const classes = cn(
    buttonVariants({ variant: "default", size: "sm" }),
    "nb-sm nb-press h-8 bg-ink px-3 text-[11px] font-semibold text-paper hover:bg-ink",
    className,
  );

  if (!isLoaded) {
    return (
      <span className={cn(classes, "pointer-events-none opacity-60")} aria-hidden="true">
        {children}
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl={href}>
      <button type="button" className={classes}>
        {children}
      </button>
    </SignInButton>
  );
}
