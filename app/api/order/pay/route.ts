import { getPrimaryEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { ensureSnapTokenForOrder } from "@/lib/midtrans-snap";
import { createOrderWithSnapToken } from "@/lib/order-create";
import { checkRateLimit } from "@/lib/rate-limit";
import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Order ID dibuat server sendiri (ORD-CIV-...), jadi formatnya bisa dikunci. */
const ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

const RATE_LIMIT_WINDOW = 60; // detik
const MAX_PAY_PER_WINDOW = 10; // per user per menit

interface PayOrderRow {
  order_id: string;
  amount: number;
  status: string;
  snap_token: string | null;
  product_id: string | null;
  product_snapshot_id: string | null;
  /** `null` kalau produk aslinya sudah dihapus dari tabel products. */
  live_product_id: string | null;
  product_is_active: boolean | null;
  title: string | null;
  file_url: string | null;
  current_price: number | null;
}

/**
 * Siapkan pembayaran untuk order yang masih pending.
 *
 * Token Snap selalu diminta ulang (token lama otomatis dicabut Midtrans), jadi
 * tombol "Bayar Sekarang" tidak lagi gagal hanya karena token sudah kedaluwarsa.
 *
 * Kalau Midtrans menyatakan order lama sudah tidak aktif (kedaluwarsa,
 * dibatalkan, atau gagal), order baru dibuat otomatis dengan harga produk saat
 * ini supaya user tidak perlu kembali ke halaman produk.
 */
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
      `pay:ratelimit:${user.id}`,
      MAX_PAY_PER_WINDOW,
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan pembayaran. Silakan coba lagi sebentar lagi.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(RATE_LIMIT_WINDOW) },
        },
      );
    }

    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!ORDER_ID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: "Order ID tidak valid!" }, { status: 400 });
    }

    const rows = (await sql`
      SELECT
        o.order_id,
        o.amount,
        o.status,
        o.snap_token,
        o.product_id,
        o.product_snapshot_id,
        p.id AS live_product_id,
        p.is_active AS product_is_active,
        COALESCE(p.title, ps.title) AS title,
        COALESCE(p.file_url, ps.file_url) AS file_url,
        COALESCE(p.price, ps.price) AS current_price
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN product_snapshots ps ON o.product_snapshot_id = ps.id
      WHERE o.order_id = ${orderId} AND o.user_id = ${user.id}
      LIMIT 1
    `) as PayOrderRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau bukan milik Anda." },
        { status: 404 },
      );
    }

    const order = rows[0];

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Pesanan berstatus "${order.status}" tidak bisa dibayar.` },
        { status: 409 },
      );
    }

    if (!order.file_url) {
      return NextResponse.json(
        { error: "File produk untuk pesanan ini tidak tersedia. Hubungi Admin." },
        { status: 409 },
      );
    }

    const amount = Number(order.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal pesanan tidak valid. Hubungi Admin." },
        { status: 409 },
      );
    }

    const ensured = await ensureSnapTokenForOrder({
      orderId: order.order_id,
      grossAmount: amount,
      item: {
        id: order.product_id || order.product_snapshot_id || order.order_id,
        name: order.title || "Produk Digital",
        price: amount,
      },
      customer: { firstName: user.firstName, email: userEmail },
      fallbackToken: order.snap_token,
    });

    if (ensured.ok) {
      return NextResponse.json({
        token: ensured.token,
        orderId: order.order_id,
      });
    }

    if (ensured.reason === "already-paid") {
      return NextResponse.json(
        {
          error: "Produk ini sudah Anda beli sebelumnya.",
          alreadyPurchased: true,
          orderId: order.order_id,
        },
        { status: 409 },
      );
    }

    if (ensured.reason === "error") {
      return NextResponse.json({ error: ensured.message }, { status: 502 });
    }

    // #region Order Lama Tidak Aktif → Buat Order Baru
    // Midtrans menolak `order_id` yang sudah kedaluwarsa/dibatalkan. Daripada
    // menyuruh user kembali ke halaman produk, buatkan order baru di sini.
    if (!order.live_product_id && !order.product_snapshot_id) {
      return NextResponse.json(
        { error: "Produk untuk pesanan ini tidak ditemukan. Hubungi Admin." },
        { status: 409 },
      );
    }

    if (order.live_product_id && order.product_is_active === false) {
      return NextResponse.json(
        { error: "Produk ini sudah tidak tersedia untuk dibeli." },
        { status: 409 },
      );
    }

    // Harga mengikuti produk saat ini, bukan harga saat order lama dibuat.
    const currentPrice = Number(order.current_price ?? order.amount);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      return NextResponse.json(
        { error: "Harga produk tidak valid. Hubungi Admin." },
        { status: 409 },
      );
    }

    // Jangan buat order baru kalau ternyata user sudah punya order sukses
    // (mis. order lama kedaluwarsa padahal produknya sudah dibeli).
    const ownedOrders = order.live_product_id
      ? ((await sql`
          SELECT order_id
          FROM orders
          WHERE user_id = ${user.id}
            AND status = 'success'
            AND product_id = ${order.live_product_id}
          LIMIT 1
        `) as { order_id: string }[])
      : ((await sql`
          SELECT order_id
          FROM orders
          WHERE user_id = ${user.id}
            AND status = 'success'
            AND product_snapshot_id = ${order.product_snapshot_id}
          LIMIT 1
        `) as { order_id: string }[]);

    if (ownedOrders.length > 0) {
      return NextResponse.json(
        {
          error: "Produk ini sudah Anda beli sebelumnya.",
          alreadyPurchased: true,
          orderId: ownedOrders[0].order_id,
        },
        { status: 409 },
      );
    }

    const created = await createOrderWithSnapToken({
      userId: user.id,
      email: userEmail,
      firstName: user.firstName,
      productId: order.live_product_id,
      productSnapshotId: order.product_snapshot_id,
      item: {
        id: order.live_product_id || order.product_snapshot_id || order.order_id,
        name: order.title || "Produk Digital",
        price: currentPrice,
      },
    });

    if (!created.ok) {
      return NextResponse.json({ error: created.message }, { status: 502 });
    }

    return NextResponse.json({
      token: created.token,
      orderId: created.orderId,
      replacedOrderId: order.order_id,
    });
    // #endregion
  } catch (error) {
    console.error("Pay error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
