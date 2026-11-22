import z from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Nama produk minimal 3 karakter!"),
  slug: z.string().max(120, "Alamat halaman maksimal 120 karakter!").optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh minus!"),
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Kategori wajib dipilih!"),
  shortDesc: z.string().min(10, "Deskripsi singkat terlalu singkat!").optional(),
  longDesc: z.string().min(10, "Deskripsi lengkap terlalu singkat!").optional(),
  // URL bisa divalidasi, .or(z.literal('')) mengizinkan input kosong
  imageUrl: z.url("Gambar thumbnail tidak valid!").or(z.literal('')),
  fileUrl: z.url("File produk digital tidak valid!").or(z.literal('')),
  fileFormat: z.string().max(40, "Format file maksimal 40 karakter!").optional(),
  fileSize: z.string().max(40, "Ukuran file maksimal 40 karakter!").optional(),
  features: z.array(z.string())
});
