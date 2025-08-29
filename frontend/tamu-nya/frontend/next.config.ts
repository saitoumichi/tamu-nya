import path from 'path';

const nextConfig = {
  // Monorepo の依存解決ルートを明示
  outputFileTracingRoot: path.join(__dirname, '..'),
  // 画像最適化を使わないなら（Vercel外や静的出力で便利）
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
