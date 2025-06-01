const CACHE_NAME = 'gpi-v1.2';
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
    const url = new URL(event.request.url);
    if (url.origin === location.origin) {
        url.searchParams.set('v', CACHE_NAME);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    const cacheTime = response.headers.get('sw-cache-time');
                    if (cacheTime) {
                        const cacheAge = Date.now() - parseInt(cacheTime);
                        if (cacheAge > 5 * 60 * 1000) {
                            return fetchAndCache(event.request);
                        }
                    }
                    return response;
                }

                const fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(
                    response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                const headers = new Headers(responseToCache.headers);
                                headers.append('sw-cache-time', Date.now().toString());
                                const cachedResponse = new Response(responseToCache.body, {
                                    status: responseToCache.status,
                                    statusText: responseToCache.statusText,
                                    headers: headers
                                });
                                cache.put(event.request, cachedResponse);
                            });
                        return response;
                    }
                ).catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }
                });
            })
    );
});

async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }

        const responseToCache = response.clone();
        const cache = await caches.open(CACHE_NAME);
        
        const headers = new Headers(responseToCache.headers);
        headers.append('sw-cache-time', Date.now().toString());
        const cachedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
        });
        
        await cache.put(request, cachedResponse);
        return response;
    } catch (error) {
        console.error('Fetch failed:', error);
        return caches.match(request);
    }
} 