import type { NextConfig } from "next";

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
        hostname: 'qaupjj2m3j2vqts9.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
