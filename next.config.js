/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả các domain sử dụng HTTPS
      },
    ],
  },
};
module.exports = nextConfig;
    