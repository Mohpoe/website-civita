import type { Service } from "@/types/global";
import { sql } from "@/lib/utils";
import { unstable_cache } from "next/cache";

/** Tag revalidasi katalog layanan; dipakai server action setelah superadmin menyimpan. */
export const SERVICES_TAG = "services";

interface ServiceRow extends Omit<Service, "languages"> {
  languages: unknown;
}

/** `languages` disimpan sebagai jsonb; pastikan selalu berupa array string. */
function normalizeService(row: ServiceRow): Service {
  const languages = Array.isArray(row.languages)
    ? row.languages.filter((item): item is string => typeof item === "string")
    : [];

  return {
    ...row,
    price: Number(row.price),
    languages: languages.length > 0 ? languages : ["id"],
  };
}

/**
 * Baca katalog layanan langsung dari database (tanpa cache).
 * Dipakai halaman dashboard supaya superadmin selalu melihat nilai terbaru.
 */
export async function readServices(onlyActive = false): Promise<Service[]> {
  try {
    const rows = (onlyActive
      ? await sql`
          SELECT id, slug, name, description, price, languages,
                 is_active, sort_order, created_at, updated_at
          FROM services
          WHERE is_active = true
          ORDER BY sort_order ASC, name ASC
        `
      : await sql`
          SELECT id, slug, name, description, price, languages,
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
      SELECT id, slug, name, description, price, languages,
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
      SELECT id, slug, name, description, price, languages,
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
