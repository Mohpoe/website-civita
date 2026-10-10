import { sql } from "@/lib/utils";
import { NextResponse } from "next/server";

// Pastikan selalu mengambil data terbaru, tidak di-cache oleh Next.js
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Menggunakan LEFT JOIN agar produk tetap tampil meskipun kategorinya kosong (null)
    // Menggunakan json_build_object untuk membungkus data kategori menjadi satu objek (nested)
    const rows = await sql`
      SELECT
        p.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug
        ) as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
    `;

    // Opsional: Membersihkan object category jika category_id-nya null
    // (Karena json_build_object akan mengembalikan objek dengan value null jika kategori tidak ada)
    const formattedRows = rows.map((row: any) => ({
      ...row,
      category: row.category_id ? row.category : null
    }));

    return NextResponse.json(formattedRows);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}