"use server";

import { ROUTES } from "@/lib/constants";
import { normalizeService, SERVICES_TAG, type ServiceRow } from "@/lib/service-catalog";
import { isServiceAccent, SERVICE_ICON_MAP } from "@/lib/service-visuals";
import { slugify } from "@/lib/slug";
import { getServiceAccess } from "@/lib/service-access";
import { sql } from "@/lib/utils";
import type { ActionState, Service, ServiceAttachment, ServiceOrder } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";

const ADMIN_ROLES = ["admin", "superadmin"];
const SUPERADMIN = "superadmin";

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

function text(formData: FormData, key: string, max: number): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

function isHttpsUrl(value: string): boolean {
  return /^https:\/\/\S+$/i.test(value);
}

/** File hasil/sumber harus berasal dari PRIVATE_BLOB, bukan URL sembarang. */
function isPrivateBlobUrl(value: string): boolean {
  if (!isHttpsUrl(value)) return false;

  try {
    const url = new URL(value);
    return url.hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

async function requireRole(roles: string[]): Promise<{ ok: true; userId: string; role: string } | { ok: false }> {
  await auth.protect();
  const user = await currentUser();
  const role = user?.publicMetadata.role as string | undefined;

  if (!user || !role || !roles.includes(role)) {
    return { ok: false };
  }

  return { ok: true, userId: user.id, role };
}

function revalidateServices() {
  revalidateTag(SERVICES_TAG, { expire: 0 });
  revalidatePath(ROUTES.ROOT);
  revalidatePath(ROUTES.SERVICES);
  revalidatePath(`${ROUTES.SERVICES}/[slug]`, "page");
  revalidatePath(ROUTES.DASHBOARD.ORDER_SERVICES);
  revalidatePath(ROUTES.DASHBOARD.ADMIN_SERVICES);
  revalidatePath(ROUTES.DASHBOARD.SERVICE_CATALOG);
}

// #region Katalog layanan
/** Semua layanan (termasuk nonaktif) untuk dashboard superadmin. */
export async function getServices(): Promise<Service[]> {
  const guard = await requireRole([SUPERADMIN]);
  if (!guard.ok) return [];

  try {
    const rows = (await sql`
      SELECT id, slug, name, description, price, prices, icon, accent, tags, languages,
             is_active, sort_order, created_at, updated_at
      FROM services
      ORDER BY sort_order ASC, name ASC
    `) as ServiceRow[];

    return rows.map(normalizeService);
  } catch (error) {
    console.error("Gagal mengambil katalog layanan:", error);
    return [];
  }
}

export async function upsertServiceAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const guard = await requireRole([SUPERADMIN]);
  if (!guard.ok) {
    return { success: false, message: "Hanya superadmin yang dapat mengubah layanan." };
  }

  const existingId = text(formData, "id", 64);
  const name = text(formData, "name", 120);
  const description = text(formData, "description", 600);
  const rawIcon = text(formData, "icon", 40);
  const icon = rawIcon === "auto" ? "" : rawIcon;
  const rawAccent = text(formData, "accent", 16);
  const accent = rawAccent === "auto" ? "" : rawAccent;
  const tags = text(formData, "tags", 160)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((tag) => tag.slice(0, 20));
  const rawOrder = Number(text(formData, "sortOrder", 10));
  const isActive = formData.get("isActive") === "true";
  const languages = formData
    .getAll("languages")
    .filter((value): value is string => value === "id" || value === "en");

  if (name.length < 2) {
    return { success: false, message: "Nama layanan minimal 2 karakter." };
  }
  if (languages.length === 0) {
    return { success: false, message: "Pilih minimal satu bahasa." };
  }
  if (icon && !SERVICE_ICON_MAP[icon]) {
    return { success: false, message: "Ikon layanan tidak valid." };
  }
  if (accent && !isServiceAccent(accent)) {
    return { success: false, message: "Warna aksen layanan tidak valid." };
  }

  // Harga wajib diisi untuk setiap bahasa yang dicentang supaya klien tidak
  // tertagih harga bahasa lain tanpa sepengetahuan admin.
  const prices: Record<string, number> = {};
  for (const code of languages) {
    const amount = Number(text(formData, `price_${code}`, 20).replace(/[^\d]/g, ""));
    if (!Number.isFinite(amount) || amount < 1000) {
      return {
        success: false,
        message: `Harga ${languageLabel(code)} minimal Rp1.000.`,
      };
    }
    prices[code] = amount;
  }

  // `price` menyimpan harga terendah untuk label "mulai dari" dan sorting.
  const price = Math.min(...Object.values(prices));

  const slug = slugify(text(formData, "slug", 80) || name, 80);
  if (!slug) {
    return { success: false, message: "Kode layanan tidak valid." };
  }

  const id = existingId || slug;
  const sortOrder = Number.isFinite(rawOrder) && rawOrder >= 0 ? Math.floor(rawOrder) : 0;

  try {
    await sql`
      INSERT INTO services (id, slug, name, description, price, prices, icon, accent, tags, languages, is_active, sort_order, updated_at)
      VALUES (
        ${id}, ${slug}, ${name}, ${description}, ${price},
        ${JSON.stringify(prices)}::jsonb,
        ${icon || null}, ${accent || null}, ${JSON.stringify(tags)}::jsonb,
        ${JSON.stringify(languages)}::jsonb, ${isActive}, ${sortOrder}, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        prices = EXCLUDED.prices,
        icon = EXCLUDED.icon,
        accent = EXCLUDED.accent,
        tags = EXCLUDED.tags,
        languages = EXCLUDED.languages,
        is_active = EXCLUDED.is_active,
        sort_order = EXCLUDED.sort_order,
        updated_at = now()
    `;

    revalidateServices();
    return { success: true, message: "Layanan berhasil disimpan." };
  } catch (error) {
    console.error("Gagal menyimpan layanan:", error);
    const message = (error as Error).message || "";
    if (/unique|duplicate/i.test(message)) {
      return { success: false, message: "Kode layanan sudah dipakai layanan lain. Gunakan kode yang berbeda." };
    }
    return { success: false, message: "Gagal menyimpan layanan. Coba lagi." };
  }
}

export async function toggleServiceAction(formData: FormData): Promise<ActionState> {
  const guard = await requireRole([SUPERADMIN]);
  if (!guard.ok) {
    return { success: false, message: "Hanya superadmin yang dapat mengubah layanan." };
  }

  const id = text(formData, "id", 64);
  const isActive = formData.get("isActive") === "true";
  if (!id) return { success: false, message: "Layanan tidak ditemukan." };

  try {
    await sql`UPDATE services SET is_active = ${isActive}, updated_at = now() WHERE id = ${id}`;
    revalidateServices();
    return {
      success: true,
      message: isActive ? "Layanan ditampilkan kembali." : "Layanan disembunyikan dari halaman utama.",
    };
  } catch (error) {
    console.error("Gagal mengubah status layanan:", error);
    return { success: false, message: "Gagal mengubah status layanan." };
  }
}

/**
 * Simpan urutan tampil layanan. `orderedIds` sudah dalam urutan final dari
 * drag-and-drop; `sort_order` dinormalisasi menjadi 0..n-1.
 */
export async function reorderServicesAction(orderedIds: string[]): Promise<ActionState> {
  const guard = await requireRole([SUPERADMIN]);
  if (!guard.ok) {
    return { success: false, message: "Hanya superadmin yang dapat mengubah urutan layanan." };
  }

  const ids = Array.from(
    new Set(
      (Array.isArray(orderedIds) ? orderedIds : []).filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      ),
    ),
  ).slice(0, 200);

  if (ids.length === 0) {
    return { success: false, message: "Tidak ada layanan untuk diurutkan." };
  }

  try {
    for (let index = 0; index < ids.length; index += 1) {
      await sql`
        UPDATE services
        SET sort_order = ${index}, updated_at = now()
        WHERE id = ${ids[index]}
      `;
    }

    revalidateServices();
    return { success: true, message: "Urutan layanan berhasil disimpan." };
  } catch (error) {
    console.error("Gagal menyimpan urutan layanan:", error);
    return { success: false, message: "Gagal menyimpan urutan layanan." };
  }
}

