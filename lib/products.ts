import { unstable_cache } from "next/cache";
import type { Product } from "@/types/global";
import { sql } from "@/lib/utils";

/** Tag revalidasi katalog produk; dipakai server action setelah admin menyimpan. */
export const PRODUCTS_TAG = "products";

type ProductRow = Omit<Product, "features" | "price"> & {
  price: number | string;
  features: unknown;
};

/** `features` disimpan sebagai jsonb; pastikan selalu berupa array string. */
function normalizeFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }

  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw || "[]");
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeProduct(row: ProductRow): Product {
  return {
    ...row,
    price: Number(row.price),
    features: normalizeFeatures(row.features),
  };
}

/** Baca katalog produk aktif langsung dari database (tanpa cache). */
async function readActiveProducts(): Promise<Product[]> {
  try {
    const rows = (await sql`
      SELECT
        p.*,
        CASE
          WHEN c.id IS NOT NULL THEN to_jsonb(c.*)
          ELSE null
        END as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `) as ProductRow[];

    return rows.map(normalizeProduct);
  } catch (error) {
    console.error("[Products] gagal membaca katalog produk:", error);
    return [];
  }
}

/** Katalog aktif untuk halaman publik, di-cache agar tidak query tiap request. */
const loadActiveProducts = unstable_cache(
  readActiveProducts,
  ["active-products"],
  { tags: [PRODUCTS_TAG], revalidate: 300 },
);

export function getActiveProducts(): Promise<Product[]> {
  return loadActiveProducts();
}

/**
 * Detail satu produk aktif berdasarkan slug publik.
 * `id` tetap diterima sebagai cadangan untuk produk lama yang belum punya slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!slug) return null;

  try {
    const rows = (await sql`
      SELECT
        p.*,
        CASE
          WHEN c.id IS NOT NULL THEN to_jsonb(c.*)
          ELSE null
        END as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.slug = ${slug} OR p.id = ${slug})
        AND p.is_active = true
      LIMIT 1
    `) as ProductRow[];

    return rows.length > 0 ? normalizeProduct(rows[0]) : null;
  } catch (error) {
    console.error("[Products] gagal membaca detail produk:", error);
    return null;
  }
}

/** Produk aktif lain di kategori yang sama untuk bagian "Produk terkait". */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null | undefined,
  limit = 3,
): Promise<Product[]> {
  if (!categoryId) return [];

  try {
    const rows = (await sql`
      SELECT
        p.*,
        CASE
          WHEN c.id IS NOT NULL THEN to_jsonb(c.*)
          ELSE null
        END as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
        AND p.category_id = ${categoryId}
        AND p.id <> ${productId}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `) as ProductRow[];

    return rows.map(normalizeProduct);
  } catch (error) {
    console.error("[Products] gagal membaca produk terkait:", error);
    return [];
  }
}

/** Apakah user sudah pernah membeli produk ini dengan status sukses. */
export async function userOwnsProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  if (!userId || !productId) return false;

  try {
    const rows = await sql`
      SELECT 1
      FROM orders
      WHERE user_id = ${userId}
        AND product_id = ${productId}
        AND status = 'success'
      LIMIT 1
    `;

    return rows.length > 0;
  } catch (error) {
    console.error("[Products] gagal memeriksa kepemilikan produk:", error);
    return false;
  }
}
