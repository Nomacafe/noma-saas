import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NOMA Caisse',
    short_name: 'NOMA',
    description: 'Caisse · NOMA Café Coworking Toulouse',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0891b2',
    orientation: 'landscape',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
