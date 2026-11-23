"use client";

import {
  civitaClerkAppearance,
  civitaLocalization,
} from "@/lib/clerk-appearance";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";

/**
 * Membungkus ClerkProvider dengan tampilan neo-brutalis CIVITA.
 *
 * Semua warna memakai CSS variable situs, jadi tema terang/gelap mengikuti
 * kelas `.dark` tanpa perlu menghitung appearance ulang di React.
 */
export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      ui={ui}
      localization={civitaLocalization}
      telemetry={false}
      appearance={civitaClerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
