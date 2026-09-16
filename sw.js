const CACHE_NAME = 'trading-profit-plan-v2'; // ← bump αυτό σε v3, v4 κάθε φορά που αλλάζεις κώδικα

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './trading_logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-first για JS/CSS/HTML, cache fallback για offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAsset = ['.js', '.css', '.html'].some(ext => url.pathname.endsWith(ext))
               || url.pathname.endsWith('/');

  if (isAsset) {
    // Network-first: παίρνει πάντα το νέο αρχείο, fallback στο cache αν offline
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first για εικόνες/icons (δεν αλλάζουν συχνά)
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
