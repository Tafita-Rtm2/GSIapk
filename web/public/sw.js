const CACHE_NAME = 'gsi-web-v2';
const STATIC_ASSETS = [
  '/web/',
  '/web/manifest.json',
  '/web/sw.js',
  '/web/pdf.worker.min.mjs',
  '/web/icon-192.png',
  '/web/icon-512.png'
];

// Installation : mise en cache des actifs de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les requêtes API
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Pour les actifs statiques (JS, CSS, Images), Cache-First
  if (
    url.pathname.includes('/_next/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
  } else {
    // Pour les pages HTML et autres, Network-First avec repli sur le cache
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si rien n'est trouvé, essayer de renvoyer l'index.html pour le routage SPA
          if (event.request.mode === 'navigate') {
            return caches.match('/web/');
          }
        });
      })
    );
  }
});
