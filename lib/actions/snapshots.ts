"use server";

import { copy, del, putImage } from "@vercel/blob";
import { sql } from "@/lib/utils";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants";
import { ProductSnapshot } from "@/types/global";

// #region 1. Get All Snapshots
export async function getSnapshots(): Promise<ProductSnapshot[]> {
  try {
    const data = await sql`
      SELECT
        id,
        original_product_id,
        title,
        short_desc,
        long_desc,
        price,
        image_url,
        file_url,
        created_at,
        deleted_at
      FROM product_snapshots
      ORDER BY deleted_at DESC
    `;
    return data as ProductSnapshot[];
  } catch (error) {
    console.error("Gagal mengambil data snapshot:", error);
    return [];
  }
}
// #endregion

// #region 2. Restore Product Dari Snapshot
export async function restoreSnapshotAction(snapshotId: string) {
  try {
    // 1. Ambil data snapshot
    const snapshotRows = await sql`
      SELECT * FROM product_snapshots WHERE id = ${snapshotId}
    `;
    if (snapshotRows.length === 0) {
      return { success: false, message: "Snapshot tidak ditemukan." };
    }
    const snap = snapshotRows[0];

    // 2. Salin thumbnail kembali ke folder thumbnails (public store)
    let restoredThumbnailUrl = "";
    if (snap.image_url) {
      try {
        const thumbnailFileName = snap.image_url.split("/").pop() || "thumbnail";
        const copied = await copy(snap.image_url, `thumbnails/${thumbnailFileName}`, {
          access: "public",
          addRandomSuffix: true,
          storeId: process.env.PUBLIC_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });
        restoredThumbnailUrl = copied.url;
      } catch (err) {
        console.error("Gagal memulihkan thumbnail:", err);
        return { success: false, message: "Gagal memulihkan file thumbnail." };
      }
    }

    // 3. Salin file download kembali ke folder products (private store)
    let restoredFileUrl = "";
    if (snap.file_url) {
      try {
        const fileName = snap.file_url.split("/").pop() || "file";
        const copied = await copy(snap.file_url, `products/${fileName}`, {
          access: "private",
          addRandomSuffix: true,
          storeId: process.env.PRIVATE_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });
        restoredFileUrl = copied.url;
      } catch (err) {
        console.error("Gagal memulihkan file download:", err);
        // Rollback thumbnail jika sudah tersalin
        if (restoredThumbnailUrl) {
          try { await del(restoredThumbnailUrl, { storeId: process.env.PUBLIC_BLOB_STORE_ID, oidcToken: process.env.VERCEL_OIDC_TOKEN }); } catch {}
        }
        return { success: false, message: "Gagal memulihkan file download." };
      }
    }

    // 4. Hapus file dari folder snapshot
    if (snap.image_url) {
      try { await del(snap.image_url, { storeId: process.env.PUBLIC_BLOB_STORE_ID, oidcToken: process.env.VERCEL_OIDC_TOKEN }); } catch {}
    }
    if (snap.file_url) {
      try { await del(snap.file_url, { storeId: process.env.PRIVATE_BLOB_STORE_ID, oidcToken: process.env.VERCEL_OIDC_TOKEN }); } catch {}
    }

    // 5. Buat baris baru di tabel products (is_active = false / draft)
    const newProductId = `prod_${randomUUID().substring(0, 8)}`;
    await sql`
      INSERT INTO products (
        id, title, price, is_active, category_id,
        short_desc, long_desc, features, image_url, file_url
      ) VALUES (
        ${newProductId}, ${snap.title}, ${snap.price}, false,
        NULL, ${snap.short_desc}, ${snap.long_desc}, '[]'::jsonb,
        ${restoredThumbnailUrl}, ${restoredFileUrl}
      )
    `;

    // 6. Update semua order yang merujuk ke snapshot ini
    await sql`
      UPDATE orders
      SET product_id = ${newProductId}, product_snapshot_id = NULL
      WHERE product_snapshot_id = ${snapshotId}
    `;

    // 7. Hapus baris snapshot (produk sudah pindah kembali ke data utama)
    await sql`DELETE FROM product_snapshots WHERE id = ${snapshotId}`;

    revalidatePath(ROUTES.DASHBOARD.HOME);
    revalidatePath(ROUTES.DASHBOARD.INVENTORY);
    revalidatePath(ROUTES.DASHBOARD.ADMIN);

    return {
      success: true,
      message: "Produk berhasil dipulihkan. Produk kembali sebagai draft (tidak aktif di katalog).",
      productId: newProductId,
    };
  } catch (error) {
    console.error("Gagal memulihkan snapshot:", error);
    return { success: false, message: "Gagal memulihkan produk dari arsip." };
  }
}
// #endregion
