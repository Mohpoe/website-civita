import { sql } from "@/lib/utils";
import { Category } from "@/types/global";

// #region 2. GET CATEGORIES
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await sql`
      SELECT * FROM categories ORDER BY name ASC
    `;
    return data as Category[];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
}
// #endregion 2. GET CATEGORIES