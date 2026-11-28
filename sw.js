const CACHE = 'trainer-v108';
const SHELL = ['./', 'index.html', 'style.css', 'i18n.js', 'app.js', 'body.js', 'meas.js', 'extra.js', 'ach.js', 'more.js', 'nutrition.js', 'data.js', 'articles.js', 'manifest.webmanifest', 'icons/180.png', 'icons/192.png', 'icons/512.png', 'icons/512m.png'];
const CODE = /\.(html|js|css|webmanifest)$|\/$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate' || CODE.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(async cache => {
      try { const res = await fetch(req, { cache: 'no-cache' }); if (res.ok) cache.put(req, res.clone()); return res; }
      catch (err) { return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || new Response('', { status: 504 }); }
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return res; } catch (err) { return new Response('', { status: 504 }); }
  }));
});
