import { APP_CONFIG } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.NAME,
    short_name: APP_CONFIG.NAME,
    description: `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
