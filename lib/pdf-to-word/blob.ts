import { del, get, issueSignedToken, put } from "@vercel/blob";
import { PDF_TO_WORD_CONFIG } from "./config";

function getToken(): string {
  const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("PRIVATE_BLOB_READ_WRITE_TOKEN belum diisi.");
  }
  return token;
}

/**
 * Baca blob private sebagai Buffer. Dipakai untuk mengambil PDF sebelum
 * dikirim ke Adobe dan untuk menyajikan DOCX hasil konversi.
 */
export async function readPrivateBlob(
  pathname: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const result = await get(pathname, {
    access: "private",
    token: getToken(),
  });

  if (!result || result.statusCode !== 200) {
    throw new Error("File tidak ditemukan di penyimpanan.");
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  return {
    buffer,
    contentType: result.blob.contentType || "application/octet-stream",
  };
}

export async function writePrivateBlob(
  pathname: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await put(pathname, body, {
    access: "private",
    token: getToken(),
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

export async function deletePrivateBlob(pathname: string): Promise<void> {
  try {
    await del(pathname, { token: getToken() });
  } catch (error) {
    // Penghapusan bersifat best-effort; cron harian tetap menyapu sisa file.
    console.warn("[pdf-to-word] gagal menghapus blob:", (error as Error).message);
  }
}

/**
 * Terbitkan token upload yang hanya berlaku untuk satu pathname PDF.
 *
 * Di Vercel, OIDC dipakai lebih dulu. Saat pengembangan lokal OIDC sering
 * kedaluwarsa, jadi read-write token dipakai sebagai fallback.
 */
export async function issueUploadToken(pathname: string) {
  const common: Omit<
    Parameters<typeof issueSignedToken>[0],
    "token" | "storeId" | "oidcToken"
  > = {
    pathname,
    operations: ["put"],
    allowedContentTypes: ["application/pdf"],
    maximumSizeInBytes: PDF_TO_WORD_CONFIG.maxFileBytes,
    validUntil: Date.now() + 10 * 60 * 1000,
  };

  const storeId = process.env.PRIVATE_BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;

  if (storeId && oidcToken) {
    try {
      return await issueSignedToken({ ...common, storeId, oidcToken });
    } catch (error) {
      console.warn(
        "[pdf-to-word] token OIDC gagal, memakai read-write token:",
        (error as Error).message,
      );
    }
  }

  return issueSignedToken({ ...common, token: getToken() });
}

export function isPrivateBlobConfigured(): boolean {
  return Boolean(process.env.PRIVATE_BLOB_READ_WRITE_TOKEN);
}
