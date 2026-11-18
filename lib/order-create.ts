import { createSnapToken } from "@/lib/midtrans-snap";
import { sql } from "@/lib/utils";

/**
 * Pembuatan order baru, dipakai bersama oleh checkout dan tombol
 * "Bayar Sekarang".
 *
 * Urutannya sengaja: simpan order lebih dulu, baru minta token Snap. Kalau
 * token gagal dibuat, baris order dihapus lagi sehingga tidak ada order
 * "hantu" yang tidak pernah bisa dibayar.
 */
export interface CreateOrderInput {
  userId: string;
  email: string;
  firstName?: string | null;
  /** `orders.product_id`; null kalau produk aslinya sudah dihapus. */
  productId: string | null;
  /** `orders.product_snapshot_id`; diisi kalau order mengacu ke snapshot. */
  productSnapshotId?: string | null;
  /** Data yang dikirim ke Midtrans sebagai `item_details`. */
  item: {
    id: string;
    name: string;
    price: number;
  };
}

export type CreateOrderResult =
  | { ok: true; orderId: string; token: string }
  | { ok: false; message: string };

export function generateOrderId(): string {
  return `ORD-CIV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function createOrderWithSnapToken(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const price = Number(input.item.price);

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, message: "Nominal pesanan tidak valid." };
  }

  const orderId = generateOrderId();

  await sql`
    INSERT INTO orders (
      order_id,
      user_id,
      email,
      product_id,
      product_snapshot_id,
      amount,
      status,
      snap_token
    )
    VALUES (
      ${orderId},
      ${input.userId},
      ${input.email},
      ${input.productId},
      ${input.productSnapshotId ?? null},
      ${price},
      'pending',
      NULL
    )
  `;

  const created = await createSnapToken({
    orderId,
    grossAmount: price,
    item: {
      id: input.item.id,
      name: input.item.name,
      price,
    },
    customer: { firstName: input.firstName, email: input.email },
  });

  if (!created.ok) {
    await sql`DELETE FROM orders WHERE order_id = ${orderId}`;
    return { ok: false, message: created.message };
  }

  await sql`
    UPDATE orders
    SET snap_token = ${created.token}
    WHERE order_id = ${orderId}
  `;

  return { ok: true, orderId, token: created.token };
}
