const CACHE_NAME = 'gsi-insight-apk-v5';

// Routes and assets to pre-cache
const ASSETS_TO_CACHE = [
  '/apk/',
  '/apk/index.html',
  '/apk/login/',
  '/apk/admin/',
  '/apk/professor/',
  '/apk/schedule/',
  '/apk/subjects/',
  '/apk/library/',
  '/apk/community/',
  '/apk/profile/',
  '/apk/chat/',
  '/apk/manifest.json',
  '/apk/gsilogo.jpg',
  '/apk/icon-192.png',
  '/apk/icon-512.png',
  'https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs'
];

// Helper to check if a URL is a navigation request to a page
const isNavigationRequest = (request) => {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching all routes and assets');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`SW: Failed to cache ${url}`, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not intercept dynamic database API calls
  if (url.pathname.includes('/db/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      // 1. If it's a navigation request, try Network First, then Cache
      if (isNavigationRequest(event.request)) {
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
              return networkResponse;
            }
            return cachedResponse || caches.match('/apk/index.html');
          })
          .catch(() => {
            // Offline fallback: try the exact route, then the parent, then index.html
            const fallbackPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
            return cachedResponse || caches.match(fallbackPath) || caches.match('/apk/index.html');
          });
      }

      // 2. For static assets and proxied media, Cache First, then Network
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Only cache successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Determine if we should cache this asset
        const shouldCache =
          url.pathname.startsWith('/apk/') ||
          url.pathname.includes('_next/static') ||
          url.pathname.includes('/api/proxy') || // Important: cache proxied media!
          url.hostname === 'unpkg.com' ||
          url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json|pdf|mp4)$/);

        if (shouldCache) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }

        return networkResponse;
      }).catch(() => {
        // Final fallback for missing images or files when offline
        if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
          return caches.match('/apk/gsilogo.jpg');
        }
        return null;
      });
    })
  );
});
