"use client";

import { ServiceOrderDialog } from "@/components/services/service-order-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/global";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";

/**
 * Tombol pemesanan di halaman detail jasa.
 *
 * Pengunjung yang belum masuk melihat modal Clerk. Niat memesan disimpan
 * sebagai state, jadi begitu login berhasil dialog langsung terbuka tanpa
 * berpindah ke dashboard.
 */
export function ServiceOrderButton({ service }: { service: Service }) {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const [orderIntent, setOrderIntent] = useState(false);

  const isDialogOpen = Boolean(isSignedIn && orderIntent);

  const classes = cn(
    buttonVariants({ variant: "default" }),
    "nb-sm nb-press h-11 w-full bg-coral px-5 text-sm font-semibold text-on-accent hover:bg-coral",
  );

  if (!isLoaded) {
    return <Skeleton className="h-11 w-full rounded-md" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {isSignedIn ? (
        <button type="button" className={classes} onClick={() => setOrderIntent(true)}>
          Pesan jasa ini <ArrowRight className="ml-2 size-4" />
        </button>
      ) : (
        <button
          type="button"
          className={classes}
          onClick={() => {
            setOrderIntent(true);
            clerk.openSignIn();
          }}
        >
          <Lock className="mr-2 size-4" />
          Masuk untuk memesan
        </button>
      )}

      <p className="text-center text-[11px] text-ink-soft">
        {isSignedIn
          ? "Isi data dan lampiran di dialog, lalu bayar dengan aman."
          : "Belum punya akun? Kamu bisa mendaftar saat masuk."}
      </p>

      <ServiceOrderDialog
        service={service}
        open={isDialogOpen}
        onOpenChange={setOrderIntent}
      />
    </div>
  );
}
