import { getErrorMessage } from "@/lib/errors";
import { MIDTRANS_API_BASE_URL } from "@/lib/midtrans";
import { applyOrderStatus, fetchMidtransStatus } from "@/lib/order-status";
import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Order ID dibuat server sendiri (ORD-CIV-...), jadi formatnya bisa dikunci. */
const ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!ORDER_ID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: "Order ID tidak valid!" }, { status: 400 });
    }

    // 1. Pastikan order ada dan memang milik user yang sedang login.
    //    `user_id` berisi Clerk user ID (lihat app/api/checkout/route.ts).
    const rows = (await sql`
      SELECT status
      FROM orders
      WHERE order_id = ${orderId} AND user_id = ${user.id}
      LIMIT 1
    `) as { status: string }[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau bukan milik Anda." },
        { status: 404 },
      );
    }

    // 2. Hanya order yang masih menunggu pembayaran yang boleh dibatalkan.
    //    `challenge` sengaja ditolak karena masih menunggu keputusan bank.
    if (rows[0].status !== "pending") {
      return NextResponse.json(
        {
          error: `Pesanan berstatus "${rows[0].status}" tidak bisa dibatalkan.`,
        },
        { status: 409 },
      );
    }

    // 3. Batalkan transaksi di Midtrans.
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");

    // Endpoint mengikuti MIDTRANS_ENV: sandbox kecuali di-set "production".
    const response = await fetch(
      `${MIDTRANS_API_BASE_URL}/v2/${encodeURIComponent(orderId)}/cancel`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Basic ${encodedKey}`,
        },
      },
    );

    const data = await response.json().catch(() => ({}));

    // 4. Transaksi belum pernah terbentuk di Midtrans (user menutup popup
    //    sebelum memilih metode bayar). Tidak ada yang perlu dibatalkan di
    //    sana, jadi order lokal boleh ditutup.
    if (response.status === 404) {
      await applyOrderStatus(orderId, "canceled");
      return NextResponse.json({
        success: true,
        message: "Pesanan berhasil dibatalkan.",
      });
    }

    if (!response.ok) {
      // 412 = transaksi sudah final (settlement/capture) sehingga Midtrans
      // menolak pembatalan. JANGAN tandai canceled; sinkronkan status aslinya.
      if (data.status_code === "412" || response.status === 412) {
        const midtransStatus = await fetchMidtransStatus(orderId);
        if (midtransStatus.found) {
          await applyOrderStatus(orderId, midtransStatus.status);
        }

        return NextResponse.json(
          {
            error:
              "Pesanan ini sudah dibayar atau tidak bisa dibatalkan lagi. Muat ulang halaman untuk melihat status terbaru.",
          },
          { status: 409 },
        );
      }

      throw new Error(
        data.status_message || "Gagal membatalkan pesanan dari Midtrans",
      );
    }

    await applyOrderStatus(orderId, "canceled");

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dibatalkan.",
    });
  } catch (error) {
    console.error("Cancel Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
