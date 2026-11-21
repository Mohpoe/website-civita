import { getPrimaryEmail } from "@/lib/auth";
import { createSnapToken } from "@/lib/midtrans-snap";
import { applyServiceOrderStatus } from "@/lib/service-order-status";
import { fetchMidtransStatus } from "@/lib/order-status";
import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface ServiceOrderRow {
  order_id: string;
  service_id: string | null;
  service_name: string;
  amount: number;
  status: string;
}

/**
 * Minta token Snap baru untuk pesanan jasa yang masih pending.
 * Dipakai tombol "Lanjutkan pembayaran" di ruang pesanan.
 */
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userEmail = getPrimaryEmail(user);
    if (!userEmail) {
      return NextResponse.json({ error: "Akun belum memiliki email." }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      return NextResponse.json({ error: "Order ID tidak ditemukan." }, { status: 400 });
    }

    const rows = (await sql`
      SELECT order_id, service_id, service_name, amount, status
      FROM service_orders
      WHERE order_id = ${orderId} AND user_id = ${user.id}
      LIMIT 1
    `) as ServiceOrderRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const order = rows[0];

    if (order.status === "success") {
      return NextResponse.json({ error: "Pesanan ini sudah dibayar." }, { status: 409 });
    }

    if (order.status !== "pending" && order.status !== "challenge") {
      return NextResponse.json(
        { error: "Pesanan ini sudah tidak aktif. Silakan buat pesanan baru." },
        { status: 409 },
      );
    }

    const amount = Number(order.amount);
    const created = await createSnapToken({
      orderId: order.order_id,
      grossAmount: amount,
      item: {
        id: order.service_id || order.order_id,
        name: order.service_name,
        price: amount,
      },
      customer: { firstName: user.firstName, email: userEmail },
    });

    if (created.ok) {
      await sql`
        UPDATE service_orders
        SET snap_token = ${created.token}, updated_at = now()
        WHERE order_id = ${order.order_id}
      `;

      return NextResponse.json({ token: created.token, orderId: order.order_id });
    }

    // Token bisa ditolak karena order Midtrans sudah dibayar. Cek dulu agar
    // status lokal ikut terselamatkan sebelum klien diminta membuat order baru.
    const midtrans = await fetchMidtransStatus(order.order_id);
    if (midtrans.found) {
      await applyServiceOrderStatus(order.order_id, midtrans.status);

      if (midtrans.status === "success") {
        return NextResponse.json({ error: "Pesanan ini sudah dibayar." }, { status: 409 });
      }
    }

    return NextResponse.json({ error: created.message }, { status: 502 });
  } catch (error) {
    console.error("Bayar ulang pesanan jasa error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
