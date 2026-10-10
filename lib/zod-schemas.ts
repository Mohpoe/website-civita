import z from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Nama produk minimal 3 karakter!"),
  price: z.coerce.number().min(0, "Harga tidak boleh minus!"),
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Kategori wajib dipilih!"),
  shortDesc: z.string().min(10, "Deskripsi singkat terlalu singkat!").optional(),
  longDesc: z.string().min(10, "Deskripsi lengkap terlalu singkat!").optional(),
  // URL bisa divalidasi, .or(z.literal('')) mengizinkan input kosong
  imageUrl: z.url("URL Gambar tidak valid!").or(z.literal('')),
  fileUrl: z.string().min(10, "File tidak valid!").optional(),
  features: z.array(z.string())
});
