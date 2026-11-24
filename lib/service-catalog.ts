import type { Service } from "@/types/global";
import { sql } from "@/lib/utils";
import { unstable_cache } from "next/cache";

/** Tag revalidasi katalog layanan; dipakai server action setelah superadmin menyimpan. */
export const SERVICES_TAG = "services";

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  prices?: unknown;
  icon?: unknown;
  accent?: unknown;
  tags?: unknown;
  languages: unknown;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * `languages` dan `prices` disimpan sebagai jsonb. Data lama (sebelum migrasi
 * 004) hanya punya `price`, jadi harga per bahasa diisi dari harga tunggal itu.
 */
export function normalizeService(row: ServiceRow): Service {
  const languages = Array.isArray(row.languages)
    ? row.languages.filter((item): item is string => typeof item === "string")
    : [];

  const prices: Record<string, number> = {};
  if (row.prices && typeof row.prices === "object" && !Array.isArray(row.prices)) {
    for (const [code, value] of Object.entries(row.prices as Record<string, unknown>)) {
      const amount = Number(value);
      if (Number.isFinite(amount) && amount >= 0) {
        prices[code] = Math.round(amount);
      }
    }
  }

  const fallback = Math.round(Number(row.price) || 0);
  const activeLanguages = languages.length > 0 ? languages : ["id"];
  for (const code of activeLanguages) {
    if (!prices[code]) prices[code] = fallback;
  }

  const enabledPrices = activeLanguages
    .map((code) => prices[code])
    .filter((amount) => Number.isFinite(amount) && amount > 0);

  const icon = typeof row.icon === "string" && row.icon.trim() ? row.icon.trim() : null;
  const accent =
    typeof row.accent === "string" && row.accent.trim() ? row.accent.trim() : null;
  const tags = Array.isArray(row.tags)
    ? row.tags
      .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      .slice(0, 2)
    : [];

  return {
    ...row,
    price: enabledPrices.length > 0 ? Math.min(...enabledPrices) : fallback,
    prices,
    icon,
    accent,
    tags,
    languages: activeLanguages,
  };
}

/** Harga yang benar-benar ditagihkan untuk bahasa yang dipilih klien. */
export function servicePriceForLanguage(
  service: Pick<Service, "price" | "prices">,
  language: string,
): number {
  const amount = Number(service.prices?.[language] ?? service.price);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Baca katalog layanan langsung dari database (tanpa cache).
 * Dipakai halaman dashboard supaya superadmin selalu melihat nilai terbaru.
 */
export async function readServices(onlyActive = false): Promise<Service[]> {
  try {
    const rows = (onlyActive
      ? await sql`
          SELECT id, slug, name, description, price, prices, icon, accent, tags, languages,
                 is_active, sort_order, created_at, updated_at
          FROM services
          WHERE is_active = true
          ORDER BY sort_order ASC, name ASC
        `
      : await sql`
          SELECT id, slug, name, description, price, prices, icon, accent, tags, languages,
                 is_active, sort_order, created_at, updated_at
          FROM services
          ORDER BY sort_order ASC, name ASC
        `) as ServiceRow[];

    return rows.map(normalizeService);
  } catch (error) {
    console.error("[Services] gagal membaca katalog layanan:", error);
    return [];
  }
}

/** Katalog aktif untuk landing page dan form pemesanan. */
const loadActiveServices = unstable_cache(
  () => readServices(true),
  ["active-services"],
  { tags: [SERVICES_TAG], revalidate: 300 },
);

export function getActiveServices(): Promise<Service[]> {
  return loadActiveServices();
}

/** Detail satu layanan aktif berdasarkan slug (dipakai halaman pemesanan). */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!slug) return null;

  try {
    const rows = (await sql`
      SELECT id, slug, name, description, price, prices, icon, accent, tags, languages,
             is_active, sort_order, created_at, updated_at
      FROM services
      WHERE slug = ${slug} AND is_active = true
      LIMIT 1
    `) as ServiceRow[];

    return rows.length > 0 ? normalizeService(rows[0]) : null;
  } catch (error) {
    console.error("[Services] gagal membaca detail layanan:", error);
    return null;
  }
}

/** Detail satu layanan berdasarkan id (dipakai validasi checkout). */
export async function getServiceById(id: string): Promise<Service | null> {
  if (!id) return null;

  try {
    const rows = (await sql`
      SELECT id, slug, name, description, price, prices, icon, accent, tags, languages,
             is_active, sort_order, created_at, updated_at
      FROM services
      WHERE id = ${id} AND is_active = true
      LIMIT 1
    `) as ServiceRow[];

    return rows.length > 0 ? normalizeService(rows[0]) : null;
  } catch (error) {
    console.error("[Services] gagal membaca layanan:", error);
    return null;
  }
}
