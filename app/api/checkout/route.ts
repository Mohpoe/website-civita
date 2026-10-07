import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID tidak ditemukan!" }, { status: 400 });
    }

    const rows = await sql`
      SELECT title, price, file_url
      FROM products
      WHERE id = ${productId} AND is_active = TRUE
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau tidak tersedia!" }, { status: 404 });
    }

    const product = rows[0];

    if (!product.file_url) {
      return NextResponse.json({ error: "File untuk produk ini belum tersedia! Hubungi Admin." }, { status: 400 });
    }

    const orderId = `ORD-CIV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${encodedKey}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: product.price
        },
        item_details: [{
          id: productId,
          price: product.price,
          quantity: 1,
          name: product.title.substring(0, 50)
        }],
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages?.[0] || "Gagal mendapatkan token dari Midtrans");
    }

    const snapToken = data.token;

    await sql`
      INSERT INTO orders (order_id, user_id, product_id, product_name, amount, status, snap_token, download_url)
      VALUES (${orderId}, ${user.id}, ${productId}, ${product.title}, ${product.price}, 'pending', ${snapToken}, ${product.file_url})
    `;

    return NextResponse.json({ token: snapToken, orderId });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}