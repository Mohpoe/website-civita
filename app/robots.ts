import { APP_CONFIG } from '@/lib/constants';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Cegah bot mengindeks halaman admin dan endpoint API
      disallow: ['/dashboard/', '/api/', '/_next/'],
    },
    sitemap: `${APP_CONFIG.URL}/sitemap.xml`,
  }
}
