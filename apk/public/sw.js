const CACHE_NAME = 'gsi-insight-apk-v6';

// Routes and assets to pre-cache
// IMPORTANT: Use trailing slashes for directory routes to match Next.js output
const ASSETS_TO_CACHE = [
  '/apk/',
  '/apk/index.html',
  '/apk/login/',
  '/apk/login/index.html',
  '/apk/admin/',
  '/apk/admin/index.html',
  '/apk/professor/',
  '/apk/professor/index.html',
  '/apk/schedule/',
  '/apk/schedule/index.html',
  '/apk/subjects/',
  '/apk/subjects/index.html',
  '/apk/library/',
  '/apk/library/index.html',
  '/apk/community/',
  '/apk/community/index.html',
  '/apk/profile/',
  '/apk/profile/index.html',
  '/apk/chat/',
  '/apk/chat/index.html',
  '/apk/manifest.json',
  '/apk/gsilogo.jpg',
  '/apk/icon-192.png',
  '/apk/icon-512.png',
  'https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs'
];

const isNavigationRequest = (request) => {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
};

const isStaticAsset = (url) => {
  return url.pathname.includes('_next/static') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json|pdf|mp4)$/);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching routes and assets');
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

  // Bypass SW for Range requests (common for video) to avoid 206 Partial Content issues
  if (event.request.headers.get('range')) {
    return;
  }

  // Bypass SW for dynamic API calls
  if (url.pathname.includes('/db/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      // 1. Navigation requests: Network First, Fallback to Cache
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
            // Try exact match, then folder match, then main index
            const folderPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
            const indexInFolder = folderPath + 'index.html';
            return cachedResponse || caches.match(folderPath) || caches.match(indexInFolder) || caches.match('/apk/index.html');
          });
      }

      // 2. Static Assets & Proxied Media: Cache First, Fallback to Network
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses for assets
        if (networkResponse && networkResponse.status === 200 && (isStaticAsset(url) || url.pathname.includes('/api/proxy'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // Silent fail for assets
        return null;
      });
    })
  );
});
