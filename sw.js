const CACHE = 'mundofutbol-v1';
const CORE = [
    '/manifest.json',
    '/favicon.png',
    '/favicon.ico',
    '/teams-logos.js?v=1'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(CORE))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        ))
    );
});

self.addEventListener('fetch', e => {
    // Solo interceptar peticiones a nuestro propio origen
    if (e.request.url.startsWith(self.location.origin)) {
        const url = new URL(e.request.url);
        // HTML: siempre buscar en red primero
        if (url.pathname === '/' || url.pathname.endsWith('.html')) {
            e.respondWith(
                fetch(e.request)
                    .then(r => {
                        const clone = r.clone();
                        caches.open(CACHE).then(c => c.put(e.request, clone));
                        return r;
                    })
                    .catch(() => caches.match(e.request))
            );
            return;
        }
        // El resto de recursos propios: cache primero
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});
