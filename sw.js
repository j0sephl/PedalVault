const CACHE_NAME = 'gpi-v1.4'; // Increment this to force update of cached assets if needed
const STATIC_CACHE = 'gpi-static-v1.4'; // Versioned static cache
const DYNAMIC_CACHE = 'gpi-dynamic-v1.4'; // Versioned dynamic cache

// Cache size limits (in MB)
const STATIC_CACHE_LIMIT_MB = 50;
const DYNAMIC_CACHE_LIMIT_MB = 20;

const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './rive-logo.js',
    './gpi.riv',
    './manifest.json',
    './offline.html',
    'https://unpkg.com/@rive-app/canvas@2.10.3', // Consider local hosting or specific version
    'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js',
    'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css',
    'https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js'
];

const performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkErrors: 0,
    lastUpdate: Date.now()
};

async function getCacheSize(cache) {
    const keys = await cache.keys();
    let size = 0;
    for (const request of keys) {
        const response = await cache.match(request);
        if (response) { // Ensure response exists before trying to get blob
            const blob = await response.blob();
            size += blob.size;
        }
    }
    return size / (1024 * 1024); // Convert to MB
}

async function trimCache(cacheName, limitMB) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    let currentSizeMB = 0;
    const itemsWithSizeAndDate = [];

    for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
            const blob = await response.blob();
            const itemSizeMB = blob.size / (1024 * 1024);
            let itemDate = 0;
            if (response.headers.has('date')) {
                itemDate = new Date(response.headers.get('date')).getTime();
            }
            itemsWithSizeAndDate.push({ request, size: itemSizeMB, date: itemDate });
            currentSizeMB += itemSizeMB;
        }
    }

    if (currentSizeMB > limitMB) {
        console.log(`Service Worker: Cache ${cacheName} size (${currentSizeMB.toFixed(2)}MB) exceeds limit (${limitMB}MB). Trimming...`);
        // Sort items: oldest first (those with no date header will be considered oldest)
        itemsWithSizeAndDate.sort((a, b) => a.date - b.date);

        for (const item of itemsWithSizeAndDate) {
            if (currentSizeMB <= limitMB) break; // Stop if under limit
            await cache.delete(item.request);
            currentSizeMB -= item.size;
            console.log(`Service Worker: Trimmed ${item.request.url} from ${cacheName}. New size: ${currentSizeMB.toFixed(2)}MB`);
        }
    }
}


async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE]; // Only these should remain + any other active app caches
    
    await Promise.all(
        cacheNames
            .filter(name => !currentCaches.includes(name) && name.startsWith('gpi-')) // Delete old GPI-specific caches
            .map(name => {
                console.log('Service Worker: Deleting old cache:', name);
                return caches.delete(name);
            })
    );
    
    // Trim current caches if they exceed limits
    await trimCache(STATIC_CACHE, STATIC_CACHE_LIMIT_MB);
    await trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT_MB);
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Service Worker: Static cache installation failed:', error);
            })
            .then(() => self.skipWaiting()) // Activate new SW immediately
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(), // Take control of open clients
            cleanOldCaches()      // Clean up old caches and trim current ones
        ]).then(() => console.log('Service Worker: Activated and caches cleaned.'))
    );
});

