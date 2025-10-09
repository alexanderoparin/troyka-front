/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'v3b.fal.media',
      'v3.fal.media',
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
    ],
  },
};

module.exports = nextConfig;
