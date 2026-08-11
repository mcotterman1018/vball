/* CourtIQ service worker — lets the scorebook open and run with no connection.
 *
 * Strategy:
 *  - /_next/static/** and fonts are content-hashed and immutable -> cache first.
 *  - Page navigations -> network first (so coaches see fresh data when online),
 *    falling back to the last cached copy of that page, then to a generic
 *    offline shell. This is what lets a bookkeeper open the book at a gym
 *    with no signal, as long as they've loaded it once before.
 *  - Everything else (Supabase API calls) -> straight to the network. The app
 *    handles failure itself by reading its local cache and queueing saves.
 */

const VERSION = "courtiq-v1";
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Best-effort: never block install if one of these can't be fetched.
      await Promise.allSettled([
        cache.add(OFFLINE_URL),
        cache.add("/manifest.webmanifest"),
        cache.add("/icon-192.png"),
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

const isImmutable = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icon-") ||
  url.pathname === "/apple-touch-icon.png";

// Only keep offline copies of pages that aren't tied to a signed-in account.
// A coach's pages could otherwise be read from cache by whoever holds the
// device, and a stale copy is misleading anyway.
const isCacheablePage = (url) =>
  url.pathname.startsWith("/book/") || url.pathname === "/offline" || url.pathname === "/";

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle our own origin; Supabase and anything else goes to the network.
  if (url.origin !== self.location.origin) return;

  if (isImmutable(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) (await caches.open(SHELL)).put(req, res.clone());
        return res;
      })()
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok && isCacheablePage(url)) (await caches.open(PAGES)).put(req, res.clone());
          return res;
        } catch {
          const cached = await caches.match(req, { ignoreSearch: false });
          if (cached) return cached;
          const ignoringQuery = await caches.match(req, { ignoreSearch: true });
          if (ignoringQuery) return ignoringQuery;
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
  }
});

// Let the page ask a waiting worker to take over immediately.
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
