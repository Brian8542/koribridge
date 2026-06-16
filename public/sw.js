const CACHE_NAME = "koribridge-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const { title, body, url, icon } = data;
  event.waitUntil(
    self.registration.showNotification(title || "KoriBridge", {
      body: body || "",
      icon: icon || "/logo192.png",
      badge: "/favicon.ico",
      data: { url: url || "/home" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const match = windowClients.find((c) => c.url.includes(url));
      if (match) return match.focus();
      return clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Supabase API, 번역 API는 캐시하지 않음
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("mymemory")
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // HTML 탐색 요청만 캐시에 저장 (앱 셸)
        if (event.request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
