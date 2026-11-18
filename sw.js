/* ============================================================
   아트다락방 — 오프라인·홈 화면 추가용 서비스 워커
   ------------------------------------------------------------
   · 사이트를 고치면 바로 최신이 보이도록 '네트워크 먼저'로 받고,
     인터넷이 없을 때만 저장해 둔 화면을 보여 줍니다.
   · https 또는 localhost 에서만 동작합니다 (file:// 에서는 꺼져 있어요).
   ============================================================ */
const CACHE = 'artdarak-v10';
const CORE = [
  './',
  './index.html',
  './gallery.html',
  './work.html',
  './register.html',
  './darakbang.html',
  './soon.html',
  './assets/styles.css',
  './assets/app.js',
  './assets/store.js',
  './assets/seed.js',
  './assets/supabase-config.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/avatars/seoyun-f.webp',
  './images/avatars/seoyun-m.webp',
  './images/avatars/haemil-f.webp',
  './images/avatars/haemil-m.webp',
  './images/avatars/momo-f.webp',
  './images/avatars/momo-m.webp',
  './images/avatars/ian-f.webp',
  './images/avatars/ian-m.webp',
  './images/avatars/haon-f.webp',
  './images/avatars/haon-m.webp',
  './images/avatars/doyun-f.webp',
  './images/avatars/doyun-m.webp',
  './images/room-3d/seoyun-f.webp',
  './images/room-3d/seoyun-m.webp',
  './images/room-3d/haemil-f.webp',
  './images/room-3d/haemil-m.webp',
  './images/room-3d/momo-f.webp',
  './images/room-3d/momo-m.webp',
  './images/room-3d/ian-f.webp',
  './images/room-3d/ian-m.webp',
  './images/room-3d/haon-f.webp',
  './images/room-3d/haon-m.webp',
  './images/room-3d/doyun-f.webp',
  './images/room-3d/doyun-m.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE.map((url) => new Request(url, { cache: 'reload' }))))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      }))
  );
});
