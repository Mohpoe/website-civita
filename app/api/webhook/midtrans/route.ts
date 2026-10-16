import { NextResponse } from "next/server";
import crypto from "crypto";

// TODO: Import instance database Anda (misal: Prisma atau ORM lain)
// import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ekstrak data dari notifikasi Midtrans
    const { order_id, transaction_status, gross_amount, status_code, signature_key } = body;

    // 2. Verifikasi Keamanan (Signature Key)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto.createHash("sha512");
    hash.update(order_id + status_code + gross_amount + serverKey);
    const calculatedSignature = hash.digest("hex");

    if (signature_key !== calculatedSignature) {
      console.error("Invalid Midtrans Signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Mapping status Midtrans ke status Database Anda
    let newStatus = "PENDING"; // Default fallback
    if (transaction_status === "settlement" || transaction_status === "capture") {
      newStatus = "SUCCESS";
    } else if (transaction_status === "expire") {
      newStatus = "EXPIRED";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      newStatus = "CANCELED";
    } else if (transaction_status === "pending") {
      newStatus = "PENDING";
    }

    // 4. Update status ke Database
    // TODO: Buka komentar di bawah ini dan sesuaikan dengan skema database Anda
    /*
    await prisma.order.update({
      where: { id: order_id },
      data: { status: newStatus }
    });
    */

    console.log(`[Midtrans Webhook] Order: ${order_id} | Status: ${newStatus}`);

    // 5. WAJIB return 200 OK agar Midtrans berhenti mengirim notifikasi berulang
    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}