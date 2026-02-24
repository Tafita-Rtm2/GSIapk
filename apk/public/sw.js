const CACHE_NAME = 'gsi-insight-apk-v1';
const ASSETS_TO_CACHE = [
  '/apk/',
  '/apk/index.html',
  '/apk/manifest.json',
  '/apk/gsilogo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
