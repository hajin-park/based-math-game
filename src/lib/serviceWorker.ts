/**
 * Service worker registration (see public/sw.js for the caching strategy).
 *
 * Call `registerServiceWorker()` once from the app entry point. It:
 * - registers /sw.js in production builds only (a worker in `vite dev` would
 *   fight with HMR), bypassing the HTTP cache for the worker script itself;
 * - checks for a new worker when the tab becomes visible again;
 * - never force-reloads a page that is in use: a new worker only changes
 *   caching, the running page keeps working;
 * - recovers from "Failed to fetch dynamically imported module" after a
 *   deploy by reloading once (Vite's `vite:preloadError`).
 */
const RELOAD_FLAG = "bmg.chunkReloadAt";

function recoverFromStaleChunks() {
  window.addEventListener("vite:preloadError", (event) => {
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(RELOAD_FLAG)) || 0;
    } catch {
      // Storage unavailable; fall through and reload.
    }
    // Avoid reload loops if the asset is genuinely missing.
    if (Date.now() - last < 10_000) return;
    try {
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    } catch {
      // Ignore.
    }
    event.preventDefault();
    window.location.reload();
  });
}

export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  recoverFromStaleChunks();
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => undefined);
          }
        });
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
