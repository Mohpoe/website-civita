import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { HELP_ARTICLES } from '@/lib/help-content';
import { getActiveProducts } from '@/lib/products';
import { getActiveServices } from '@/lib/service-catalog';
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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services] = await Promise.all([
    getActiveProducts(),
    getActiveServices(),
  ]);

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
    {
      url: PAGE_URL(ROUTES.PRODUCTS),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: PAGE_URL(`${ROUTES.PRODUCTS}/${product.slug || product.id}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    {
      url: PAGE_URL(ROUTES.SERVICES),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...services.map((service) => ({
      url: PAGE_URL(`${ROUTES.SERVICES}/${service.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...toolPages.map((path) => ({
      url: PAGE_URL(path),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    {
      url: PAGE_URL(ROUTES.HELP),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...HELP_ARTICLES.map((article) => ({
      url: PAGE_URL(`${ROUTES.HELP}/${article.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
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
