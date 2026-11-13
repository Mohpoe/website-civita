import { neon } from "@neondatabase/serverless";

export { cn } from "cn"

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const sql = neon(`${process.env.NEONDB_DATABASE_URL}`);

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const THUMBNAIL_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const THUMBNAIL_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

/**
 * Thumbnail dioptimasi lewat `/put-optimized` yang hanya mendukung JPEG, PNG,
 * WebP, dan AVIF. Format lain (SVG, HEIC, GIF, BMP) akan ditolak Vercel, jadi
 * saring lebih awal agar admin mendapat pesan yang jelas.
 */
export const isSupportedThumbnail = (file: { name: string; type: string }) => {
  if (file.type && file.type !== "application/octet-stream") {
    return (THUMBNAIL_MIME_TYPES as readonly string[]).includes(file.type);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (THUMBNAIL_EXTENSIONS as readonly string[]).includes(extension);
};

/**
 * Ubah nama file menjadi ASCII yang aman dipakai sebagai pathname Vercel Blob.
 *
 * Token upload Vercel Blob membandingkan pathname secara persis, tetapi payload
 * token didekode dengan `atob()` (Latin-1), sehingga karakter non-ASCII seperti
 * en dash "–" berubah menjadi mojibake dan upload ditolak dengan error
 * "Blob path does not match the signed token scope".
 */
export const sanitizeFileName = (fileName: string) => {
  const lastDot = fileName.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < fileName.length - 1;
  const baseName = hasExtension ? fileName.slice(0, lastDot) : fileName;
  const extension = hasExtension ? fileName.slice(lastDot + 1) : "";

  const safeBaseName = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // buang diakritik (é -> e)
    .replace(/[\u2010-\u2015\u2212]/g, "-") // en/em dash, minus -> -
    .replace(/[^a-zA-Z0-9._-]+/g, "-") // sisanya -> -
    .replace(/-{2,}/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "") // jangan diawali/diakhiri . atau -
    .slice(0, 100);

  const safeExtension = extension
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12)
    .toLowerCase();

  const finalBaseName = safeBaseName || "file";
  return safeExtension ? `${finalBaseName}.${safeExtension}` : finalBaseName;
};