import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Replace with your target domain
        port: '',
        pathname: '/**', // Allows all image paths under this domain
      },
    ],
  },
};

export default nextConfig;
