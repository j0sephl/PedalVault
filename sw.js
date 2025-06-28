const CACHE_NAME = 'pedalvault-v1.5';
const STATIC_CACHE = 'pedalvault-static-v1.5';

// Only cache your own app files - no external CDNs
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css', 
    './script.js',
    './rive-logo.js',
    './gpi.riv',
    './manifest.json',
    './offline.html',
    './lib/rive.min.js',
    '/icons/ios/180.png?v=2024-new',
    './favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
                // Don't fail the install if caching fails
                return Promise.resolve();
            })
            .then(() => {
                console.log('Service Worker install complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== STATIC_CACHE)
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all pages immediately
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker activated and ready');
        })
    );
});

// Fetch event - Optimized caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other protocol requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // For external CDN resources, just pass through to network
    if (url.origin !== location.origin) {
        // Let external resources load normally without caching
        event.respondWith(fetch(event.request));
        return;
    }
    
    // For your app resources, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    // Log less frequently to reduce console spam
                    if (Math.random() < 0.1) console.log('Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Only cache successful responses from your domain
                        if (networkResponse && networkResponse.status === 200) {
                            // Clone the response before caching
                            const responseToCache = networkResponse.clone();
                            
                            // Use a separate promise chain for caching to avoid blocking the response
                            caches.open(STATIC_CACHE)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.warn('Failed to cache response:', error);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('Network fetch failed:', error);
                        
                        // If it's a navigation request and network fails, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html') || 
                                   new Response('App is offline', { 
                                       status: 503, 
                                       statusText: 'Service Unavailable' 
                                   });
                        }
                        
                        // For other requests, just return the error
                        throw error;
                    });
            })
            .catch(error => {
                console.error('Cache match failed:', error);
                // Fallback to network
                return fetch(event.request);
            })
    );
});

// Handle messages from the app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic cleanup (optional)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEANUP_CACHE') {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                if (cacheName !== STATIC_CACHE) {
                    caches.delete(cacheName);
                }
            });
        });
    }
}); 