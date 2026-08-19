const CACHE_NAME = 'scriptz-shell-v51';
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './templates/DEPROT.JSON',
  './templates/DPCI.JSON',
  './templates/DPD.JSON',
  './templates/SMUL-CAP.JSON',
  './templates/SALA-ARTHUR-SABOYA.JSON',
  './assets/favicon.svg',
  './assets/favicon.png',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/scriptz_icone_branco_transparente.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
