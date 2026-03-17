// Service Worker NOMA — Cache des assets statiques
const CACHE_NAME = 'noma-v1'

// Assets à mettre en cache au démarrage
const PRECACHE_URLS = ['/', '/bar', '/historique', '/stats']

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Silently fail if some pages can't be cached (auth redirect etc.)
      })
    )
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Laisser passer : non-GET, Supabase API, Next.js internals
  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.pathname.startsWith('/_next/')) {
    // Cache-first pour les assets Next.js (JS, CSS)
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Network-first pour les navigations (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then(r => r || fetch(request)))
    )
    return
  }
})
