import { APP_CONFIG } from "@/lib/constants";
import { sendOrderSuccessEmail } from "@/lib/email";
import { MIDTRANS_API_BASE_URL } from "@/lib/midtrans";
import { sql } from "@/lib/utils";
import type { Order } from "@/types/global";
import { clerkClient } from "@clerk/nextjs/server";

export type OrderStatus = Order["status"];

/**
 * Terjemahkan status transaksi Midtrans ke status order lokal.
 *
 * `refund`, `partial_refund`, dan `chargeback` sengaja dipetakan ke `failed`
 * supaya akses produk dicabut setelah uang dikembalikan/disengketakan. Kalau
 * dibiarkan jatuh ke default `pending`, order yang sudah sukses justru mundur
 * dan bisa dibeli ulang.
 *
 * `capture` tanpa `fraud_status` dianggap sukses: sebagian kanal tidak mengirim
 * `fraud_status`, dan sebelumnya kasus itu tertahan `pending` selamanya.
 */
export function mapMidtransStatus(
  transactionStatus: string | undefined,
  fraudStatus?: string | null,
): OrderStatus {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "challenge" : "success";
    case "settlement":
      return "success";
    case "cancel":
      return "canceled";
    case "deny":
    case "failure":
    case "refund":
    case "partial_refund":
    case "chargeback":
      return "failed";
    case "expire":
      return "expired";
    default:
      return "pending";
  }
}

const FINAL_STATUSES: OrderStatus[] = ["success", "failed", "expired", "canceled"];

/**
 * Notifikasi bisa datang tidak berurutan. Status final tidak boleh mundur,
 * kecuali `success` → `failed` yang memang dipakai untuk refund/chargeback.
 */
function shouldIgnore(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (!FINAL_STATUSES.includes(current)) return false;
  if (current === "success") return next !== "failed";
  return next === "pending" || next === "challenge";
}

interface OrderRow {
  status: OrderStatus;
  email: string | null;
  user_id: string | null;
  product_title: string | null;
}

export interface ApplyOrderStatusResult {
  /** `false` jika order tidak ada di database. */
  found: boolean;
  /** `true` jika status benar-benar berubah. */
  changed: boolean;
}

/**
 * Terapkan status order secara idempoten dan kirim email hanya saat transisi
 * pertama ke `success`. Dipakai oleh webhook Midtrans dan cron rekonsiliasi.
 */
export async function applyOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<ApplyOrderStatusResult> {
  const rows = (await sql`
    SELECT
      o.status,
      o.email,
      o.user_id,
      COALESCE(p.title, ps.title) AS product_title
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    LEFT JOIN product_snapshots ps ON o.product_snapshot_id = ps.id
    WHERE o.order_id = ${orderId}
    LIMIT 1
  `) as OrderRow[];

  if (rows.length === 0) {
    return { found: false, changed: false };
  }

  const order = rows[0];

  if (shouldIgnore(order.status, newStatus)) {
    return { found: true, changed: false };
  }

  await sql`
    UPDATE orders
    SET status = ${newStatus}
    WHERE order_id = ${orderId}
  `;

  console.log(
    `✅ [Order] ${orderId} | ${order.status} → ${newStatus}`,
  );

  if (newStatus === "success") {
    await notifyBuyer(orderId, order);
  }

  return { found: true, changed: true };
}

/**
 * Kirim email bukti pembelian. Email diambil dari baris order lebih dulu supaya
 * tetap bisa dikirim walau akun Clerk sudah dihapus (user_id di-NULL-kan).
 */
async function notifyBuyer(orderId: string, order: OrderRow) {
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
          `[Order] gagal mengambil data Clerk untuk ${orderId}:`,
          (error as Error).message,
        );
      }
    }

    if (!userEmail) {
      console.warn(`[Order] ${orderId} tidak memiliki email tujuan.`);
      return;
    }

    const productName =
      order.product_title || `Produk Digital ${APP_CONFIG.NAME}`;

    const result = await sendOrderSuccessEmail({
      userEmail,
      userName: userName || `Pelanggan Setia ${APP_CONFIG.NAME}`,
      orderId,
      productName,
    });

    if (!result.success) {
      console.error(`[Order] gagal mengirim email untuk ${orderId}`);
    }
  } catch (error) {
    console.error(`[Order] error saat mengirim email ${orderId}:`, error);
  }
}

export type MidtransStatusResult =
  | { found: true; status: OrderStatus }
  | { found: false; reason: "not-found" | "error" };

/**
 * Ambil status transaksi langsung dari Midtrans Core API.
 *
 * `not-found` berarti transaksi tidak pernah terbentuk di Midtrans (user
 * menutup popup sebelum memilih metode bayar). `error` berarti status tidak
 * bisa dipastikan, jadi pemanggil sebaiknya mencoba lagi nanti.
 */
export async function fetchMidtransStatus(
  orderId: string,
): Promise<MidtransStatusResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  if (!serverKey) {
    return { found: false, reason: "error" };
  }

  const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");

  try {
    const response = await fetch(
      `${MIDTRANS_API_BASE_URL}/v2/${encodeURIComponent(orderId)}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${encodedKey}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => ({}));

    // Midtrans Core API membalas HTTP 200 walau transaksinya tidak ada; kode
    // sebenarnya ada di body (`status_code`). Jangan mengandalkan HTTP status.
    const statusCode = String(data.status_code ?? "");

    if (statusCode === "404") {
      return { found: false, reason: "not-found" };
    }

    if (!response.ok || (statusCode !== "" && statusCode !== "200")) {
      console.error(
        `[Order] status Midtrans ${orderId} gagal: HTTP ${response.status} / ${statusCode || "-"}`,
      );
      return { found: false, reason: "error" };
    }

    return {
      found: true,
      status: mapMidtransStatus(data.transaction_status, data.fraud_status),
    };
  } catch (error) {
    console.error(`[Order] status Midtrans ${orderId} error:`, error);
    return { found: false, reason: "error" };
  }
}
