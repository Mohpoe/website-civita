import { sql } from "@/lib/utils";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ekstrak data dari payload Midtrans
    const {
      order_id,
      transaction_status,
      gross_amount,
      status_code,
      signature_key,
      fraud_status
    } = body;

    // 2. Verifikasi Keamanan (Signature Key) dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto.createHash("sha512");

    // Format hash: order_id + status_code + gross_amount + serverKey
    hash.update(order_id + status_code + gross_amount + serverKey);
    const calculatedSignature = hash.digest("hex");

    if (signature_key !== calculatedSignature) {
      console.error("🚨 Webhook Error: Invalid Midtrans Signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Mapping status Midtrans ke status Tabel Orders Anda (menggunakan huruf kecil sesuai default 'pending')
    let newStatus = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "challenge"; // Butuh verifikasi manual di dashboard Midtrans
      } else if (fraud_status === "accept") {
        newStatus = "success";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "success";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      newStatus = "canceled";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    }

    // 4. Eksekusi SQL Update ke Database
    await sql`
      UPDATE orders
      SET status = ${newStatus}
      WHERE order_id = ${order_id}
    `;

    console.log(`✅ [Webhook Sukses] Order: ${order_id} | Status berubah menjadi: ${newStatus}`);

    // 5. WAJIB return 200 OK agar Midtrans tidak menembak endpoint ini berulang-ulang
    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}