import { sql } from '@/lib/utils';
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
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    // 3. Pengecekan Otorisasi di Database (Kompabilitas Edge via HTTP)
    const rows = await sql`
      SELECT status, download_url, product_name
      FROM orders
      WHERE order_id = ${orderId} AND user_id = ${user.id}
      LIMIT 1
    `;

    // Jika pesanan tidak ada
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    const order = rows[0];

    // Jika pesanan belum lunas
    if (order.status !== 'success') {
      return NextResponse.json({ error: 'Selesaikan pembayaran terlebih dahulu untuk mengunduh.' }, { status: 403 });
    }

    const fileUrl = order.download_url;

    if (!fileUrl) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    }

    // 4. PROSES STREAMING: Ambil file dari Private Blob
    const result = await get(fileUrl, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });

    if (result?.statusCode !== 200) {
      return new NextResponse("Tidak ditemukan", { status: 404 });
    }

    const originalExtension = fileUrl.substring(fileUrl.lastIndexOf('.'));
    const safeProductName = order.product_name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeProductName}${originalExtension}`;

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });

    // try {
    //   const response = await fetch(fileUrl);

    //   if (!response.ok) {
    //     throw new Error('Gagal mengambil file dari storage');
    //   }

    //   // Bersihkan nama file agar sesuai standar
    //   const safeFilename = order.product_name.replace(/[^a-zA-Z0-9]/g, '_') + ".zip";

    //   // MENGGUNAKAN STREAMING (response.body) ALIH-ALIH BUFFER
    //   // File dialirkan layaknya air, sehingga tidak menumpuk di memori server!
    //   return new NextResponse(response.body, {
    //     headers: {
    //       'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
    //       'Content-Disposition': `attachment; filename="${safeFilename}"`,
    //     },
    //   });
    // } catch (fetchError) {
    //   console.error('Error fetching file:', fetchError);
    //   return NextResponse.json({ error: 'Gagal memproses file' }, { status: 500 });
    // }

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}