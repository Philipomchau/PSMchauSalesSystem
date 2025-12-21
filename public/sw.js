self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
    // Add offline caching strategy here if needed
    // For now, it's a pass-through to satisfy PWA requirements
    event.respondWith(fetch(event.request));
});
