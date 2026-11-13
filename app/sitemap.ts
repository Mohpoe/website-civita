import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { MetadataRoute } from 'next';

const PAGE_URL = (path: string) => (path === ROUTES.ROOT ? APP_CONFIG.URL : `${APP_CONFIG.URL}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  // Anda bisa menambahkan fetch ke database di sini untuk melooping produk/kategori

  return [
    {
      url: PAGE_URL(ROUTES.ROOT),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: PAGE_URL(ROUTES.TERMS),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.POLICY),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.IMAGE_TO_PDF),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.PDF_COMPRESSOR),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.PDF_MERGER),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.PDF_SPLITTER),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.PDF_TO_IMAGE),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: PAGE_URL(ROUTES.PDF_TOOLS.PDF_TO_WORD),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
}
