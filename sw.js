const CACHE = 'vocatopia-v15';
const ASSETS = ['/', '/index.html', '/styles.css', '/script.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/socket.io/')) return;

  // 音頻、API 全部直接走網路（依賴 HTTP Cache-Control 快取，不存入 SW）
  // SW 存音頻會大量寫入 IndexedDB 導致記憶體爆炸
  if (
    e.request.url.includes('/audio/') ||
    e.request.url.includes('.mp3') ||
    e.request.url.includes('/api/')
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // HTML、JS 永遠走網路確保最新版
  if (
    e.request.url.endsWith('/') ||
    e.request.url.endsWith('.html') ||
    e.request.url.endsWith('.js')
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
