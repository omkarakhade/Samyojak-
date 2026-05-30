/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.qrserver.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}
module.exports = nextConfig
