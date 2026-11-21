"use client";

import { ROUTES } from "@/lib/constants";
import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tautan ke dashboard yang aman untuk pengunjung belum masuk.
 * Kalau belum login, klik akan membuka modal Clerk, bukan memantulkan ke beranda.
 */
export function DashboardLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <span className={className} aria-hidden="true">
        {children}
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <Link href={ROUTES.DASHBOARD.HOME} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
      <button type="button" className={className}>
        {children}
      </button>
    </SignInButton>
  );
}
