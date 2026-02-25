const CACHE_NAME = 'gsi-insight-apk-v4';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching routes and assets');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`SW: Failed to cache ${url}`, err));
        })
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
            console.log('SW: Clearing old cache', cacheName);
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

  // Skip dynamic DB API calls, but NOT the proxy (we want to cache media)
  if (url.pathname.includes('/db/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Otherwise fetch and cache
      return fetch(event.request).then((response) => {
        // Cache static assets, pages, AND proxied media
        if (
          response && response.status === 200 && (
            url.pathname.startsWith('/apk/') ||
            url.pathname.includes('_next/static') ||
            url.pathname.includes('/api/proxy') || // Cache proxied media!
            url.hostname === 'unpkg.com' ||
            url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json|pdf)$/)
          )
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch((err) => {
        // 3. Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          // Check if we have the specific index.html for this route or the main one
          const fallbackPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
          return caches.match(fallbackPath) || caches.match('/apk/index.html');
        }
        return null;
      });
    })
  );
});
