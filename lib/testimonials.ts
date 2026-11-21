import { unstable_cache } from "next/cache";
import type { Testimonial } from "@/lib/site-config";
import { sql } from "@/lib/utils";

/** Tag revalidasi; dipakai server action setelah superadmin mengubah testimoni. */
export const TESTIMONIALS_TAG = "testimonials";

/**
 * Baca testimoni langsung dari database (tanpa cache).
 * Dipakai dashboard supaya superadmin melihat perubahan terbaru.
 */
export async function readTestimonials(onlyActive = false): Promise<Testimonial[]> {
  try {
    const rows = onlyActive
      ? await sql`
          SELECT id, image_url, alt_text, sort_order, is_active, created_at
          FROM testimonials
          WHERE is_active = true
          ORDER BY sort_order ASC, created_at DESC
        `
      : await sql`
          SELECT id, image_url, alt_text, sort_order, is_active, created_at
          FROM testimonials
          ORDER BY sort_order ASC, created_at DESC
        `;

    return rows as Testimonial[];
  } catch (error) {
    console.error("[Testimonials] gagal membaca testimonials:", error);
    return [];
  }
}

/**
 * Testimoni aktif untuk landing page.
 *
 * Di-cache sebentar supaya setiap kunjungan tidak membebani database. Urutan
 * acak dilakukan di komponen klien, jadi cache tidak "membekukan" urutan.
 */
const loadActiveTestimonials = unstable_cache(
  () => readTestimonials(true),
  ["active-testimonials"],
  { tags: [TESTIMONIALS_TAG], revalidate: 300 },
);

export function getActiveTestimonials(): Promise<Testimonial[]> {
  return loadActiveTestimonials();
}
