// 모치네 포차 service worker: pages always fresh from the network (falls back to cache offline),
// hashed scripts and pictures cached for fast loading. Music (/audio/) is never cached here.
const C = 'pocha-2611081402'
self.addEventListener('install', e => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())))
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url)
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/audio/')) return
  const page = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html')
  if (page) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r }).catch(() => caches.match(e.request)))
    return
  }
  if (/\/assets\/|\/games\/pocha\/|\.png$|\.webp$/.test(u.pathname)) {
    // hashed scripts never change: cache first. Pictures can be replaced under the same name: show the cached one, refresh it in the background
    const net = () => fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)) } return r })
    if (u.pathname.includes('/assets/')) { e.respondWith(caches.match(e.request).then(m => m || net())); return }
    e.respondWith(caches.match(e.request).then(m => { const f = net().catch(() => m); return m || f }))
  }
})
