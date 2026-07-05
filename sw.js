// Bump this version on every release so clients pick up new caches.
// The old cache is deleted on activate.
const SW_VERSION = 'v2.0.0';
const APP_SHELL_CACHE = `pedalvault-shell-${SW_VERSION}`;
const STATIC_CACHE = `pedalvault-static-${SW_VERSION}`;

// App shell: served network-first so deployed updates reach users promptly,
// with the cached copy as an offline fallback.
const APP_SHELL_URLS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './rive-logo.js',
    './manifest.json',
    './offline.html'
];

// Static assets: served cache-first since they effectively never change.
const STATIC_PRECACHE_URLS = [
    './favicon.ico',
    './gpi.riv'
];

// Paths (relative to the SW scope) treated as long-lived static assets
// when requested at runtime (fonts, icons, Rive animation).
const STATIC_RUNTIME_PATTERN = /\/(fonts|icons)\/|\.(woff2?|png|ico|svg|riv)$/;

// Resolved pathnames of the app shell files, for request matching
const APP_SHELL_PATHS = new Set(
    APP_SHELL_URLS.map(url => new URL(url, self.location.href).pathname)
);

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const shellCache = await caches.open(APP_SHELL_CACHE);
            // Core shell files must all cache successfully
            await shellCache.addAll(APP_SHELL_URLS);

            // Static extras are best-effort: a missing icon shouldn't
            // prevent the new service worker from installing
            const staticCache = await caches.open(STATIC_CACHE);
            await Promise.allSettled(
                STATIC_PRECACHE_URLS.map(url => staticCache.add(url))
            );
            // Do NOT skipWaiting() here: the page prompts the user and
            // sends SKIP_WAITING when they choose to reload
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(name => name !== APP_SHELL_CACHE && name !== STATIC_CACHE)
                    .map(name => caches.delete(name))
            );
            await self.clients.claim();
        })()
    );
});

// Network-first: try the network, update the cache on success,
// fall back to the cache when offline
async function networkFirst(request, cacheName, offlineFallbackUrl) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
        if (cached) {
            return cached;
        }
        if (offlineFallbackUrl) {
            const fallback = await caches.match(offlineFallbackUrl);
            if (fallback) {
                return fallback;
            }
        }
        throw error;
    }
}

// Cache-first: serve from cache, fetch and cache on miss
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (response && response.status === 200) {
        cache.put(request, response.clone());
    }
    return response;
}

self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Let external resources (CDNs, analytics) load normally
    if (url.origin !== location.origin) {
        return;
    }

    // Navigations: network-first, falling back to the cached app shell,
    // then the offline page (the host rewrites all routes to index.html)
    if (request.mode === 'navigate') {
        event.respondWith(
            networkFirst(request, APP_SHELL_CACHE, './offline.html')
        );
        return;
    }

    // App shell files: network-first so code updates reach users promptly
    if (APP_SHELL_PATHS.has(url.pathname)) {
        event.respondWith(networkFirst(request, APP_SHELL_CACHE));
        return;
    }

    // Long-lived static assets: cache-first
    if (STATIC_RUNTIME_PATTERN.test(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Everything else same-origin: network-first with cache fallback
    event.respondWith(networkFirst(request, STATIC_CACHE));
});

// The page sends SKIP_WAITING when the user accepts the update prompt
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
