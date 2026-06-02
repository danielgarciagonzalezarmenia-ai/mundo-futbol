importScripts('https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.1/firebase-app-compat.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.1/firebase-messaging-compat.min.js');


// Configuración SDK de Firebase (debe coincidir con la de la app)
const firebaseConfig = {
  apiKey: "AIzaSyAIXqu1LL6G8LsdtKNgbh6VoGnVdTakMns",
  authDomain: "mundo-futbol-39711.firebaseapp.com",
  projectId: "mundo-futbol-39711",
  storageBucket: "mundo-futbol-39711.firebasestorage.app",
  messagingSenderId: "99443819214",
  appId: "1:99443819214:web:f7fe9565cf4c6168b6c69f",
  measurementId: "G-JQCJ7293NJ"
};

// Inicializar Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Controlar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Notificación recibida en segundo plano:', payload);
  
  const title = payload.notification.title || "¡Partido en Vivo!";
  const options = {
    body: payload.notification.body || "Mira la transmisión aquí.",
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(title, options);
});

// Manejar clics en las notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta, redirigirla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          return client.navigate(urlToOpen).then(c => c.focus());
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

const CACHE = 'mundofutbol-v2'; // Bumped cache key for service worker refresh
const CORE = [
    '/manifest.json',
    '/favicon.png',
    '/favicon.ico',
    '/teams-logos.js?v=400'
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
