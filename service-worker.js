const CACHE = 'topdog-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icon.svg',
  '/js/main.js',
  '/js/state.js',
  '/js/config.js',
  '/js/customers.js',
  '/js/ui.js',
  '/js/audio.js',
  '/js/save.js',
  '/js/stations/order.js',
  '/js/stations/grill.js',
  '/js/stations/topping.js',
  '/js/stations/sides.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});
