import { sendServiceOrderPaidEmail } from "@/lib/email";
import { sql } from "@/lib/utils";
import type { ServiceOrderStatus } from "@/types/global";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Status pesanan jasa memakai himpunan yang sama dengan produk digital supaya
 * badge, filter, dan laporan bisa memakai helper yang sudah ada.
 */
const FINAL_STATUSES: ServiceOrderStatus[] = ["success", "failed", "expired", "canceled"];

/**
 * Notifikasi Midtrans bisa datang tidak berurutan. Status final tidak boleh
 * mundur, kecuali `success` → `failed` untuk refund/chargeback.
 */
function shouldIgnore(current: ServiceOrderStatus, next: ServiceOrderStatus): boolean {
  if (current === next) return true;
  if (!FINAL_STATUSES.includes(current)) return false;
  if (current === "success") return next !== "failed";
  return next === "pending" || next === "challenge";
}

interface ServiceOrderRow {
  status: ServiceOrderStatus;
  email: string | null;
  user_id: string;
  service_name: string;
}

export interface ApplyServiceOrderStatusResult {
  found: boolean;
  changed: boolean;
}

/**
 * Terapkan status pesanan jasa secara idempoten.
 *
 * Dipakai oleh webhook Midtrans. Email hanya dikirim pada transisi pertama ke
 * `success`, jadi notifikasi berulang tidak membanjiri inbox klien.
 */
export async function applyServiceOrderStatus(
  orderId: string,
  newStatus: ServiceOrderStatus,
): Promise<ApplyServiceOrderStatusResult> {
  const rows = (await sql`
    SELECT status, email, user_id, service_name
    FROM service_orders
    WHERE order_id = ${orderId}
    LIMIT 1
  `) as ServiceOrderRow[];

  if (rows.length === 0) {
    return { found: false, changed: false };
  }

  const order = rows[0];

  if (shouldIgnore(order.status, newStatus)) {
    return { found: true, changed: false };
  }

  await sql`
    UPDATE service_orders
    SET status = ${newStatus}, updated_at = now()
    WHERE order_id = ${orderId}
  `;

  console.log(`✅ [ServiceOrder] ${orderId} | ${order.status} → ${newStatus}`);

  if (newStatus === "success") {
    await notifyBuyer(orderId, order);
  }

  return { found: true, changed: true };
}

async function notifyBuyer(orderId: string, order: ServiceOrderRow) {
  try {
    let userEmail = order.email;
    let userName = "";

    if (order.user_id) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(order.user_id);
        const primaryEmail =
          user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId) ??
          user.emailAddresses[0];

        userEmail = userEmail || primaryEmail?.emailAddress || null;
        userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      } catch (error) {
        console.warn(
          `[ServiceOrder] gagal mengambil data Clerk untuk ${orderId}:`,
          (error as Error).message,
        );
      }
    }

    if (!userEmail) {
      console.warn(`[ServiceOrder] ${orderId} tidak memiliki email tujuan.`);
      return;
    }

    const result = await sendServiceOrderPaidEmail({
      userEmail,
      userName: userName || "Pelanggan",
      orderId,
      serviceName: order.service_name,
    });

    if (!result.success) {
      console.error(`[ServiceOrder] gagal mengirim email untuk ${orderId}`);
    }
  } catch (error) {
    console.error(`[ServiceOrder] error saat mengirim email ${orderId}:`, error);
  }
}
