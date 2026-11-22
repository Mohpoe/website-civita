import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tautan dari kartu landing ke halaman detail layanan.
 *
 * Halaman detail bersifat publik; login baru diminta saat pengunjung menekan
 * tombol pesan di sana.
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
  const classes = cn(
    buttonVariants({ variant: "default", size: "sm" }),
    "nb-sm nb-press h-8 bg-ink px-3 text-[11px] font-semibold text-paper hover:bg-ink",
    className,
  );

  return (
    <Link href={`/jasa/${slug}`} className={classes}>
      {children}
    </Link>
  );
}
