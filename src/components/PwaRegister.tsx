'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[SW] Enregistré, scope:', reg.scope)
        })
        .catch(err => {
          console.warn('[SW] Échec enregistrement:', err)
        })
    }
  }, [])

  return null
}
