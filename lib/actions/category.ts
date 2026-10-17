"use server";

import { ROUTES } from "@/lib/constants";
import { sql } from "@/lib/utils";
import { Category } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const allowedRoles = ["admin", "superadmin"];

// #region 1. GET CATEGORIES
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await sql`
      SELECT
        c.*,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    return data as Category[];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
}
// #endregion

// #region 2. CREATE/UPDATE CATEGORY
export async function upsertCategoryAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return { success: false, message: "Akses tidak valid!" };

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length < 2) {
    return { success: false, message: "Nama kategori minimal 2 karakter!" };
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    if (id) {
      // UPDATE KATEGORI
      await sql`
        UPDATE categories
        SET name = ${name}, slug = ${slug}, description = ${description}
        WHERE id = ${id}
      `;
    } else {
      // INSERT KATEGORI BARU
      const newId = `cat_${randomUUID().substring(0, 8)}`;
      await sql`
        INSERT INTO categories (id, name, slug, description)
        VALUES (${newId}, ${name}, ${slug}, ${description})
      `;
    }

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);

    return { success: true, message: "Kategori berhasil disimpan!" };
  } catch (error: any) {
    console.error("Error upserting category:", error);
    if (error.code === "23505" || error.message?.includes("categories_slug_key")) {
      return { success: false, message: "Gagal: Nama kategori (slug) sudah digunakan!" };
    }

    return { success: false, message: "Gagal menyimpan kategori." };
  }
}
// #endregion

// #region 3. DELETE CATEGORY
export async function deleteCategoryAction(formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return { success: false, message: "Akses tidak valid!" };

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, message: "ID Kategori tidak ditemukan!" };

  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);
    return { success: true, message: "Kategori berhasil dihapus!" };
  } catch (error: any) {
    console.error("Error deleting category:", error);

    // Proteksi Foreign Key: Jika kategori ini sedang dipakai oleh produk
    if (error.message?.includes('foreign key') || error.code === '23503') {
      return { success: false, message: "Gagal: Kategori ini sedang digunakan oleh produk!" };
    }

    return { success: false, message: "Gagal menghapus kategori." };
  }
}
// #endregion