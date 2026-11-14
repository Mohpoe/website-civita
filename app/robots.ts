import { APP_CONFIG } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Halaman privat dan endpoint API tidak perlu dirayapi. Aset `/_next/`
      // sengaja dibiarkan terbuka agar crawler bisa mengambil CSS/JS halaman.
      disallow: ['/api/', '/dashboard'],
    },
    sitemap: `${APP_CONFIG.URL}/sitemap.xml`,
    host: APP_CONFIG.URL,
  };
}
