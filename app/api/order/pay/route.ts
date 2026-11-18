import { getPrimaryEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { ensureSnapTokenForOrder } from "@/lib/midtrans-snap";
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
  title: string | null;
  file_url: string | null;
}

/**
 * Siapkan pembayaran untuk order yang masih pending.
 *
 * Token Snap selalu diminta ulang (token lama otomatis dicabut Midtrans), jadi
 * tombol "Bayar Sekarang" tidak lagi gagal hanya karena token sudah kedaluwarsa.
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
        COALESCE(p.title, ps.title) AS title,
        COALESCE(p.file_url, ps.file_url) AS file_url
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

    if (!ensured.ok) {
      return NextResponse.json(
        { error: ensured.message },
        { status: ensured.reason === "already-paid" ? 409 : 502 },
      );
    }

    return NextResponse.json({
      token: ensured.token,
      orderId: order.order_id,
    });
  } catch (error) {
    console.error("Pay error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
