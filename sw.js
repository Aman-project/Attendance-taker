const CACHE_NAME = 'ats-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/favicon.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/logo_full.png', // Fallback
    // External CDN links might not be cached by default in all strategies, but let's try
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
