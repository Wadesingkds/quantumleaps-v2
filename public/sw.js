// ponytail: minimal SW — network-first for auth/supabase, cache shell
const CACHE_NAME = "quantum-v2";
const SHELL = ["/", "/app", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Never cache auth, supabase, or _next chunks
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/_next") ||
    url.hostname.includes("supabase")
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first for everything else
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
