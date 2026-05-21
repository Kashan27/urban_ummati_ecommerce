import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/api-zod",
    "@workspace/db",
  ],
  images: {
    // Allow all images for now - you can restrict this later
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Also support unoptimized images for local files
    unoptimized: true,
  },
};

export default nextConfig;
