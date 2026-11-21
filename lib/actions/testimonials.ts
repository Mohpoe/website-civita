"use server";

import { ROUTES } from "@/lib/constants";
import { TESTIMONIALS_TAG } from "@/lib/testimonials";
import { sql } from "@/lib/utils";
import type { ActionState } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";

const SUPERADMIN = "superadmin";

function text(formData: FormData, key: string, max: number): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

function isHttpsUrl(value: string): boolean {
  return /^https:\/\/\S+$/i.test(value);
}

/** Pastikan hanya superadmin yang boleh menyentuh testimoni. */
async function requireSuperadmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  await auth.protect();
  const user = await currentUser();

  if (!user || user.publicMetadata.role !== SUPERADMIN) {
    return { ok: false, message: "Hanya superadmin yang dapat mengelola testimoni." };
  }

  return { ok: true, userId: user.id };
}

function revalidateTestimonials() {
  revalidateTag(TESTIMONIALS_TAG, { expire: 0 });
  revalidatePath(ROUTES.ROOT);
  revalidatePath(ROUTES.DASHBOARD.TESTIMONIALS);
}

export async function createTestimonialAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const guard = await requireSuperadmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const imageUrl = text(formData, "imageUrl", 500);
  const altText = text(formData, "altText", 200);
  const rawOrder = Number(text(formData, "sortOrder", 10));

  if (!isHttpsUrl(imageUrl)) {
    return { success: false, message: "Upload gambar terlebih dahulu sebelum menyimpan." };
  }

  try {
    const sortOrder = Number.isFinite(rawOrder) && rawOrder >= 0
      ? Math.floor(rawOrder)
      : await nextSortOrder();

    await sql`
      INSERT INTO testimonials (image_url, alt_text, sort_order, is_active, created_by)
      VALUES (${imageUrl}, ${altText || null}, ${sortOrder}, true, ${guard.userId})
    `;

    revalidateTestimonials();
    return { success: true, message: "Testimoni berhasil ditambahkan." };
  } catch (error) {
    console.error("Gagal menambah testimoni:", error);
    return { success: false, message: "Gagal menambah testimoni. Coba lagi." };
  }
}

export async function updateTestimonialAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const guard = await requireSuperadmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const id = text(formData, "id", 64);
  const imageUrl = text(formData, "imageUrl", 500);
  const altText = text(formData, "altText", 200);
  const rawOrder = Number(text(formData, "sortOrder", 10));

  if (!id) return { success: false, message: "Testimoni tidak ditemukan." };
  if (!isHttpsUrl(imageUrl)) {
    return { success: false, message: "Upload gambar terlebih dahulu sebelum menyimpan." };
  }

  try {
    const previous = (await sql`
      SELECT image_url FROM testimonials WHERE id = ${id} LIMIT 1
    `) as { image_url: string }[];

    if (previous.length === 0) {
      return { success: false, message: "Testimoni tidak ditemukan." };
    }

    const sortOrder = Number.isFinite(rawOrder) && rawOrder >= 0 ? Math.floor(rawOrder) : 0;

    await sql`
      UPDATE testimonials
      SET image_url = ${imageUrl}, alt_text = ${altText || null}, sort_order = ${sortOrder}
      WHERE id = ${id}
    `;

    // Bersihkan gambar lama kalau diganti, supaya blob tidak menumpuk.
    const oldUrl = previous[0].image_url;
    if (oldUrl && oldUrl !== imageUrl) {
      await deleteBlobSafely(oldUrl);
    }

    revalidateTestimonials();
    return { success: true, message: "Testimoni berhasil diperbarui." };
  } catch (error) {
    console.error("Gagal memperbarui testimoni:", error);
    return { success: false, message: "Gagal memperbarui testimoni. Coba lagi." };
  }
}

export async function toggleTestimonialAction(formData: FormData): Promise<ActionState> {
  const guard = await requireSuperadmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const id = text(formData, "id", 64);
  const isActive = formData.get("isActive") === "true";

  if (!id) return { success: false, message: "Testimoni tidak ditemukan." };

  try {
    await sql`UPDATE testimonials SET is_active = ${isActive} WHERE id = ${id}`;
    revalidateTestimonials();
    return {
      success: true,
      message: isActive ? "Testimoni ditampilkan kembali." : "Testimoni disembunyikan dari landing page.",
    };
  } catch (error) {
    console.error("Gagal mengubah status testimoni:", error);
    return { success: false, message: "Gagal mengubah status testimoni." };
  }
}

export async function deleteTestimonialAction(formData: FormData): Promise<ActionState> {
  const guard = await requireSuperadmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const id = text(formData, "id", 64);
  if (!id) return { success: false, message: "Testimoni tidak ditemukan." };

  try {
    const rows = (await sql`
      DELETE FROM testimonials WHERE id = ${id} RETURNING image_url
    `) as { image_url: string }[];

    if (rows.length === 0) {
      return { success: false, message: "Testimoni tidak ditemukan." };
    }

    await deleteBlobSafely(rows[0].image_url);

    revalidateTestimonials();
    return { success: true, message: "Testimoni berhasil dihapus." };
  } catch (error) {
    console.error("Gagal menghapus testimoni:", error);
    return { success: false, message: "Gagal menghapus testimoni." };
  }
}

/** Simpan urutan baru hasil drag-and-drop. */
export async function reorderTestimonialsAction(orderedIds: string[]): Promise<ActionState> {
  const guard = await requireSuperadmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const ids = orderedIds.filter((id) => typeof id === "string" && id.length > 0).slice(0, 200);
  if (ids.length === 0) {
    return { success: false, message: "Tidak ada testimoni yang diurutkan." };
  }

  try {
    for (let index = 0; index < ids.length; index += 1) {
      await sql`UPDATE testimonials SET sort_order = ${index} WHERE id = ${ids[index]}`;
    }

    revalidateTestimonials();
    return { success: true, message: "Urutan testimoni disimpan." };
  } catch (error) {
    console.error("Gagal menyimpan urutan testimoni:", error);
    return { success: false, message: "Gagal menyimpan urutan testimoni." };
  }
}

async function nextSortOrder(): Promise<number> {
  const rows = (await sql`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM testimonials
  `) as { next: number }[];

  return Number(rows[0]?.next ?? 0);
}

/** Hapus file dari PUBLIC_BLOB; kegagalan di sini tidak boleh membatalkan aksi DB. */
async function deleteBlobSafely(url: string) {
  if (!/^https:\/\//i.test(url)) return;

  try {
    await del(url, {
      storeId: process.env.PUBLIC_BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    });
  } catch (error) {
    console.warn("Gagal menghapus blob testimoni:", url, error);
  }
}
