// Minimal service worker: lets the dashboard be installed on a phone. It only caches the page shell;
// data (/api/stats) always goes to the network, never cached.
const C = 'stats-shell-v1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(['stats.html', 'stats.webmanifest', 'stats-icon-192.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !/\/admin\/stats/.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
