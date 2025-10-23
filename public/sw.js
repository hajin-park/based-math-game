// Service Worker for offline support and caching
// IMPORTANT: Increment version number when deploying updates to force cache refresh
const CACHE_NAME = "based-math-game-v5";
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json"];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log("Cache addAll error:", err);
      });
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - use network-first strategy for JS/CSS, cache-first for others
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip Firebase and external API requests (they need real-time data)
  const url = new URL(event.request.url);
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebaseapp.com") ||
    url.hostname.includes("cloudfunctions.net")
  ) {
    return;
  }

  // Network-first strategy for JS, CSS, and HTML files (always get latest)
  const isAppAsset =
    event.request.url.endsWith(".js") ||
    event.request.url.endsWith(".mjs") ||
    event.request.url.endsWith(".css") ||
    event.request.url.endsWith(".html") ||
    event.request.url.includes("/assets/");

  if (isAppAsset) {
    // Network-first: Try network, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match("/index.html");
          });
        }),
    );
  } else {
    // Cache-first strategy for static assets (images, fonts, etc.)
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (
              !response ||
              response.status !== 200 ||
              response.type === "error"
            ) {
              return response;
            }

            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return offline page or cached response
            return caches.match("/index.html");
          });
      }),
    );
  }
});
