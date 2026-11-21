"use client";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Tombol beli produk digital.
 *
 * Kalau pengunjung belum masuk, tombol membuka modal Clerk (bukan melempar ke
 * dashboard yang akan memantulkan mereka kembali ke beranda).
 */
export function ProductBuyButton({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();

  const classes = cn(
    buttonVariants({ variant: "default" }),
    "nb-sm nb-press h-9 w-full bg-ink px-3 text-xs font-semibold text-paper hover:bg-ink",
    className,
  );

  if (!isLoaded) {
    return <Skeleton className="h-9 w-full rounded-md" />;
  }

  if (isSignedIn) {
    return (
      <Link href={ROUTES.DASHBOARD.HOME} className={classes}>
        Beli sekarang <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
      <button type="button" className={classes}>
        Beli sekarang <ArrowRight className="size-3.5" />
      </button>
    </SignInButton>
  );
}
