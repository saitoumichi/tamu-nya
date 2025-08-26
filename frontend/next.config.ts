import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // ビルド時間短縮のための追加設定
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
