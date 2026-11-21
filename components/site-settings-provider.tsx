"use client";

import {
  DEFAULT_SITE_SETTINGS,
  getSiteLinks,
  type SiteLinks,
  type SiteSettings,
} from "@/lib/site-config";
import { createContext, useContext, type ReactNode } from "react";

interface SiteSettingsContextValue {
  settings: SiteSettings;
  links: SiteLinks;
}

const FALLBACK: SiteSettingsContextValue = {
  settings: DEFAULT_SITE_SETTINGS,
  links: getSiteLinks(DEFAULT_SITE_SETTINGS),
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>(FALLBACK);

/**
 * Membagikan identitas situs (nama brand, kontak, tautan) ke komponen klien.
 *
 * Nilainya dibaca dari database di root layout, jadi header, footer, dan
 * landing page selalu memakai data yang sama tanpa masing-masing memanggil
 * server action.
 */
export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider
      value={{ settings, links: getSiteLinks(settings) }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
