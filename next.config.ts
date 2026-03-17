import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Autoriser toutes les origines (Vercel + dev local)
      allowedOrigins: ['*'],
    },
  },
  // Optimisations pour PWA / production
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
