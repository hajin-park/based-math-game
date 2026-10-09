// Service worker: offline fallback + fast repeat loads, without ever pinning
// users to a stale build.
//
// - Navigations (HTML): network first. The fresh index.html is copied into the
//   cache and only served when the network is unavailable.
// - The few un-hashed files index.html needs before the app boots
//   (theme bootstrap, icon, manifest): network first, cached copy offline.
// - /assets/** (hashed, immutable Vite output): cache first. This cache is
//   kept across deploys (trimmed to MAX_ASSETS) so tabs still running an older
//   build can lazy-load the chunks they reference after a deploy removed them.
// - Everything else, including all Firebase / Google API traffic and other
//   origins: not intercepted.
//
// BUILD_VERSION is replaced at build time by scripts/update-sw-version.js so
// every deploy installs a new worker.
const BUILD_VERSION = "__BUILD_TIMESTAMP__";
const PAGES_CACHE = `bmg-pages-${BUILD_VERSION}`;
const ASSETS_CACHE = "bmg-assets-v1";
const MAX_ASSETS = 200;
const OFFLINE_URL = "/index.html";
const SHELL_FILES = ["/theme-init.js", "/icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) =>
        // One by one: a missing shell file must not cost us index.html.
        Promise.all(
          [OFFLINE_URL, ...SHELL_FILES].map((url) =>
            cache
              .add(new Request(url, { cache: "reload" }))
              .catch(() => undefined),
          ),
        ),
      )
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== PAGES_CACHE && name !== ASSETS_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trimAssets() {
  const cache = await caches.open(ASSETS_CACHE);
  const keys = await cache.keys();
  // Cache keys are returned in insertion order: drop the oldest.
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - MAX_ASSETS))
      .map((k) => cache.delete(k)),
  );
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const type = response.headers.get("content-type") || "";
    if (response.ok && type.includes("text/html")) {
      const cache = await caches.open(PAGES_CACHE);
      await cache.put(OFFLINE_URL, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(OFFLINE_URL);
    return (
      cached ||
      new Response("You are offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function handleShellFile(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { cacheName: PAGES_CACHE });
    if (cached) return cached;
    throw error;
  }
}

async function handleAsset(event) {
  const cached = await caches.match(event.request, { cacheName: ASSETS_CACHE });
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    event.waitUntil(
      caches
        .open(ASSETS_CACHE)
        .then((cache) => cache.put(event.request, copy))
        .then(trimAssets)
        .catch(() => undefined),
    );
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Only same-origin requests; Firebase/Google APIs go straight to the network.
  if (url.origin !== self.location.origin) return;
  // Firebase Hosting reserved URLs (e.g. /__/auth/handler) are never cached.
  if (url.pathname.startsWith("/__/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (SHELL_FILES.includes(url.pathname)) {
    event.respondWith(handleShellFile(request));
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(handleAsset(event));
  }
});
