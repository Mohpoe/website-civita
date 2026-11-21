"use server";

import { ROUTES } from "@/lib/constants";
import { SITE_SETTINGS_TAG } from "@/lib/settings";
import { sql } from "@/lib/utils";
import type { ActionState } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

const SUPERADMIN = "superadmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(formData: FormData, key: string, max: number): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

function optionalEmail(value: string): boolean {
  return value === "" || EMAIL_RE.test(value);
}

/**
 * Simpan identitas situs.
 *
 * Hanya superadmin yang boleh mengubah. Semua kolom ditulis sekaligus supaya
 * baris `site_settings` selalu konsisten, dan nilai kosong otomatis kembali
 * memakai bawaan dari `lib/constants.ts` saat dibaca.
 */
export async function updateSiteSettingsAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  await auth.protect();
  const user = await currentUser();

  if (!user || user.publicMetadata.role !== SUPERADMIN) {
    return { success: false, message: "Hanya superadmin yang dapat mengubah pengaturan situs." };
  }

  const brandName = text(formData, "brandName", 60);
  const tagline = text(formData, "tagline", 120);
  const description = text(formData, "description", 400);
  const emailPrimary = text(formData, "emailPrimary", 120);
  const emailSupport = text(formData, "emailSupport", 120);
  const whatsappNumber = text(formData, "whatsappNumber", 20).replace(/\D/g, "");
  const instagramUrl = text(formData, "instagramUrl", 200);
  const linkedinUrl = text(formData, "linkedinUrl", 200);
  const twitterHandle = text(formData, "twitterHandle", 40);
  const logoUrl = text(formData, "logoUrl", 400);
  const heroHeadline = text(formData, "heroHeadline", 160);
  const heroSubheadline = text(formData, "heroSubheadline", 400);
  const consultMessage = text(formData, "consultMessage", 500);

  if (brandName.length < 2) {
    return { success: false, message: "Nama brand minimal 2 karakter." };
  }
  if (!optionalEmail(emailPrimary) || !optionalEmail(emailSupport)) {
    return { success: false, message: "Format email tidak valid." };
  }
  if (whatsappNumber.length < 8 || whatsappNumber.length > 15) {
    return { success: false, message: "Nomor WhatsApp harus 8–15 digit (tanpa + atau spasi)." };
  }
  for (const [label, url] of [
    ["Instagram", instagramUrl],
    ["LinkedIn", linkedinUrl],
    ["Logo", logoUrl],
  ] as const) {
    if (url !== "" && !/^https?:\/\//i.test(url)) {
      return { success: false, message: `URL ${label} harus diawali http:// atau https://` };
    }
  }

  try {
    await sql`
      INSERT INTO site_settings (
        id, brand_name, tagline, description,
        email_primary, email_support, whatsapp_number,
        instagram_url, linkedin_url, twitter_handle,
        logo_url, hero_headline, hero_subheadline, consult_message,
        updated_at, updated_by
      ) VALUES (
        'default', ${brandName}, ${tagline}, ${description},
        ${emailPrimary}, ${emailSupport}, ${whatsappNumber},
        ${instagramUrl}, ${linkedinUrl}, ${twitterHandle},
        ${logoUrl}, ${heroHeadline}, ${heroSubheadline}, ${consultMessage},
        now(), ${user.id}
      )
      ON CONFLICT (id) DO UPDATE SET
        brand_name = EXCLUDED.brand_name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        email_primary = EXCLUDED.email_primary,
        email_support = EXCLUDED.email_support,
        whatsapp_number = EXCLUDED.whatsapp_number,
        instagram_url = EXCLUDED.instagram_url,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_handle = EXCLUDED.twitter_handle,
        logo_url = EXCLUDED.logo_url,
        hero_headline = EXCLUDED.hero_headline,
        hero_subheadline = EXCLUDED.hero_subheadline,
        consult_message = EXCLUDED.consult_message,
        updated_at = now(),
        updated_by = EXCLUDED.updated_by
    `;

    // `expire: 0` membuat kunjungan berikutnya langsung memakai nilai baru.
    revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath(ROUTES.ROOT);
    revalidatePath(ROUTES.DASHBOARD.SETTINGS);

    return { success: true, message: "Pengaturan situs berhasil disimpan." };
  } catch (error) {
    console.error("Gagal menyimpan pengaturan situs:", error);
    return { success: false, message: "Gagal menyimpan pengaturan. Coba lagi." };
  }
}
