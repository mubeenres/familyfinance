const CACHE_NAME = 'familyfinance-v2-20260722';
const STATIC_ASSETS = [
    '/familyfinance/',
    '/familyfinance/index.html',
    '/familyfinance/manifest.json',
  ];

self.addEventListener('install', event => {
    event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
        );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
          caches.keys().then(keys =>
                  Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
                                 ).then(() => self.clients.claim())
        );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // Never cache/interfere with backend calls
                        if (url.hostname.includes('script.google.com')) {
                              return;
                        }
    // Only handle GET requests
                        if (event.request.method !== 'GET') {
                              return;
                        }
    // Network-first for navigation/HTML so deploys are picked up immediately;
                        // fall back to cache only when offline.
                        event.respondWith(
                              fetch(event.request).then(response => {
                                      if (response.ok) {
                                                const copy = response.clone();
                                                caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
                                      }
                                      return response;
                              }).catch(() => caches.match(event.request).then(cached => cached || new Response('Offline', { status: 503 })))
                            );
});
