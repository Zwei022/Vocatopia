const CACHE = 'vocatopia-v136';
const ASSETS = ['/', '/index.html', '/styles.css', '/script.js', '/auth.js', '/manifest.json', '/fonts/Yozai-Regular-subset.woff2', '/game/grammar.js', '/game/grammar.css', '/game/tetris/characters.js', '/game/tetris/gacha.js', '/game/tetris/engine.js', '/game/tetris/game.js', '/game/tetris/vocab.js', '/game/tetris/quiz.js', '/game/tetris/sfx.js', '/game/tetris/tetris.css'];

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
  const url = e.request.url;
  if (url.includes('/socket.io/')) return;

  // 音頻、API：直接走網路（不存入 SW，避免 IndexedDB 爆量）
  if (url.includes('/audio/') || url.includes('.mp3') || url.includes('/api/')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // HTML、JS、CSS：network-first，永遠確保最新版（離線才退回快取）
  // 註：先前 .css 漏列於此，導致樣式被 cache-first 卡在舊版，已修正。
  if (
    url.endsWith('/') ||
    url.endsWith('.html') ||
    url.endsWith('.js') ||
    url.endsWith('.css')
  ) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 其餘靜態資源（圖片等）：stale-while-revalidate
  // 先回快取（速度快），同時背景抓最新存入快取，下次即為新版 → 不會永遠卡在舊圖
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res && res.status === 200) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
