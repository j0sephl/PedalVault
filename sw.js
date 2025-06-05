const CACHE_NAME = 'gpi-v1.4';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Cache size limits (in MB)
const STATIC_CACHE_LIMIT = 50;
const DYNAMIC_CACHE_LIMIT = 20;

// Static assets to cache
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './rive-logo.js',
    './gpi.riv',
    './manifest.json',
    './offline.html',
    'https://unpkg.com/@rive-app/canvas@2.10.3',
    'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js',
    'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css',
    'https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js'
];

// Performance monitoring
const performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkErrors: 0,
    lastUpdate: Date.now()
};

// Helper function to calculate cache size
async function getCacheSize(cache) {
    const keys = await cache.keys();
    let size = 0;
    for (const request of keys) {
        const response = await cache.match(request);
        const blob = await response.blob();
        size += blob.size;
    }
    return size / (1024 * 1024); // Convert to MB
}

// Helper function to clean old caches
async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    
    // Delete old caches
    await Promise.all(
        cacheNames
            .filter(name => !currentCaches.includes(name))
            .map(name => caches.delete(name))
    );
    
    // Check and clean static cache
    const staticCache = await caches.open(STATIC_CACHE);
    const staticSize = await getCacheSize(staticCache);
    if (staticSize > STATIC_CACHE_LIMIT) {
        await caches.delete(STATIC_CACHE);
    }
    
    // Check and clean dynamic cache
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const dynamicSize = await getCacheSize(dynamicCache);
    if (dynamicSize > DYNAMIC_CACHE_LIMIT) {
        await caches.delete(DYNAMIC_CACHE);
    }
}

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Static cache installation failed:', error);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            cleanOldCaches()
        ])
    );
});

// Fetch event - implement cache-first strategy for static assets
self.addEventListener('fetch', event => {
    // Skip caching for local development
    if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
        return;
    }

    // Add cache busting parameter to URLs
    const url = new URL(event.request.url);
    if (url.origin === location.origin) {
        url.searchParams.set('v', CACHE_NAME);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    performanceMetrics.cacheHits++;
                    return response;
                }
                
                performanceMetrics.cacheMisses++;
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            throw new Error('Network response was not ok');
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Cache the response
                        const cacheType = STATIC_ASSETS.includes(event.request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
                        caches.open(cacheType)
                            .then(cache => {
                                cache.put(event.request, responseToCache)
                                    .catch(error => {
                                        console.error('Cache update failed:', error);
                                    });
                            });

                        return networkResponse;
                    })
                    .catch(error => {
                        performanceMetrics.networkErrors++;
                        console.error('Network fetch failed:', error);
                        
                        // If it's a navigation request, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                        
                        // Return a basic offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Periodically report performance metrics
setInterval(() => {
    const now = Date.now();
    const timeElapsed = (now - performanceMetrics.lastUpdate) / 1000;
    
    console.log('Performance Metrics (last ' + timeElapsed.toFixed(1) + 's):', {
        cacheHits: performanceMetrics.cacheHits,
        cacheMisses: performanceMetrics.cacheMisses,
        networkErrors: performanceMetrics.networkErrors,
        hitRate: (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1) + '%'
    });
    
    // Reset metrics
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
    performanceMetrics.networkErrors = 0;
    performanceMetrics.lastUpdate = now;
}, 60000); // Report every minute 