export async function deleteServiceAction(formData: FormData): Promise<ActionState> {
  const guard = await requireRole([SUPERADMIN]);
  if (!guard.ok) {
    return { success: false, message: "Hanya superadmin yang dapat menghapus layanan." };
  }

  const id = text(formData, "id", 64);
  if (!id) return { success: false, message: "Layanan tidak ditemukan." };

  try {
    const rows = (await sql`
      DELETE FROM services WHERE id = ${id} RETURNING id
    `) as { id: string }[];

    if (rows.length === 0) {
      return { success: false, message: "Layanan tidak ditemukan." };
    }

    revalidateServices();
    return { success: true, message: "Layanan dihapus. Riwayat pesanan tetap tersimpan." };
  } catch (error) {
    console.error("Gagal menghapus layanan:", error);
    return { success: false, message: "Gagal menghapus layanan." };
  }
}
// #endregion

// #region Pesanan jasa
export async function getServiceOrdersForUser(userId: string): Promise<ServiceOrder[]> {
  if (!userId) return [];

  try {
    const rows = (await sql`
      SELECT *
      FROM service_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `) as ServiceOrder[];

    return rows;
  } catch (error) {
    console.error("Gagal mengambil pesanan jasa:", error);
    return [];
  }
}

export async function getAllServiceOrders(): Promise<ServiceOrder[]> {
  const guard = await requireRole(ADMIN_ROLES);
  if (!guard.ok) return [];

  try {
    const rows = (await sql`
      SELECT *
      FROM service_orders
      ORDER BY created_at DESC
    `) as ServiceOrder[];

    return rows;
  } catch (error) {
    console.error("Gagal mengambil semua pesanan jasa:", error);
    return [];
  }
}