self.addEventListener('fetch', event => {
    // Skip caching for local development if not desired, but can be useful too.
    // if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    //     return fetch(event.request); // Always go to network for local
    // }

    // For same-origin requests (your assets), try cache first, then network.
    // For cross-origin (CDNs), network first then cache is often safer for updates,
    // but here static assets include CDNs, implying cache-first for them too.
    if (STATIC_ASSETS.some(assetUrl => event.request.url.endsWith(assetUrl.substring(assetUrl.lastIndexOf('/') + 1))) || event.request.url.startsWith(self.location.origin) ) {
       // Apply cache-busting for local assets if needed, though versioned caches handle this better.
       // const url = new URL(event.request.url);
       // if (url.origin === location.origin) {
       //     url.searchParams.set('v', CACHE_NAME); // CACHE_NAME is 'gpi-v1.4', not a cache key
       // }
       // const requestToFetch = new Request(url.toString(), event.request);

        event.respondWith(
            caches.match(event.request) // Use original event.request for matching
                .then(cachedResponse => {
                    if (cachedResponse) {
                        performanceMetrics.cacheHits++;
                        return cachedResponse;
                    }
                    
                    performanceMetrics.cacheMisses++;
                    return fetch(event.request).then(networkResponse => { // Use original event.request for fetching
                        if (!networkResponse || networkResponse.status !== 200) {
                             // For non-200 responses, don't cache unless it's a specific error type you want to cache.
                            if (networkResponse.status !== 0) { // status 0 can be opaque responses
                                console.warn(`Service Worker: Network response for ${event.request.url} was not ok: ${networkResponse.status}`);
                            }
                            return networkResponse; // Return bad response directly without caching
                        }

                        const responseToCache = networkResponse.clone();
                        // Determine if it's a static or dynamic asset based on the request URL
                        // More robust: check if URL is in STATIC_ASSETS or if it's a same-origin asset of expected types
                        const isStaticAsset = STATIC_ASSETS.includes(event.request.url) || 
                                              (event.request.url.startsWith(self.location.origin) && 
                                              /\.(css|js|json|riv|png|jpg|jpeg|gif|woff|woff2|ico)$/i.test(event.request.url));

                        const cacheToOpen = isStaticAsset ? STATIC_CACHE : DYNAMIC_CACHE;
                        
                        caches.open(cacheToOpen).then(cache => {
                            cache.put(event.request, responseToCache) // Use original event.request as key
                                .catch(err => console.error(`Service Worker: Failed to cache ${event.request.url}`, err));
                        });
                        return networkResponse;
                    });
                }).catch(error => {
                    performanceMetrics.networkErrors++;
                    console.error('Service Worker: Fetch failed; returning offline page or basic response.', error);
                    if (event.request.mode === 'navigate') {
                        return caches.match('./offline.html');
                    }
                    return new Response('Network error occurred.', {
                        status: 408,
                        statusText: "Network error",
                        headers: { 'Content-Type': 'text/plain' }
                    });
                })
        );
    } else {
        // For non-static, cross-origin requests, typically "network falling back to cache" or "network only"
        // Or if they are dynamic content that shouldn't be aggressively cached.
        // Here, we'll assume they are dynamic and cache them in DYNAMIC_CACHE.
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        // Try to serve from DYNAMIC_CACHE if network fails for these
                        return caches.match(event.request).then(cachedResponse => {
                            if (cachedResponse) return cachedResponse;
                            // If not in cache and network failed, return original bad network response
                            if (networkResponse.status !== 0) {
                                console.warn(`Service Worker: Network response for ${event.request.url} was not ok: ${networkResponse.status}`);
                            }
                            return networkResponse;
                        });
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(event.request, responseToCache)
                            .catch(err => console.error(`Service Worker: Failed to cache dynamic asset ${event.request.url}`, err));
                    });
                    return networkResponse;
                })
                .catch(error => {
                    performanceMetrics.networkErrors++;
                    console.error('Service Worker: Fetch failed for dynamic/cross-origin; trying cache, then offline.', error);
                    return caches.match(event.request).then(cachedResponse => {
                        if (cachedResponse) return cachedResponse;
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                        return new Response('Network error occurred.', {
                            status: 408,
                            statusText: "Network error",
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
                })
        );
    }
});


setInterval(() => {
    const now = Date.now();
    const timeElapsed = (now - performanceMetrics.lastUpdate) / 1000;
    
    if ((performanceMetrics.cacheHits + performanceMetrics.cacheMisses) > 0) {
        console.log('Service Worker Performance Metrics (last ' + timeElapsed.toFixed(1) + 's):', {
            cacheHits: performanceMetrics.cacheHits,
            cacheMisses: performanceMetrics.cacheMisses,
            networkErrors: performanceMetrics.networkErrors,
            hitRate: (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1) + '%'
        });
    }
    
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
    performanceMetrics.networkErrors = 0;
    performanceMetrics.lastUpdate = now;
}, 60000);