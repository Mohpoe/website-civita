import type { NextConfig } from "next";
import { APP_CONFIG } from "./lib/constants";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Thumbnail produk dikirim lewat Server Action (maks. 4MB di UI),
      // sementara batas default Next.js hanya 1MB.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: APP_CONFIG.ASSETS.HOST,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
