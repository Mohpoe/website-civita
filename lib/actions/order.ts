import { sql } from "@/lib/utils";
import { Order } from "@/types/global";

// #region 1. GET ORDERS MILIK USER
/**
 * Ambil order milik satu user berdasarkan Clerk user ID.
 *
 * Sengaja tidak menerima email dan tidak punya mode "tanpa filter": fungsi
 * yang lupa diisi argumen tidak boleh berubah menjadi "tampilkan semua order".
 */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (!userId) return [];

  try {
    const data = await sql`
      SELECT
        o.*,
        CASE
          WHEN p.id IS NOT NULL THEN
            to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
          ELSE null
        END as product,
        CASE
          WHEN ps.id IS NOT NULL THEN to_jsonb(ps.*)
          ELSE null
        END as product_snapshot
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_snapshots ps ON o.product_snapshot_id = ps.id
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `;
    return data as Order[];
  } catch (error) {
    console.error("Gagal mengambil order:", error);
    return [];
  }
}
// #endregion

// #region 2. GET SEMUA ORDERS (ADMIN)
/** Hanya untuk halaman admin. Jangan dipakai di konteks user. */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const data = await sql`
      SELECT
        o.*,
        CASE
          WHEN p.id IS NOT NULL THEN
            to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
          ELSE null
        END as product,
        CASE
          WHEN ps.id IS NOT NULL THEN to_jsonb(ps.*)
          ELSE null
        END as product_snapshot
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_snapshots ps ON o.product_snapshot_id = ps.id
      ORDER BY o.created_at DESC
    `;
    return data as Order[];
  } catch (error) {
    console.error("Gagal mengambil order:", error);
    return [];
  }
}
// #endregion
