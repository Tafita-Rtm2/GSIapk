const CACHE_NAME = 'gsi-insight-apk-v3';
const ASSETS_TO_CACHE = [
  '/apk/',
  '/apk/index.html',
  '/apk/login/',
  '/apk/schedule/',
  '/apk/subjects/',
  '/apk/library/',
  '/apk/community/',
  '/apk/profile/',
  '/apk/manifest.json',
  '/apk/gsilogo.jpg',
  '/apk/icon-192.png',
  '/apk/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching all routes and assets');
      // We use map to avoid failing the whole install if one asset fails
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
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
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Don't cache API calls or proxy calls
  if (url.pathname.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache static assets and pages
        if (
          url.pathname.startsWith('/apk/') ||
          url.pathname.includes('_next/static') ||
          url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json)$/)
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          // Try to match the exact path or fallback to home
          return caches.match(event.request) || caches.match('/apk/index.html');
        }
      });
    })
  );
});