export async function getServiceOrderForUser(
  orderId: string,
  userId: string,
): Promise<ServiceOrder | null> {
  if (!orderId || !userId) return null;

  try {
    const rows = (await sql`
      SELECT * FROM service_orders
      WHERE order_id = ${orderId} AND user_id = ${userId}
      LIMIT 1
    `) as ServiceOrder[];

    return rows[0] ?? null;
  } catch (error) {
    console.error("Gagal mengambil pesanan jasa:", error);
    return null;
  }
}

export async function getServiceOrderForAdmin(orderId: string): Promise<ServiceOrder | null> {
  const guard = await requireRole(ADMIN_ROLES);
  if (!guard.ok || !orderId) return null;

  try {
    const rows = (await sql`
      SELECT * FROM service_orders
      WHERE order_id = ${orderId}
      LIMIT 1
    `) as ServiceOrder[];

    return rows[0] ?? null;
  } catch (error) {
    console.error("Gagal mengambil pesanan jasa:", error);
    return null;
  }
}

/**
 * Lampiran milik sebuah pesanan. Hak akses mengikuti aturan ruang pesanan:
 * pemilik dan admin/superadmin saja.
 */
export async function getServiceAttachments(orderId: string): Promise<ServiceAttachment[]> {
  if (!orderId) return [];

  const access = await getServiceAccess(orderId);
  if (!access) return [];

  try {
    const rows = (await sql`
      SELECT id, order_id, file_url, file_name,
             file_size::int AS file_size, created_at
      FROM service_order_attachments
      WHERE order_id = ${orderId}
      ORDER BY created_at ASC
    `) as ServiceAttachment[];

    return rows;
  } catch (error) {
    console.error("Gagal mengambil lampiran pesanan jasa:", error);
    return [];
  }
}

/**
 * Kirim pesan chat. Peran pengirim ditentukan dari sesi, bukan dari input
 * klien, supaya user biasa tidak bisa mengaku sebagai admin.
 */
export async function sendServiceMessageAction(
  orderId: string,
  body: string,
): Promise<ActionState> {
  const access = await getServiceAccess(orderId);
  if (!access) {
    return { success: false, message: "Pesanan tidak ditemukan atau bukan milik Anda." };
  }

  const message = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  if (message.length === 0) {
    return { success: false, message: "Pesan tidak boleh kosong." };
  }

  try {
    await sql`
      INSERT INTO service_messages (id, order_id, sender_id, sender_role, body)
      VALUES (${randomUUID()}, ${orderId}, ${access.userId}, ${access.role}, ${message})
    `;

    revalidatePath(`${ROUTES.DASHBOARD.ORDER_SERVICES}/${orderId}`);
    revalidatePath(`${ROUTES.DASHBOARD.ADMIN_SERVICES}/${orderId}`);
    return { success: true, message: "Pesan terkirim." };
  } catch (error) {
    console.error("Gagal mengirim pesan:", error);
    return { success: false, message: "Gagal mengirim pesan. Coba lagi." };
  }
}

/**
 * Admin melampirkan berkas hasil. Hanya boleh untuk pesanan yang sudah lunas.
 */
