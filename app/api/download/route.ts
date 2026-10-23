import { sql } from '@/lib/utils';
import { Order, Product } from '@/types/global';
import { currentUser } from '@clerk/nextjs/server';
import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

// PENTING: Pindahkan API ini ke Edge Runtime untuk membuka batasan memori (Bebas limit 4.5MB)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // 1. Ambil ID Pesanan dari URL
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const productId = searchParams.get("productId");

    // #region Jalur Admin
    if (productId) {
      // Pastikan yang mengakses menggunakan productId murni adalah Admin
      if (user.publicMetadata.role !== "admin" && user.publicMetadata.role !== "superadmin") {
        return new Response("Akses ditolak!", { status: 403 });
      }

      // Ambil file_url dari tabel products
      const rows = await sql`SELECT title, file_url FROM products WHERE id = ${productId}` as Product[];
      if (rows.length === 0 || !rows[0].file_url) {
        return new Response("File produk tidak ditemukan", { status: 404 });
      }

      const originalExtension = new URL(rows[0].file_url).pathname.substring(new URL(rows[0].file_url).pathname.lastIndexOf('.'));
      const rawTitle = rows[0].title || "Produk_Digital_CIVITA";
      const safeProductName = rawTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeProductName}${originalExtension}`;

      // Gunakan SDK @vercel/blob get() untuk akses private blob yang benar
      // (Sama seperti jalur user, menghindari masalah fetch manual dengan Bearer token)
      const result = await get(rows[0].file_url, {
        access: "private",
        storeId: process.env.PRIVATE_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN
      });

      if (result?.statusCode !== 200) {
        return new Response("File tidak ditemukan di penyimpanan server", { status: 404 });
      }

      return new NextResponse(result.stream as any, {
        headers: {
          "Content-Type": result.blob.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, no-cache",
          "ETag": result.headers.get("etag") || "",
        },
      });
    }
    // #endregion

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 3. Pengecekan Otorisasi di Database
    const rows = await sql`
      SELECT o.status,
        CASE
          WHEN p.id IS NOT NULL THEN jsonb_build_object('title', p.title, 'file_url', p.file_url, 'image_url', p.image_url)
          WHEN ps.id IS NOT NULL THEN jsonb_build_object('title', ps.title, 'file_url', ps.file_url, 'image_url', ps.image_url)
          ELSE null
        END as product
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN product_snapshots ps ON o.product_snapshot_id = ps.id
      WHERE o.order_id = ${orderId} AND o.email = ${user.emailAddresses[0].emailAddress}
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

    const originalExtension = new URL(fileUrl).pathname.substring(new URL(fileUrl).pathname.lastIndexOf('.'));
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