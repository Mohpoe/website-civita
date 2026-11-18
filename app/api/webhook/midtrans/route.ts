import { applyOrderStatus, mapMidtransStatus } from "@/lib/order-status";
import crypto from "crypto";
import { NextResponse } from "next/server";

interface MidtransNotification {
  order_id?: string;
  transaction_status?: string;
  gross_amount?: string;
  status_code?: string;
  signature_key?: string;
  fraud_status?: string | null;
}

/** Bandingkan signature tanpa membocorkan waktu eksekusi. */
function isValidSignature(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MidtransNotification;

    const {
      order_id,
      transaction_status,
      gross_amount,
      status_code,
      signature_key,
      fraud_status,
    } = body;

    // Payload tanpa field wajib tidak bisa diverifikasi, jadi jangan diproses.
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      console.error("🚨 Webhook Error: payload tidak lengkap.");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (!isValidSignature(calculatedSignature, signature_key)) {
      console.error("🚨 Webhook Error: Invalid Midtrans Signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const newStatus = mapMidtransStatus(transaction_status, fraud_status);
    const result = await applyOrderStatus(order_id, newStatus);

    if (!result.found) {
      console.error(`Pesanan ${order_id} tidak ditemukan di database.`);
    } else if (!result.changed) {
      console.log(
        `ℹ️ [Webhook] ${order_id} diabaikan (status sudah ${newStatus} atau tidak boleh mundur).`,
      );
    }

    // Selalu 200 ke Midtrans agar notifikasi yang tidak relevan tidak diulang.
    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("🚨 Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
