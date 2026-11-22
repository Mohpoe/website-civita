/**
 * Ubah teks bebas menjadi slug URL yang aman.
 *
 * Dipakai produk dan layanan supaya alamat halaman publik selalu konsisten:
 * huruf kecil, tanpa diakritik, dan hanya berisi huruf, angka, serta tanda
 * hubung.
 */
export function slugify(value: string, maxLength = 120): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}
