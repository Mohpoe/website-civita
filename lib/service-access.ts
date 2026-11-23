import { sql } from "@/lib/utils";
import type { ServiceMessage, ServiceOrder } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";

/** Awalan order jasa; dipakai webhook untuk memilih tabel yang benar. */
export const SERVICE_ORDER_PREFIX = "SVC-";

export function generateServiceOrderId(): string {
  return `${SERVICE_ORDER_PREFIX}${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Pesan chat sebuah pesanan, urut dari yang paling lama. */
export async function readServiceMessages(orderId: string): Promise<ServiceMessage[]> {
  if (!orderId) return [];

  try {
    const rows = (await sql`
      SELECT id, order_id, sender_id, sender_role, body,
             attachment_url, attachment_name,
             attachment_size::int AS attachment_size, created_at
      FROM service_messages
      WHERE order_id = ${orderId}
      ORDER BY created_at ASC
      LIMIT 500
    `) as ServiceMessage[];

    return rows;
  } catch (error) {
    console.error("[ServiceOrder] gagal membaca chat:", error);
    return [];
  }
}

export interface ServiceAccess {
  userId: string;
  /** Peran yang dipakai saat menulis pesan. */
  role: "user" | "admin";
  isAdmin: boolean;
  isOwner: boolean;
  order: ServiceOrder;
}

/**
 * Pastikan user yang sedang login berhak melihat sebuah pesanan jasa.
 *
 * Pemilik pesanan dan admin/superadmin boleh masuk. Semua pemanggil (route
 * chat, unduhan, halaman detail) memakai fungsi ini supaya aturannya konsisten.
 */
export async function getServiceAccess(orderId: string): Promise<ServiceAccess | null> {
  if (!orderId) return null;

  const user = await currentUser();
  if (!user) return null;

  const rows = (await sql`
    SELECT *
    FROM service_orders
    WHERE order_id = ${orderId}
    LIMIT 1
  `) as ServiceOrder[];

  if (rows.length === 0) return null;

  const order = rows[0];
  const role = user.publicMetadata.role as string | undefined;
  const isAdmin = role === "admin" || role === "superadmin";
  const isOwner = order.user_id === user.id;

  if (!isOwner && !isAdmin) return null;

  return {
    userId: user.id,
    role: isAdmin ? "admin" : "user",
    isAdmin,
    isOwner,
    order,
  };
}
