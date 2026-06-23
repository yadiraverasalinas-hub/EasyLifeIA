import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/EasyLifeIA',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
