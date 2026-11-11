"use client";

import { civitaLocalization, getCivitaClerkAppearance } from "@/lib/clerk-appearance";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useMemo } from "react";

/**
 * Membungkus ClerkProvider agar tampilan Clerk ikut tema situs (next-themes),
 * bukan preferensi sistem operasi. Modals hanya dibuka setelah interaksi,
 * jadi perpindahan appearance tidak menimbulkan flicker pada halaman.
 *
 * `resolvedTheme` bernilai undefined saat SSR dan render klien pertama,
 * sehingga tidak ada hydration mismatch; nilainya baru terisi setelah mount.
 */
export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const appearance = useMemo(() => getCivitaClerkAppearance(isDark), [isDark]);

  return (
    <ClerkProvider
      localization={civitaLocalization}
      telemetry={false}
      appearance={appearance}
    >
      {children}
    </ClerkProvider>
  );
}
