const CACHE_NAME = 'writevibe-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
];

// Dev-only paths that must NEVER be cached (Vite serves these fresh)
const DEV_PATH_PATTERNS = [
  /\/src\//,
  /\/node_modules\/\.vite\//,
  /\/@vite\//,
  /\/@react-refresh/,
  /\/@fs\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin (except base44 logo)
  if (url.origin !== location.origin && !url.href.startsWith('https://base44.com')) return;

  // Skip API / backend function calls — never cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) return;

  // Skip Vite dev paths and HMR chunks — always go to network
  if (DEV_PATH_PATTERNS.some(re => re.test(url.pathname))) return;

  // Skip hashed JS/CSS chunks in dev (they change on every HMR); only cache in prod
  const isJsOrCss = /\.(js|css)(\?|$)/.test(url.pathname);
  if (isJsOrCss && url.pathname.includes('/assets/')) {
    // Production hashed assets — cache-first is safe
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Navigation requests: network-first, fallback to cached index, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(r => r || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Other static assets (fonts, images, svg): cache-first, update in background
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
