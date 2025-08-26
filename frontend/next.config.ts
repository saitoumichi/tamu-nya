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
  },
  // Vercelでのルーティング問題を解決
  experimental: {
    appDir: true
  },
  // 静的生成を無効化してSSRを有効化
  staticPageGenerationTimeout: 0
};

export default nextConfig;