export async function attachServiceResultAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const guard = await requireRole(ADMIN_ROLES);
  if (!guard.ok) {
    return { success: false, message: "Hanya admin yang dapat mengunggah hasil." };
  }

  const orderId = text(formData, "orderId", 64);
  const resultFileUrl = text(formData, "resultFileUrl", 500);
  const resultFileName = text(formData, "resultFileName", 200);
  const adminNotes = text(formData, "adminNotes", 1000);

  if (!orderId) return { success: false, message: "Pesanan tidak ditemukan." };
  if (!isPrivateBlobUrl(resultFileUrl)) {
    return { success: false, message: "Unggah berkas hasil terlebih dahulu." };
  }

  try {
    const rows = (await sql`
      SELECT status, result_file_url FROM service_orders WHERE order_id = ${orderId} LIMIT 1
    `) as { status: string; result_file_url: string | null }[];

    if (rows.length === 0) {
      return { success: false, message: "Pesanan tidak ditemukan." };
    }
    if (rows[0].status !== "success") {
      return { success: false, message: "Pesanan belum dibayar. Hasil belum bisa dikirim." };
    }

    await sql`
      UPDATE service_orders
      SET
        result_file_url = ${resultFileUrl},
        result_file_name = ${resultFileName || null},
        admin_notes = ${adminNotes || null},
        delivered_at = now(),
        updated_at = now()
      WHERE order_id = ${orderId}
    `;

    const oldUrl = rows[0].result_file_url;
    if (oldUrl && oldUrl !== resultFileUrl) {
      await deleteBlobSafely(oldUrl);
    }

    // Beri tahu klien lewat chat supaya hasil baru terlihat tanpa harus
    // memuat ulang halaman (chat dipolling tiap 3 detik).
    if (oldUrl !== resultFileUrl) {
      const note = adminNotes
        ? `Berkas hasil sudah dikirim. Catatan admin: ${adminNotes}`
        : "Berkas hasil sudah dikirim. Silakan unduh lewat tombol \"Unduh berkas hasil\" di halaman ini.";

      await sql`
        INSERT INTO service_messages (id, order_id, sender_id, sender_role, body)
        VALUES (${randomUUID()}, ${orderId}, ${guard.userId}, 'admin', ${note.slice(0, 2000)})
      `;
    }

    revalidatePath(`${ROUTES.DASHBOARD.ORDER_SERVICES}/${orderId}`);
    revalidatePath(`${ROUTES.DASHBOARD.ADMIN_SERVICES}/${orderId}`);
    revalidatePath(ROUTES.DASHBOARD.ADMIN_SERVICES);
    return { success: true, message: "Berkas hasil berhasil dikirim ke klien." };
  } catch (error) {
    console.error("Gagal menyimpan hasil pesanan:", error);
    return { success: false, message: "Gagal menyimpan hasil. Coba lagi." };
  }
}

export async function deleteServiceResultAction(orderId: string): Promise<ActionState> {
  const guard = await requireRole(ADMIN_ROLES);
  if (!guard.ok) {
    return { success: false, message: "Hanya admin yang dapat menghapus hasil." };
  }

  try {
    const rows = (await sql`
      SELECT result_file_url FROM service_orders WHERE order_id = ${orderId} LIMIT 1
    `) as { result_file_url: string | null }[];

    if (rows.length === 0) {
      return { success: false, message: "Pesanan tidak ditemukan." };
    }

    await sql`
      UPDATE service_orders
      SET result_file_url = NULL, result_file_name = NULL, delivered_at = NULL, updated_at = now()
      WHERE order_id = ${orderId}
    `;

    const oldUrl = rows[0].result_file_url;
    if (oldUrl) {
      await deleteBlobSafely(oldUrl);

      // Klien sudah menerima pesan "berkas dikirim"; beri tahu bahwa berkas
      // ditarik agar tidak bingung mencari tombol unduh yang hilang.
      await sql`
        INSERT INTO service_messages (id, order_id, sender_id, sender_role, body)
        VALUES (
          ${randomUUID()}, ${orderId}, ${guard.userId}, 'admin',
          'Berkas hasil sebelumnya ditarik untuk diperbaiki. Versi terbaru akan segera dikirim.'
        )
      `;
    }

    revalidatePath(`${ROUTES.DASHBOARD.ORDER_SERVICES}/${orderId}`);
    revalidatePath(`${ROUTES.DASHBOARD.ADMIN_SERVICES}/${orderId}`);
    return { success: true, message: "Berkas hasil dihapus." };
  } catch (error) {
    console.error("Gagal menghapus hasil pesanan:", error);
    return { success: false, message: "Gagal menghapus hasil." };
  }
}

/** Hapus blob privat; kegagalan penyimpanan tidak membatalkan perubahan DB. */
export async function deleteServiceBlobAction(url: string): Promise<ActionState> {
  const guard = await requireRole(ADMIN_ROLES);
  if (!guard.ok) {
    return { success: false, message: "Tidak diizinkan." };
  }

  if (!isHttpsUrl(url)) return { success: false, message: "Tautan tidak valid." };

  await deleteBlobSafely(url);
  return { success: true, message: "File dihapus." };
}

async function deleteBlobSafely(url: string) {
  if (!isHttpsUrl(url)) return;

  try {
    await del(url, {
      storeId: process.env.PRIVATE_BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    });
  } catch (error) {
    console.warn("Gagal menghapus blob pesanan jasa:", url, error);
  }
}
// #endregion
