import { MIDTRANS_SNAP_API_URL } from "@/lib/midtrans";
import { applyOrderStatus, fetchMidtransStatus } from "@/lib/order-status";
import { sql } from "@/lib/utils";

export interface SnapCustomer {
  firstName?: string | null;
  email: string;
}

export interface CreateSnapTokenInput {
  orderId: string;
  grossAmount: number;
  item: {
    id: string;
    name: string;
    price: number;
  };
  customer: SnapCustomer;
}

export type CreateSnapTokenResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

/**
 * Minta token Snap baru ke Midtrans.
 *
 * Meminta token ulang untuk `order_id` yang masih pending diperbolehkan:
 * token lama otomatis dicabut dan hanya token terbaru yang aktif. Ini yang
 * dipakai untuk tombol "Bayar Sekarang" agar user tidak terjebak dengan token
 * kedaluwarsa.
 */
export async function createSnapToken(
  input: CreateSnapTokenInput,
): Promise<CreateSnapTokenResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

  if (!serverKey) {
    return {
      ok: false,
      status: 500,
      message: "MIDTRANS_SERVER_KEY belum dikonfigurasi.",
    };
  }

  const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");

  try {
    const response = await fetch(MIDTRANS_SNAP_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${encodedKey}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.orderId,
          gross_amount: input.grossAmount,
        },
        customer_details: {
          first_name: input.customer.firstName || "User",
          email: input.customer.email,
        },
        item_details: [
          {
            id: input.item.id,
            price: input.item.price,
            quantity: 1,
            name: input.item.name.substring(0, 50),
          },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token) {
      return {
        ok: false,
        status: response.status,
        message:
          data.error_messages?.[0] ||
          data.status_message ||
          "Gagal mendapatkan token dari Midtrans",
      };
    }

    return { ok: true, token: data.token };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: (error as Error).message || "Gagal menghubungi Midtrans",
    };
  }
}

export type EnsureSnapTokenResult =
  | { ok: true; token: string }
  | { ok: false; reason: "already-paid" | "expired" | "error"; message: string };

export interface EnsureSnapTokenInput extends CreateSnapTokenInput {
  /** Token lama yang tersimpan di database, dipakai sebagai cadangan. */
  fallbackToken?: string | null;
}

/** Midtrans menolak order_id yang sudah dipakai lewat 400/406. */
function isOrderIdConflict(result: CreateSnapTokenResult): boolean {
  if (result.ok) return false;
  if (result.status !== 400 && result.status !== 406) return false;
  return /order_id/i.test(result.message);
}

/**
 * Pastikan sebuah order punya token Snap yang masih bisa dipakai.
 *
 * Kalau Midtrans menolak karena `order_id` sudah dipakai, status sebenarnya
 * ditanyakan ke Midtrans: order yang ternyata sudah dibayar diselamatkan
 * menjadi `success` (dan emailnya dikirim), sedangkan order yang sudah
 * kedaluwarsa ditandai agar pemanggil bisa membuat order baru.
 */
export async function ensureSnapTokenForOrder(
  input: EnsureSnapTokenInput,
): Promise<EnsureSnapTokenResult> {
  const created = await createSnapToken(input);

  if (created.ok) {
    await sql`
      UPDATE orders
      SET snap_token = ${created.token}
      WHERE order_id = ${input.orderId}
    `;

    return { ok: true, token: created.token };
  }

  if (!isOrderIdConflict(created)) {
    return { ok: false, reason: "error", message: created.message };
  }

  const midtrans = await fetchMidtransStatus(input.orderId);

  if (midtrans.found) {
    await applyOrderStatus(input.orderId, midtrans.status);

    if (midtrans.status === "success") {
      return {
        ok: false,
        reason: "already-paid",
        message: "Pesanan ini sudah dibayar.",
      };
    }

    if (midtrans.status === "pending" || midtrans.status === "challenge") {
      if (input.fallbackToken) {
        return { ok: true, token: input.fallbackToken };
      }

      return { ok: false, reason: "error", message: created.message };
    }

    return {
      ok: false,
      reason: "expired",
      message: "Pesanan sebelumnya sudah tidak aktif.",
    };
  }

  return { ok: false, reason: "error", message: created.message };
}
