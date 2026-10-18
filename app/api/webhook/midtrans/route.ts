import { sql } from "@/lib/utils";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sendOrderSuccessEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      transaction_status,
      gross_amount,
      status_code,
      signature_key,
      fraud_status
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto.createHash("sha512");

    hash.update(order_id + status_code + gross_amount + serverKey);
    const calculatedSignature = hash.digest("hex");

    if (signature_key !== calculatedSignature) {
      console.error("🚨 Webhook Error: Invalid Midtrans Signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let newStatus = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "challenge";
      } else if (fraud_status === "accept") {
        newStatus = "success";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "success";
    } else if (transaction_status === "cancel") {
      newStatus = "canceled";
    } else if (transaction_status === "deny" || transaction_status === "failure") {
      newStatus = "failed";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    }

    // 1. Dapatkan status saat ini beserta NAMA PRODUK dari database (Hanya 1 Query dengan JOIN)
    const currentOrderRows = await sql`
      SELECT
        o.status,
        o.user_id,
        o.product_id,
        p.title as product_title
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.order_id = ${order_id}
      LIMIT 1
    `;

    // Pastikan pesanan ditemukan
    if (currentOrderRows.length === 0) {
      console.error(`Pesanan ${order_id} tidak ditemukan di database.`);
      return NextResponse.json({ message: "OK" }, { status: 200 }); // Tetap return 200 ke Midtrans
    }

    const orderData = currentOrderRows[0];

    // 2. Eksekusi SQL Update ke Database
    await sql`
      UPDATE orders
      SET status = ${newStatus}
      WHERE order_id = ${order_id}
    `;

    console.log(`✅ [Webhook Sukses] Order: ${order_id} | Status berubah menjadi: ${newStatus}`);

    // ==============================================================================
    // BAGIAN EMAIL: KIRIM EMAIL JIKA STATUS BERUBAH MENJADI SUCCESS
    // ==============================================================================

    if (newStatus === "success" && orderData.status !== "success") {
      try {
        // a. Nama produk sudah didapatkan dari query JOIN sebelumnya
        const productName = orderData.product_title || "Produk Digital CIVITA";

        // b. Ambil detail user dari Clerk menggunakan user_id dari tabel orders
        const client = await clerkClient();
        const user = await client.users.getUser(orderData.user_id);

        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Pelanggan Setia CIVITA";

        // c. Kirim email
        if (userEmail) {
          sendOrderSuccessEmail({
            userEmail,
            userName,
            orderId: order_id,
            productName
          });
        } else {
          console.warn(`User dengan ID ${orderData.user_id} tidak memiliki email.`);
        }

      } catch (emailError) {
        console.error("Gagal saat memproses pengiriman email via Webhook:", emailError);
      }
    }
    // ==============================================================================

    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}