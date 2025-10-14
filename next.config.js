/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'v3b.fal.media',
      'v3.fal.media',
      '24reshai.ru',
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
    ],
  },
};

module.exports = nextConfig;
