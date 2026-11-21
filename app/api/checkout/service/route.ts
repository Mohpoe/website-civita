import { getPrimaryEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { createSnapToken } from "@/lib/midtrans-snap";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServiceById } from "@/lib/service-catalog";
import { generateServiceOrderId } from "@/lib/service-access";
import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60; // detik
const MAX_CHECKOUT_PER_WINDOW = 6; // per user per menit

function isPrivateBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

interface PendingServiceOrderRow {
  order_id: string;
  amount: number;
  snap_token: string | null;
}

/**
 * Buat pesanan jasa dan token Snap.
 *
 * Order disimpan lebih dulu; kalau Midtrans gagal, baris dihapus lagi supaya
 * tidak ada pesanan menggantung tanpa kemungkinan dibayar.
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
      `checkout-service:ratelimit:${user.id}`,
      MAX_CHECKOUT_PER_WINDOW,
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi sebentar lagi." },
        { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW) } },
      );
    }

    const body = await req.json().catch(() => null);
    const serviceId = typeof body?.serviceId === "string" ? body.serviceId : "";
    const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, 5000) : "";
    const requestedLanguage = typeof body?.language === "string" ? body.language : "";
    const sourceFileUrl = typeof body?.sourceFileUrl === "string" ? body.sourceFileUrl : "";
    const sourceFileName = typeof body?.sourceFileName === "string"
      ? body.sourceFileName.trim().slice(0, 200)
      : "";

    if (!serviceId) {
      return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 400 });
    }
    if (brief.length < 10) {
      return NextResponse.json(
        { error: "Ceritakan kebutuhanmu minimal 10 karakter agar admin bisa mengerjakan dengan tepat." },
        { status: 400 },
      );
    }
    if (sourceFileUrl && !isPrivateBlobUrl(sourceFileUrl)) {
      return NextResponse.json({ error: "Berkas lampiran tidak valid." }, { status: 400 });
    }

    const service = await getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Layanan tidak ditemukan atau sedang tidak tersedia." },
        { status: 404 },
      );
    }

    const price = Number(service.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Harga layanan belum diatur. Hubungi admin." },
        { status: 400 },
      );
    }

    const language = service.languages.includes(requestedLanguage)
      ? requestedLanguage
      : service.languages[0] ?? "id";

    const customer = { firstName: user.firstName, email: userEmail };

    // #region Lanjutkan pesanan pending
    // Satu pesanan pending per layanan. Token diminta ulang agar klien tidak
    // terjebak dengan token Snap yang sudah kedaluwarsa.
    const pendingRows = (await sql`
      SELECT order_id, amount, snap_token
      FROM service_orders
      WHERE user_id = ${user.id} AND service_id = ${service.id} AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `) as PendingServiceOrderRow[];

    if (pendingRows.length > 0) {
      const pending = pendingRows[0];
      const ensured = await createSnapToken({
        orderId: pending.order_id,
        grossAmount: Number(pending.amount),
        item: { id: service.id, name: service.name, price: Number(pending.amount) },
        customer,
      });

      if (ensured.ok) {
        await sql`
          UPDATE service_orders
          SET snap_token = ${ensured.token}, brief = ${brief},
              language = ${language},
              source_file_url = ${sourceFileUrl || null},
              source_file_name = ${sourceFileName || null},
              updated_at = now()
          WHERE order_id = ${pending.order_id}
        `;

        return NextResponse.json({
          token: ensured.token,
          orderId: pending.order_id,
          reused: true,
        });
      }
      // Token gagal dibuat ulang (mis. order Midtrans sudah tidak aktif);
      // lanjut membuat pesanan baru di bawah.
    }
    // #endregion

    const orderId = generateServiceOrderId();

    await sql`
      INSERT INTO service_orders (
        order_id, user_id, email, service_id, service_name, service_slug,
        language, amount, status, brief, source_file_url, source_file_name,
        snap_token
      )
      VALUES (
        ${orderId}, ${user.id}, ${userEmail}, ${service.id}, ${service.name}, ${service.slug},
        ${language}, ${price}, 'pending', ${brief}, ${sourceFileUrl || null},
        ${sourceFileName || null}, NULL
      )
    `;

    const created = await createSnapToken({
      orderId,
      grossAmount: price,
      item: { id: service.id, name: service.name, price },
      customer,
    });

    if (!created.ok) {
      await sql`DELETE FROM service_orders WHERE order_id = ${orderId}`;
      return NextResponse.json({ error: created.message }, { status: 502 });
    }

    await sql`
      UPDATE service_orders SET snap_token = ${created.token} WHERE order_id = ${orderId}
    `;

    return NextResponse.json({ token: created.token, orderId });
  } catch (error) {
    console.error("Checkout layanan error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
