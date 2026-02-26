const CACHE_NAME = 'gsi-insight-apk-v7';

// Routes to pre-cache
// IMPORTANT: We cache both the folder and the index.html for each route
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core routes');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`SW: Pre-cache failed for ${url}`)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Cleaning old cache', key);
            return caches.delete(key);
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

  // BYPASS for Range requests (streaming) to avoid SW issues
  if (event.request.headers.get('range')) return;

  // BYPASS for dynamic DB calls
  if (url.pathname.includes('/db/')) return;

  // STRATEGY: Network First for HTML, Cache First for assets
  const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request).then((cached) => {
             if (cached) return cached;
             // Ultimate fallback: root index.html
             return caches.match('/apk/index.html');
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((res) => {
          // Cache successful static assets and proxied media
          if (res && res.status === 200 && (
              url.pathname.includes('_next/static') ||
              url.pathname.includes('/api/proxy') ||
              url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json|pdf)$/)
          )) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        }).catch(() => {
           // Fallback for images
           if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
             return caches.match('/apk/gsilogo.jpg');
           }
           return null;
        });
      })
    );
  }
});
