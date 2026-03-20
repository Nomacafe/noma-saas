import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'noma-saas-production-6d5a.up.railway.app',
        'localhost:3000',
        'localhost:8080',
      ],
    },
  },
}

export default nextConfig
