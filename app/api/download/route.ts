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

    // 4. URL Asli dari Vercel Blob
    const fileUrl = order.download_url;

    if (!fileUrl) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    }

    // 5. PROSES MASKING: Download file dari Blob via Server, bukan redirect
    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error('Gagal mengambil file dari storage');
      }

      // Ubah data menjadi Buffer/Blob
      const fileBuffer = await response.arrayBuffer();

      // Ekstrak nama file dari URL atau gunakan nama produk (misal: "Template_CV_ATS.zip")
      // Menghapus spasi dan menggantinya dengan underscore agar rapi
      const safeFilename = order.product_name.replace(/[^a-zA-Z0-9]/g, '_') + ".zip";

      // Kirim file langsung ke browser tanpa mengungkap URL aslinya
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
        },
      });

    } catch (fetchError) {
      console.error('Error fetching file:', fetchError);
      return NextResponse.json({ error: 'Gagal memproses file' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}