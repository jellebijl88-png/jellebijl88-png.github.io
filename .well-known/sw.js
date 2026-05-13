const CACHE_NAME = 'jellylegs-v2';

// Bestanden die altijd in de cache moeten bij installatie
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Service Worker installeren
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Service Worker activeren - oude caches opschonen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Netwerkverzoeken afhandelen
self.addEventListener('fetch', event => {
  // Alleen GET-verzoeken cachen
  if (event.request.method !== 'GET') return;

  // Externe API's en CDN's niet cachen (leaflet, chart.js, google fonts)
  const url = new URL(event.request.url);
  if (url.hostname !== self.location.hostname) {
    // Network-only voor externe resources
    event.respondWith(fetch(event.request).catch(() => {
      // Als het een kaart-tile is, stuur een lege placeholder
      if (url.pathname.includes('tile.openstreetmap.org')) {
        return new Response('', { status: 204 });
      }
      return new Response('', { status: 503 });
    }));
    return;
  }

  // Cache-first voor eigen bestanden
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Update cache op de achtergrond voor volgende keer
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        return new Response('Je bent offline. Open de app opnieuw als je weer online bent.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});