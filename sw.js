const CACHE_NAME = 'scriptz-shell-v94';
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './version.json',
  './templates/DEPROT.JSON',
  './templates/DPCI.JSON',
  './templates/DPD.JSON',
  './templates/CAP-G.JSON',
  './templates/SMUL-CAP.JSON',
  './templates/SALA-ARTHUR-SABOYA.JSON',
  './assets/docs/padrao-escrita-observacoes.pdf',
  './assets/favicon.svg',
  './assets/favicon.png',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/scriptz_icone_branco_transparente.png'
];

const PUBLIC_PATHS = new Set(APP_SHELL.map(resource => new URL(resource, self.registration.scope).pathname));
const shellRequest = resource => new Request(new URL(resource, self.registration.scope).href);
const cacheKeyFor = request => new Request(new URL(request.url).origin + new URL(request.url).pathname);

function isApprovedPublicRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin && PUBLIC_PATHS.has(url.pathname);
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL.map(shellRequest))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' && new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(shellRequest('./index.html')))
    );
    return;
  }

  if (!isApprovedPublicRequest(event.request)) return;

  const cacheKey = cacheKeyFor(event.request);
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(cacheKey, copy));
        }
        return response;
      })
      .catch(() => caches.match(cacheKey))
  );
});
