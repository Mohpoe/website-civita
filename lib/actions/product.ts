"use server";

import { ROUTES } from "@/lib/constants";
import { sql } from "@/lib/utils";
import { productSchema } from "@/lib/zod-schemas";
import { Product } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { del, putImage } from "@vercel/blob";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const allowedRoles = ["admin", "superadmin"];

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
// #endregion

// #region 2. CREATE/UPDATE PRODUCT
export async function upsertProductAction(state: any, formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return { success: false, message: "Akses tidak valid!" };

  const id = formData.get("id") as string | null;

  // Format fitur (dari Textarea yg dipisah enter) menjadi array JSON
  const featuresRaw = formData.get("features") as string;
  const featuresArray = featuresRaw
    ? featuresRaw.split("\n").map((f) => f.trim()).filter((f) => f !== "")
    : [];

  // #region - THUMBNAIL HANDLER
  const imageFile = formData.get("imageFile") as File | null;
  const oldImageUrl = formData.get("oldImageUrl") as string | null;
  let finalImageUrl = oldImageUrl || "";

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 4 * 1024 * 1024) return { success: false, message: "Ukuran gambar melebihi 4MB!" };
    try {
      if (oldImageUrl) await del(oldImageUrl, {
        storeId: process.env.PUBLIC_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN
      });
      const blob = await putImage(`thumbnails/${imageFile.name}`, imageFile, {
        access: "public",
        optimizeImage: { width: 500 },
        addRandomSuffix: true,
        storeId: process.env.PUBLIC_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      });
      finalImageUrl = blob.url;
    } catch (error) {
      console.error("Gagal mengelola file di Blob:", error);
      return { success: false, message: "Gagal mengunggah gambar thumbnail." };
    }
  }
  // #endregion

  // #region - FILE HANDLER
  // const productFile = formData.get("productFile") as File | null;
  const oldFileUrl = formData.get("oldFileUrl") as string | null;
  const finalFileUrl = formData.get("finalFileUrl") as string;

  if (oldFileUrl && oldFileUrl !== finalFileUrl) {
    try {
      await del(oldFileUrl, {
        storeId: process.env.PRIVATE_BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
      });
      console.log("File lama berhasil dihapus untuk diganti baru.");
    } catch (error) {
      console.error("Gagal menghapus file digital lama:", error);
    }
  }

  // if (productFile && productFile.size > 0) {
  //   try {
  //     if (oldFileUrl) await del(oldFileUrl, {
  //       storeId: process.env.PRIVATE_BLOB_STORE_ID,
  //       oidcToken: process.env.VERCEL_OIDC_TOKEN,
  //     });
  //     const fileBlob = await put(`products/${productFile.name}`, productFile, {
  //       access: "private",
  //       addRandomSuffix: true,
  //       storeId: process.env.PRIVATE_BLOB_STORE_ID,
  //       oidcToken: process.env.VERCEL_OIDC_TOKEN,
  //     });
  //     finalFileUrl = fileBlob.url;
  //   } catch (error) {
  //     console.error("Gagal upload file produk:", error);
  //     return { success: false, message: "Gagal mengunggah file produk!" };
  //   }
  // }
  // #endregion

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
// #endregion

// #region 3. DELETE PRODUCT
export async function deleteProductAction(formData: FormData) {
  await auth.protect();
  const user = await currentUser();
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return { success: false, message: "Akses tidak valid, silakan login!" };

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, message: "ID Produk tidak ditemukan!" };

  try {
    const rows = await sql`SELECT image_url, file_url FROM products WHERE id = ${id}`;
    if (rows.length === 0) return { success: false, message: "Produk tidak ditemukan di database." };

    const product = rows[0];

    if (product.image_url) {
      try {
        await del(product.image_url, {
          storeId: process.env.PUBLIC_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN
        });
      } catch (e) {
        console.error("Gagal menghapus thumbnail:", e);
      }
    }

    if (product.file_url) {
      try {
        await del(product.file_url, {
          storeId: process.env.PRIVATE_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });
      } catch (e) {
        console.error("Gagal menghapus file digital:", e);
      }
    }

    await sql`DELETE FROM products WHERE id = ${id}`;

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.INVENTORY);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);
    return { success: true, message: "Produk dan file berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Gagal menghapus produk." };
  }
}
// #endregion

// #region 4. CLEANUP ORPHANED FILE
// Fungsi ini dipanggil jika admin membatalkan form setelah terlanjur mengunggah file
export async function deleteBlobFileAction(url: string) {
  await auth.protect();
  const user = await currentUser();
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return { success: false };

  try {
    await del(url, {
      storeId: process.env.PRIVATE_BLOB_STORE_ID, // Ganti ke PUBLIC_BLOB_STORE_ID jika itu thumbnail
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    });
    console.log("Orphaned file berhasil dihapus (Cleanup):", url);
    return { success: true };
  } catch (error) {
    console.error("Gagal melakukan cleanup file:", error);
    return { success: false };
  }
}
// #endregion