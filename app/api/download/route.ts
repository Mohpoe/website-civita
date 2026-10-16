import { sql } from '@/lib/utils';
import { Order } from '@/types/global';
import { currentUser } from '@clerk/nextjs/server';
import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

// PENTING: Pindahkan API ini ke Edge Runtime untuk membuka batasan memori (Bebas limit 4.5MB)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Ambil ID Pesanan dari URL
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 2. Keamanan: Pastikan user sudah login
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. Pengecekan Otorisasi di Database
    const rows = await sql`
      SELECT o.status, CASE WHEN p.id IS NOT NULL THEN jsonb_build_object('title', p.title, 'file_url', p.file_url) ELSE null END as product
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.order_id = ${orderId} AND o.user_id = ${user.id}
      LIMIT 1
    `;

    // Jika pesanan tidak ada
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    const order = rows[0] as Order;

    // Jika pesanan belum lunas
    if (order.status !== 'success') {
      return NextResponse.json({ error: 'Selesaikan pembayaran terlebih dahulu untuk mengunduh.' }, { status: 403 });
    }

    const fileUrl = order.product?.file_url;

    if (!fileUrl) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    }

    // 4. PROSES STREAMING: Ambil file dari Private Blob
    const result = await get(fileUrl, {
      access: "private",
      storeId: process.env.PRIVATE_BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN
    });

    if (result?.statusCode !== 200) {
      return new NextResponse("File tidak ditemukan di penyimpanan server", { status: 404 });
    }

    const originalExtension = fileUrl.substring(fileUrl.lastIndexOf('.'));
    const rawTitle = order.product?.title || "Produk_Digital_CIVITA";
    const safeProductName = rawTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeProductName}${originalExtension}`;

    return new NextResponse(result.stream as any, {
      headers: {
        // [PERBAIKAN FATAL]: Gunakan result.contentType, dan beri nilai fallback yang aman
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",

        // [TAMBAHAN UX & PERFORMA]: Header resmi anjuran Vercel untuk Private Blob
        "Cache-Control": "private, no-cache",
        "ETag": result.headers.get("etag") || "",
      },
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}