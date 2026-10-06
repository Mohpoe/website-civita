import { sql } from '@/lib/utils';
import { auth, currentUser } from '@clerk/nextjs/server';
// Sesuaikan import di bawah jika pakai neon driver: import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Ambil ID Pesanan dari URL (contoh: /api/download?orderId=ORD-123)
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 2. Keamanan: Pastikan user sudah login
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    // 3. Pengecekan Otorisasi di Database
    const rows = await sql`
      SELECT status, download_url
      FROM orders
      WHERE order_id = ${orderId} AND user_id = ${user.id}
      LIMIT 1
    `;

    // Jika pesanan tidak ada atau bukan milik user ini
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    const order = rows[0];

    // Jika pesanan belum lunas (pending/failed)
    if (order.status !== 'success') {
      return NextResponse.json({ error: 'Selesaikan pembayaran terlebih dahulu untuk mengunduh.' }, { status: 403 });
    }

    // 4. Proses Download (Redirect ke File Asli)
    // Di sinilah tempat Anda menaruh link ke Cloud Storage (G-Drive/Vercel Blob/S3)
    // Sebaiknya URL Cloud disimpan di kolom 'download_url' database.
    const fileUrl = order.download_url || 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/apple-touch-icon.png'; // <- GANTI URL INI DENGAN FILE PRODUK ANDA SEBAGAI FALLBACK

    // Alihkan user ke link file tersebut (Browser akan otomatis mendownloadnya)
    return NextResponse.redirect(fileUrl);

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}