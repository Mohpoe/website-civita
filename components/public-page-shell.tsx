import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { getActiveServices } from "@/lib/service-catalog";
import { MIDTRANS_SNAP_JS_URL } from "@/lib/midtrans";
import Script from "next/script";
import type { ReactNode } from "react";

/**
 * Kerangka halaman publik (katalog, alat PDF, legal, dan bantuan).
 *
 * Memuat navigasi, footer, dan Snap sekali di layout supaya pembelian dari
 * halaman detail bisa langsung membuka pembayaran.
 */
export async function PublicPageShell({ children }: { children: ReactNode }) {
  const services = await getActiveServices();

  return (
    <div className="min-h-screen bg-paper font-mono text-ink">
      <PublicNavigation />
      {children}
      <PublicFooter services={services} />
      <Script
        src={MIDTRANS_SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
