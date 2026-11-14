import { APP_CONFIG, ROUTES } from '@/lib/constants';
import type { MetadataRoute } from 'next';

const PAGE_URL = (path: string) =>
  path === ROUTES.ROOT ? APP_CONFIG.URL : `${APP_CONFIG.URL}${path}`;

/**
 * Daftar halaman publik yang layak diindeks.
 *
 * `lastModified` sengaja tidak diisi: sebelumnya nilainya `new Date()` pada
 * setiap request, sehingga Google melihat semua halaman "berubah" terus dan
 * sinyal itu jadi tidak berguna.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = [
    ROUTES.PDF_TOOLS.PDF_TO_WORD,
    ROUTES.PDF_TOOLS.PDF_COMPRESSOR,
    ROUTES.PDF_TOOLS.PDF_MERGER,
    ROUTES.PDF_TOOLS.PDF_SPLITTER,
    ROUTES.PDF_TOOLS.PDF_TO_IMAGE,
    ROUTES.PDF_TOOLS.IMAGE_TO_PDF,
  ];

  return [
    {
      url: PAGE_URL(ROUTES.ROOT),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolPages.map((path) => ({
      url: PAGE_URL(path),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    {
      url: PAGE_URL(ROUTES.POLICY),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: PAGE_URL(ROUTES.TERMS),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
