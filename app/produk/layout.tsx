import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { MIDTRANS_SNAP_JS_URL } from "@/lib/midtrans";
import type { ReactNode } from "react";
import Script from "next/script";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper font-mono text-ink">
      <PublicNavigation />
      {children}
      <PublicFooter />
      {/* Pembayaran dari halaman detail produk butuh Snap; dashboard memuatnya
          sendiri, halaman publik perlu memuat di sini. */}
      <Script
        src={MIDTRANS_SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
