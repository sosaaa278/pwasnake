const CACHE_NAME = "snake-pwa-cachev4";

const FILES = [
    "index.html",
    "style.css",
    "game.js",
    "manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
    );
});

self.addEventListener("fetch", event => {

    if (event.request.url.includes("stripe")) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(
            response => response || fetch(event.request)
        )
    );
});