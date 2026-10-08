import { sql } from '@/lib/utils';
import { auth, currentUser } from '@clerk/nextjs/server';
// Sesuaikan import di bawah jika pakai neon driver: import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Pastikan Next.js tidak melakukan caching pada rute ini (harus selalu real-time)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await auth.protect();

  try {
    // 1. Cek User yang sedang login
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    // 2. Ambil data pesanan milik user ini dari Database Neon
    // Kita urutkan dari yang paling baru (created_at DESC)
    const rows = await sql`
      SELECT
        o.order_id,
        o.product_id,
        o.product_name,
        o.amount,
        o.status,
        o.snap_token,
        o.created_at,
        p.image_url
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ${user.id}
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}