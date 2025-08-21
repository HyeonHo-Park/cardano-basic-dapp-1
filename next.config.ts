import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pages Router 사용 (src/pages 디렉토리)
  pageExtensions: ['tsx', 'ts'],

  // 실험적 기능들 (Next.js 15에서는 appDir 설정 불필요)
  experimental: {},

  // 웹팩 설정
  webpack: (config: any) => {
    // WASM 파일 처리 (Cardano 라이브러리용)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

export default nextConfig;
