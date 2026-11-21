"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

type AuthActionsProps = {
  variant?: "desktop" | "mobile";
  className?: string;
};

/**
 * Tombol masuk/daftar/dashboard yang punya placeholder sendiri.
 *
 * Clerk baru tahu status login setelah skripnya selesai dimuat. Tanpa
 * placeholder, area ini kosong sesaat lalu tiba-tiba terisi dan menggeser
 * tombol lain. Skeleton di bawah menjaga ukuran area tetap sama.
 */
export function AuthActions({ variant = "desktop", className }: AuthActionsProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthActionsSkeleton variant={variant} className={className} />;
  }

  const mobile = variant === "mobile";
  const base = cn("h-10 px-4 font-semibold", mobile && "h-11 w-full");

  if (isSignedIn) {
    return (
      <Link
        href={ROUTES.DASHBOARD.HOME}
        className={cn(
          buttonVariants({ variant: "default" }),
          "nb-sm nb-press bg-butter text-on-accent hover:bg-butter",
          base,
          className,
        )}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        mobile && "grid grid-cols-2 gap-2",
        className,
      )}
    >
      <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
        <Button
          variant="ghost"
          className={cn(
            "nb-sm nb-press bg-paper text-ink hover:bg-paper-2",
            base,
          )}
        >
          Masuk
        </Button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
        <Button
          className={cn(
            "nb-sm nb-press bg-coral text-on-accent hover:bg-coral",
            base,
          )}
        >
          Daftar
        </Button>
      </SignUpButton>
    </div>
  );
}

function AuthActionsSkeleton({ variant = "desktop", className }: AuthActionsProps) {
  const mobile = variant === "mobile";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        mobile && "grid grid-cols-2 gap-2",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton
        className={cn(
          "rounded-md border-2 border-ink/15 bg-paper-2",
          mobile ? "h-11 w-full" : "h-10 w-[74px]",
        )}
      />
      <Skeleton
        className={cn(
          "rounded-md border-2 border-ink/15 bg-paper-2",
          mobile ? "h-11 w-full" : "h-10 w-[74px]",
        )}
      />
    </div>
  );
}
