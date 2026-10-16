import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID tidak valid!" }, { status: 400 });
    }

    // 1. Kirim request Cancel ke Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    // Catatan: Ganti URL ke https://api.midtrans.com/v2/... jika sudah masuk tahap Production
    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${encodedKey}`
      }
    });

    const data = await response.json();

    // Midtrans mengembalikan status 412 jika transaksi tidak bisa dibatalkan (misal: sudah settlement/sukses)
    if (!response.ok && data.status_code !== "412") {
      throw new Error(data.status_message || "Gagal membatalkan pesanan dari Midtrans");
    }

    // 2. Update status pesanan di database lokal menjadi 'canceled'
    await sql`
      UPDATE orders
      SET status = 'canceled'
      WHERE order_id = ${orderId} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true, message: "Pesanan berhasil dibatalkan." });
  } catch (error: any) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}