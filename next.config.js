/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'v3b.fal.media',
      'v3.fal.media',
      '24reshai.ru',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v3b.fal.media',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
      },
      {
        protocol: 'https',
        hostname: '24reshai.ru',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Переменные окружения доступны клиентскому коду через NEXT_PUBLIC_ префикс
  // Используем их напрямую в src/lib/config.ts
};

module.exports = nextConfig;
