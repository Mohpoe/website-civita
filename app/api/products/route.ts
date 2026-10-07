import { sql } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Pastikan selalu mengambil data terbaru, tidak di-cache oleh Next.js
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mengambil semua produk yang aktif dari database, urutkan berdasarkan yang terbaru
    const rows = await sql`
      SELECT id, title, short_desc, long_desc, price, category, features, image_url
      FROM products
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}