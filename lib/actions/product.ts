"use server";

import { ROUTES } from "@/lib/constants";
import { sql } from "@/lib/utils";
import { productSchema } from "@/lib/zod-schemas";
import { Category, Order, Product } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

// #region 1. GET PRODUCTS
export async function getProducts(isActive = false): Promise<Product[]> {
  try {
    const data = isActive
      ? await sql`
        SELECT
          p.*,
          c.name AS category_name, c.slug AS category_slug, c.description AS category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
      `
      : await sql`
        SELECT
          p.*,
          c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.description AS category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      price: row.price,
      features: row.features,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      file_url: row.file_url,
      category_id: row.category_id,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
      } : null
    })) as Product[];
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
    if (!userId) {
      const data = await sql`
        SELECT
          o.*,
          p.title AS product_title,
          p.short_desc AS product_short_desc,
          p.long_desc AS product_long_desc,
          p.price AS product_price,
          p.features AS product_features,
          p.image_url AS product_image_url,
          p.is_active AS product_is_active,
          p.created_at AS product_created_at,
          p.file_url AS product_file_url,
          p.category_id AS product_category_id,
          c.name AS category_name,
          c.slug AS category_slug,
          c.description AS category_description
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY o.created_at DESC
      `;

      return data.map((row: any) => ({
        order_id: row.order_id,
        user_id: row.user_id,
        product_name: row.product_name,
        amount: row.amount,
        status: row.status,
        snap_token: row.snap_token,
        download_url: row.download_url,
        created_at: row.created_at,
        product_id: row.product_id,

        product: row.product_id ? {
          id: row.product_id,
          title: row.title,
          short_desc: row.short_desc,
          long_desc: row.long_desc,
          price: row.price,
          features: row.features,
          image_url: row.image_url,
          is_active: row.is_active,
          created_at: row.created_at,
          file_url: row.file_url,
          category_id: row.category_id,

          category: row.category_id ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
          } : null,
        } : null,
      })) as Order[];
    } else {
      const data = await sql`
        SELECT
          o.*,
          p.title AS product_title,
          p.short_desc AS product_short_desc,
          p.long_desc AS product_long_desc,
          p.price AS product_price,
          p.features AS product_features,
          p.image_url AS product_image_url,
          p.is_active AS product_is_active,
          p.category_id AS product_category_id
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE o.user_id = ${userId}
        ORDER BY o.created_at DESC
      `;

      return data.map((row: any) => ({
        order_id: row.order_id,
        user_id: row.user_id,
        product_name: row.product_name,
        amount: row.amount,
        status: row.status,
        snap_token: row.snap_token,
        download_url: row.download_url,
        created_at: row.created_at,
        product_id: row.product_id,

        product: row.product_id ? {
          title: row.title,
          short_desc: row.short_desc,
          long_desc: row.long_desc,
          price: row.price,
          features: row.features,
          image_url: row.image_url,
          is_active: row.is_active,
          category_id: row.category_id,

          category: row.category_id ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
          } : null,
        } : null,
      })) as Order[];
    }
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
  if (!user || user.publicMetadata.role !== "admin") return { success: false, message: "Akses tidak valid, silakan login!" };

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