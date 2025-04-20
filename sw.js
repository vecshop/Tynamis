const CACHE_NAME = "tynamis-v2"; // Update cache name dengan versi baru
const APP_VERSION = "2.0.0"; // Tambahkan versi aplikasi

const urlsToCache = [
  "/",
  "/index.html",
  "/tren.html",
  "/wishlist.html",
  "/settings.html",
  "/js/income.js",
  "/js/tren.js",
  "/js/wishlist.js",
  "/js/settings.js",
  "/js/themeManager.js",
  "/js/indexWishlist.js",
  "/manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/apexcharts",
  "/income_tracker_icons/512.png",
  "/income_tracker_icons/win_icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  // Immediately activate new service worker
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tell clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "APP_UPDATED",
            version: APP_VERSION,
          });
        });
      }),
    ])
  );
});
