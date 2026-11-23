"use client";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { CheckCircle2, Loader2, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Tombol pembelian di halaman detail produk.
 *
 * Pengunjung yang belum masuk melihat modal Clerk dan dikembalikan ke halaman
 * detail setelah berhasil masuk, bukan langsung dilempar ke pembayaran.
 */
export function ProductBuyPanel({
  productId,
  productTitle,
  owned,
  detailPath,
}: {
  productId: string;
  productTitle: string;
  owned: boolean;
  detailPath: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const buttonClass = cn(
    buttonVariants({ variant: "default" }),
    "nb-sm nb-press h-11 w-full bg-coral px-5 text-sm font-semibold text-on-accent hover:bg-coral",
  );

  if (!isLoaded) {
    return <Skeleton className="h-11 w-full rounded-md" />;
  }

  if (owned) {
    return (
      <div className="nb-sm rounded-lg bg-sage/40 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <CheckCircle2 className="size-4 shrink-0" />
          Kamu sudah memiliki produk ini.
        </p>
        <Link
          href={ROUTES.DASHBOARD.ORDER_PRODUCTS}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "nb-sm nb-press mt-3 h-10 w-full border-2 border-ink bg-paper text-sm font-semibold text-ink hover:bg-paper-2",
          )}
        >
          Buka Pesanan Saya
        </Link>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-2">
        <SignInButton mode="modal" fallbackRedirectUrl={detailPath}>
          <button type="button" className={buttonClass}>
            <Lock className="mr-2 size-4" />
            Masuk untuk membeli
          </button>
        </SignInButton>
        <p className="text-center text-[11px] text-ink-soft">
          Belum punya akun? Kamu bisa mendaftar saat masuk.
        </p>
      </div>
    );
  }

  const checkout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      // Script Midtrans dimuat dengan `lazyOnload`, jadi belum tentu siap.
      // Pesanan sudah dibuat di server; arahkan ke Pesanan Saya agar bisa
      // melanjutkan pembayaran tanpa kehilangan data.
      if (!window.snap) {
        toast.add({
          title: "Pembayaran Belum Siap",
          description:
            "Pesanan kamu sudah dibuat. Buka Pesanan Saya untuk melanjutkan pembayaran.",
          type: "info",
          priority: "high",
        });
        router.push(ROUTES.DASHBOARD.ORDER_PRODUCTS);
        router.refresh();
        return;
      }

      if (!data.token) {
        throw new Error("Token pembayaran tidak tersedia.");
      }

      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.add({
            title: "Pembayaran Berhasil",
            description: `Produk ${productTitle} sudah bisa diunduh dari Pesanan Saya.`,
            type: "success",
          });
          router.push(ROUTES.DASHBOARD.ORDER_PRODUCTS);
          router.refresh();
        },
        onPending: () => {
          toast.add({
            title: "Pesanan Dibuat",
            description: "Selesaikan pembayaran dari halaman Pesanan Saya.",
            type: "info",
          });
          router.push(ROUTES.DASHBOARD.ORDER_PRODUCTS);
          router.refresh();
        },
        onError: () => {
          setIsProcessing(false);
          toast.add({
            title: "Pembayaran Gagal",
            description:
              "Terjadi kesalahan pada layanan bank atau e-wallet. Silakan coba lagi.",
            type: "error",
            priority: "high",
          });
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
    } catch (error) {
      setIsProcessing(false);
      toast.add({
        title: "Pesanan Belum Dibuat",
        description: getErrorMessage(
          error,
          "Gagal terhubung ke internet. Periksa koneksi kamu.",
        ),
        type: "error",
        priority: "high",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={checkout}
        disabled={isProcessing}
        className={cn(
          buttonClass,
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isProcessing ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 size-4" />
        )}
        {isProcessing ? "Menyiapkan pembayaran..." : "Beli sekarang"}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
        <Lock className="size-3" /> Pembayaran aman lewat Midtrans
      </p>
    </div>
  );
}
