import { sql } from "@/lib/utils";
import { Order } from "@/types/global";

// #region 1. GET ORDERS
export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const data = !userId
      ? await sql`
          SELECT
            o.*,
            CASE
              WHEN p.id IS NOT NULL THEN
                to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
              ELSE null
            END as product
          FROM orders o
          LEFT JOIN products p ON o.product_id = p.id
          LEFT JOIN categories c ON p.category_id = c.id
          ORDER BY o.created_at DESC
      `
      : await sql`
        SELECT
          o.*,
          -- Jika product_id ada, gabungkan data produk dengan data kategori yang di-convert ke JSON
          CASE
            WHEN p.id IS NOT NULL THEN
              to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
            ELSE null
          END as product
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE o.user_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    return data as Order[];
  } catch (error) {
    console.error("Gagal mengambil order:", error);
    return [];
  }
}
// #endregion 1. GET ORDERS