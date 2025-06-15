const CACHE_NAME = 'nic-prevent-cache-v3'; // IMPORTANT: Changer la version pour forcer la mise à jour du cache
const urlsToCache = [
  './', // Alias pour index.html
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/webfonts/fa-solid-900.woff2', // Police pour les icônes Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/webfonts/fa-brands-400.woff2', // Police pour les icônes Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/webfonts/fa-regular-400.woff2' // Police pour les icônes Font Awesome
];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert. Mise en cache des ressources essentielles.');
        // fetch les ressources et les ajoute au cache.
        // Request avec `mode: 'no-cors'` pour les ressources externes (CDN) qui pourraient ne pas supporter CORS.
        const promises = urlsToCache.map(url => {
            return fetch(new Request(url, { mode: 'no-cors' })).then(response => {
                return cache.put(url, response);
            });
        });
        return Promise.all(promises);
      })
      .catch(err => {
        console.error('La mise en cache a échoué:', err);
      })
  );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de récupération des requêtes : Cache d'abord, puis réseau en fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Le cache a la ressource, on la retourne
        if (response) {
          return response;
        }
        // Sinon, on la cherche sur le réseau
        return fetch(event.request);
      }
    )
  );
});
