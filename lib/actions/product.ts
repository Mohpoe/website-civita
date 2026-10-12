"use server";

import { ROUTES } from "@/lib/constants";
import { sql } from "@/lib/utils";
import { productSchema } from "@/lib/zod-schemas";
import { Category, Order, Product } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { del, put, putImage } from "@vercel/blob";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { success } from "zod";

// #region 1. GET PRODUCTS
export async function getProducts(isActive = false): Promise<Product[]> {
  try {
    const data = isActive
      ? await sql`
        SELECT
          p.*,
          CASE
            WHEN c.id IS NOT NULL THEN
              to_jsonb(c.*)
            ELSE null
          END as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
      `
      : await sql`
        SELECT
          p.*,
          CASE
            WHEN c.id IS NOT NULL THEN
              to_jsonb(c.*)
            ELSE null
          END as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `;

    return data as Product[];
  } catch (error) {
    console.error("Kesalahan mengambil data produk:", error);
    return [];
  }
}
// #endregion 1. GET PRODUCTS

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

// #region 3. GET ORDERS
export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const data = !userId
      ? await sql`
          SELECT
            o.*,
            CASE
              WHEN p.id IS NOT NULL THEN
                to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
              ELSE null
            END as product
          FROM orders o
          LEFT JOIN products p ON o.product_id = p.id
          LEFT JOIN categories c ON p.category_id = c.id
          ORDER BY o.created_at DESC
      `
      : await sql`
        SELECT
          o.*,
          -- Jika product_id ada, gabungkan data produk dengan data kategori yang di-convert ke JSON
          CASE
            WHEN p.id IS NOT NULL THEN
              to_jsonb(p.*) || jsonb_build_object('category', CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE null END)
            ELSE null
          END as product
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE o.user_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    return data as Order[];
  } catch (error) {
    console.error("Gagal mengambil order:", error);
    return [];
  }
}
// #endregion 3. GET ORDERS

// #region 4. CREATE/UPDATE PRODUCT
export async function upsertProductAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") return { success: false, message: "Akses tidak valid!" };

  const id = formData.get("id") as string | null;

  // Format fitur (dari Textarea yg dipisah enter) menjadi array JSON
  const featuresRaw = formData.get("features") as string;
  const featuresArray = featuresRaw
    ? featuresRaw.split("\n").map((f) => f.trim()).filter((f) => f !== "")
    : [];

  // #region THUMBNAIL HANDLER
  const imageFile = formData.get("imageFile") as File | null;
  const oldImageUrl = formData.get("oldImageUrl") as string | null;
  let finalImageUrl = oldImageUrl || "";

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 4 * 1024 * 1024) return { success: false, message: "Ukuran gambar melebihi 4MB!" };
    try {
      if (oldImageUrl) await del(oldImageUrl, {
        storeId: process.env.PUBLIK_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN
      });
      const blob = await putImage(`thumbnails/${imageFile.name}`, imageFile, {
        access: "public",
        optimizeImage: { width: 500 },
        addRandomSuffix: true,
        storeId: process.env.PUBLIK_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      });
      finalImageUrl = blob.url;
    } catch (error) {
      console.error("Gagal mengelola file di Blob:", error);
      return { success: false, message: "Gagal mengunggah gambar thumbnail." };
    }
  }
  // #endregion THUMBNAIL HANDLER

  // #region FILE HANDLER
  const productFile = formData.get("productFile") as File | null;
  const oldFileUrl = formData.get("oldFileUrl") as string | null;
  let finalFileUrl = oldFileUrl || "";

  if (productFile && productFile.size > 0) {
    try {
      if (oldFileUrl) await del(oldFileUrl, {
        storeId: process.env.PRIVATE_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      });
      const fileBlob = await put(`products/${productFile.name}`, productFile, {
        access: "private",
        addRandomSuffix: true,
        storeId: process.env.PRIVATE_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      });
      finalFileUrl = fileBlob.url;
    } catch (error) {
      console.error("Gagal upload file produk:", error);
      return { success: false, message: "Gagal mengunggah file produk!" };
    }
  }
  // #endregion FILE HANDLER

  const rawData = {
    title: formData.get("title"),
    price: formData.get("price"),
    isActive: formData.get("isActive") === "on",
    categoryId: formData.get("category"),
    shortDesc: formData.get("shortDesc"),
    longDesc: formData.get("longDesc"),
    // imageUrl: formData.get("imageUrl"),
    imageUrl: finalImageUrl,
    // fileUrl: formData.get("fileUrl"),
    fileUrl: finalFileUrl,
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
      const newId = `prod_${randomUUID().substring(0, 8)}`;
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

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.INVENTORY);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);
    return { success: true, message: "Data produk berhasil disimpan!" };
  } catch (error: any) {
    console.error("Error upserting product:", error);
    return { success: false, message: "Gagal menyimpan produk. Hubungi developer." };
  }
}
// #endregion 4. CREATE/UPDATE PRODUCT

// #region 5. DELETE PRODUCT
export async function deleteProductAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") return { success: false, message: "Akses tidak valid, silakan login!" };

  const id = formData.get("id") as string | null;

  try {
    await sql`DELETE FROM products WHERE id = ${id}`;

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.INVENTORY);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);
    return { success: true, message: "Produk berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Gagal menghapus produk." };
  }
}
// #endregion 5. DELETE PRODUCT