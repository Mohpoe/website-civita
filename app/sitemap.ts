import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Anda bisa menambahkan fetch ke database di sini untuk melooping produk/kategori

  return [
    {
      url: 'https://www.civita.id',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // Prioritas tertinggi untuk halaman utama
    },
    {
      url: 'https://www.civita.id/terms-of-service', // Sesuaikan dengan route Anda
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.civita.id/privacy-policy', // Sesuaikan dengan route Anda
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // ... rute publik lainnya
  ]
}