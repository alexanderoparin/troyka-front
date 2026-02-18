/** @type {import('next').NextConfig} */
const nextConfig = {
  // Таймаут загрузки upstream-картинки (/_next/image ходит за url=...). По умолчанию ~7 с — бэкенд+FAL могут не успеть.
  experimental: {
    imgOptTimeoutInSeconds: 90,
  },
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
    // Адаптивные размеры для разных устройств
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Минимальное время кеширования оптимизированных изображений (в секундах)
    minimumCacheTTL: 60 * 60 * 24, // 24 часа
    // Форматы для оптимизации (автоматически выберет лучший)
    formats: ['image/avif', 'image/webp'],
  },
  // Переменные окружения доступны клиентскому коду через NEXT_PUBLIC_ префикс
  // Используем их напрямую в src/lib/config.ts
};

module.exports = nextConfig;
