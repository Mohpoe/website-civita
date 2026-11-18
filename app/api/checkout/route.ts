import { getPrimaryEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { ensureSnapTokenForOrder } from "@/lib/midtrans-snap";
import { createOrderWithSnapToken } from "@/lib/order-create";
import { checkRateLimit } from "@/lib/rate-limit";
import { sql } from "@/lib/utils";
import { Product } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface PendingOrderRow {
  order_id: string;
  amount: number;
  snap_token: string | null;
}

const RATE_LIMIT_WINDOW = 60; // detik
const MAX_CHECKOUT_PER_WINDOW = 10; // per user per menit

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userEmail = getPrimaryEmail(user);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Akun Anda belum memiliki email. Lengkapi profil terlebih dahulu." },
        { status: 400 },
      );
    }

    const rateLimit = await checkRateLimit(
      `checkout:ratelimit:${user.id}`,
      MAX_CHECKOUT_PER_WINDOW,
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan checkout. Silakan coba lagi sebentar lagi.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(RATE_LIMIT_WINDOW) },
        },
      );
    }

    const body = await req.json().catch(() => null);
    const productId = typeof body?.productId === "string" ? body.productId : "";

    if (!productId) {
      return NextResponse.json({ error: "Product ID tidak ditemukan!" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, title, price, file_url
      FROM products
      WHERE id = ${productId} AND is_active = TRUE
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan atau tidak tersedia!" },
        { status: 404 },
      );
    }

    const product = rows[0] as Product;

    if (!product.file_url) {
      return NextResponse.json(
        { error: "File untuk produk ini belum tersedia! Hubungi Admin." },
        { status: 400 },
      );
    }

    // Nominal 0/negatif akan ditolak Midtrans dan membuat order menggantung.
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Harga produk tidak valid. Hubungi Admin." },
        { status: 400 },
      );
    }

    // #region Cek Duplikat Pembelian
    // Memakai Clerk user ID, bukan email, supaya user yang mengganti email tetap
    // dikenali. Hanya status 'success' yang dihitung; expired/failed/canceled
    // masih boleh dibeli ulang.
    const existingOrder = await sql`
      SELECT order_id
      FROM orders
      WHERE user_id = ${user.id} AND product_id = ${productId} AND status = 'success'
      LIMIT 1
    `;

    if (existingOrder.length > 0) {
      return NextResponse.json(
        {
          error: "Produk ini sudah Anda beli sebelumnya.",
          alreadyPurchased: true,
          orderId: existingOrder[0].order_id,
          message:
            "Anda sudah memiliki produk ini. Silakan cek halaman 'Pesanan Saya' untuk mengunduh file.",
        },
        { status: 409 },
      );
    }
    // #endregion

    const customer = { firstName: user.firstName, email: userEmail };

    // #region Lanjutkan Order Pending
    // Maksimal satu order pending per produk. Token Snap diminta ulang supaya
    // user tidak terjebak dengan token yang sudah kedaluwarsa.
    const pendingRows = (await sql`
      SELECT order_id, amount, snap_token
      FROM orders
      WHERE user_id = ${user.id} AND product_id = ${productId} AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `) as PendingOrderRow[];

    if (pendingRows.length > 0) {
      const pending = pendingRows[0];

      const ensured = await ensureSnapTokenForOrder({
        orderId: pending.order_id,
        grossAmount: pending.amount,
        item: { id: productId, name: product.title, price: pending.amount },
        customer,
        fallbackToken: pending.snap_token,
      });

      if (ensured.ok) {
        return NextResponse.json({
          token: ensured.token,
          orderId: pending.order_id,
          reused: true,
        });
      }

      if (ensured.reason === "already-paid") {
        return NextResponse.json(
          {
            error: "Produk ini sudah Anda beli sebelumnya.",
            alreadyPurchased: true,
            orderId: pending.order_id,
          },
          { status: 409 },
        );
      }

      if (ensured.reason === "error") {
        return NextResponse.json({ error: ensured.message }, { status: 502 });
      }

      // reason "expired": order lama sudah tidak aktif, buat order baru di bawah.
    }
    // #endregion

    // Simpan order lebih dulu, baru minta token. Kalau token gagal dibuat,
    // baris order dihapus lagi sehingga tidak ada transaksi Midtrans tanpa order.
    const created = await createOrderWithSnapToken({
      userId: user.id,
      email: userEmail,
      firstName: user.firstName,
      productId,
      item: { id: productId, name: product.title, price },
    });

    if (!created.ok) {
      return NextResponse.json({ error: created.message }, { status: 502 });
    }

    return NextResponse.json({ token: created.token, orderId: created.orderId });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
