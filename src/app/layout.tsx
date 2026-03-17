import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import PwaRegister from '@/components/PwaRegister'

export const metadata: Metadata = {
  title: 'NOMA — Caisse',
  description: 'Caisse NOMA Café Coworking Toulouse',
  appleWebApp: {
    capable: true,
    title: 'NOMA',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#0891b2',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* iOS PWA — plein écran sans barre Safari */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NOMA" />
        {/* Empêche le zoom sur double-tap (iPad) */}
        <meta name="touch-action" content="manipulation" />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-screen overflow-auto">
            {children}
          </main>
        </div>
        <PwaRegister />
      </body>
    </html>
  )
}
