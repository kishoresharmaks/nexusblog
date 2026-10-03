import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@nexus/ui', '@nexus/types', '@nexus/config'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    const defaultApiPort = process.env.API_PORT || process.env.INTERNAL_API_PORT || 4000;
    let apiTarget = (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      `http://127.0.0.1:${defaultApiPort}/api`
    ).trim().replace(/\/+$/, '');
    if (!apiTarget.endsWith('/api') && (apiTarget.startsWith('http://') || apiTarget.startsWith('https://'))) {
      apiTarget = `${apiTarget}/api`;
    }
    const uploadsTarget = (
      process.env.INTERNAL_UPLOADS_URL ||
      `http://127.0.0.1:${defaultApiPort}/uploads`
    ).trim().replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${uploadsTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
