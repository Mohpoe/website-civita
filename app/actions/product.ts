"use server";

import { ROUTES } from "@/lib/constants";
import { generateProductId } from "@/lib/id-generator";
import { sql } from "@/lib/utils";
import { productSchema } from "@/lib/zod-schemas";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// #region 1. PRODUCT CREATE & UPDATE ACTION
export async function upsertProductAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user) return { success: false, message: "Akses tidak valid, silakan login!" };

  const id = formData.get("id") as string | null;

  // Format fitur (dari Textarea yg dipisah enter) menjadi array JSON
  const featuresRaw = formData.get("features") as string;
  const featuresArray = featuresRaw
    ? featuresRaw.split("\n").map((f) => f.trim()).filter((f) => f !== "")
    : [];

  const rawData = {
    title: formData.get("title"),
    price: formData.get("price"),
    isActive: formData.get("isActive") === "on",
    categoryId: formData.get("category"),
    shortDesc: formData.get("shortDesc"),
    longDesc: formData.get("longDesc"),
    imageUrl: formData.get("imageUrl"),
    fileUrl: formData.get("fileUrl"),
    features: featuresArray,
  };

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    const errorMessages = validated.error.issues.map(err => err.message).join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  const { title, price, isActive, categoryId, shortDesc, longDesc, imageUrl, fileUrl, features } = validated.data;
  const featuresJson = JSON.stringify(features);

  try {
    if (id) {
      // PROSES UPDATE
      await sql`
        UPDATE products
        SET title = ${title},
            price = ${price},
            is_active = ${isActive},
            category_id = ${categoryId},
            short_desc = ${shortDesc},
            long_desc = ${longDesc},
            features = ${featuresJson}::jsonb,
            image_url = ${imageUrl},
            file_url = ${fileUrl}
        WHERE id = ${id}
      `;
    } else {
      // PROSES INSERT BARU
      const newId = generateProductId();
      await sql`
        INSERT INTO products (
          id, title, price, is_active, category_id,
          short_desc, long_desc, features, image_url, file_url
        ) VALUES (
          ${newId}, ${title}, ${price}, ${isActive}, ${categoryId},
          ${shortDesc}, ${longDesc}, ${featuresJson}::jsonb, ${imageUrl}, ${fileUrl}
        )
      `;
    }

    revalidatePath(ROUTES.DASHBOARD.ADMIN);
    return { success: true, message: "Data produk berhasil disimpan!" };
  } catch (error: any) {
    console.error("Error upserting product:", error);
    return { success: false, message: "Gagal menyimpan produk. Hubungi developer." };
  }
}
// #endregion 1. PRODUCT CREATE & UPDATE ACTION

// #region 2. PRODUCT DELETE ACTION
export async function deleteProductAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user) return { success: false, message: "Akses tidak valid, silakan login!" };

  const id = formData.get("id") as string | null;

  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    return { success: true, message: "Produk berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Gagal menghapus produk." };
  }
}
// #endregion 2. PRODUCT DELETE ACTION