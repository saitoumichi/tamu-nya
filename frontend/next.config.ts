import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};

export default nextConfig;
