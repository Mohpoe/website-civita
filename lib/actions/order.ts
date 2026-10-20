import { sql } from "@/lib/utils";
import { Order, ProductSnapshot } from "@/types/global";

// #region 1. GET ORDERS
export async function getOrders(userEmail?: string): Promise<Order[]> {
  try {
    const data = !userEmail
      ? await sql`
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
      `
      : await sql`
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
          WHERE o.email = ${userEmail}
          ORDER BY o.created_at DESC
      `;
    return data as Order[];
  } catch (error) {
    console.error("Gagal mengambil order:", error);
    return [];
  }
}
// #endregion
