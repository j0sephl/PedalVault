const CACHE_NAME = 'gpi-v1.4';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/rive-logo.js',
    '/gpi.riv',
    '/manifest.json',
    '/offline.html',
    'https://unpkg.com/@rive-app/canvas@2.10.3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    // Add cache busting parameter to URLs
    const url = new URL(event.request.url);
    if (url.origin === location.origin) {
        url.searchParams.set('v', CACHE_NAME);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Always fetch from network first
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache the new response
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, return cached response if available
                        if (response) {
                            return response;
                        }
                        // If no cached response and it's a navigation request, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
}); 