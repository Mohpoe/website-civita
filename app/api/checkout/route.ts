import { sql } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await auth.protect();

  try {
    // 1. Pastikan user sudah login via Clerk
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    // 2. Ambil data produk yang dikirim dari Frontend
    const body = await req.json();
    const { productId, title, price } = body;

    // 3. Buat Order ID unik (Contoh: ORD-CIV-1698765432-123)
    const orderId = `ORD-CIV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Siapkan Autentikasi untuk Midtrans (Encode Server Key jadi Base64)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    // 5. Minta Token Snap ke Midtrans API
    const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: price
        },
        item_details: [{
          id: productId,
          price: price,
          quantity: 1,
          name: title.substring(0, 50)
        }],
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages?.[0] || 'Gagal mendapatkan token dari Midtrans');
    }

    const snapToken = data.token;

    // 6. Simpan pesanan ke Database Neon dengan status 'pending'
    await sql`
      INSERT INTO orders (order_id, user_id, product_id, product_name, amount, status, snap_token)
      VALUES (${orderId}, ${user.id}, ${productId}, ${title}, ${price}, 'pending', ${snapToken})
    `;

    // 7. Kembalikan Token ke Frontend agar Pop-up muncul
    return NextResponse.json({ token: snapToken, orderId });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}