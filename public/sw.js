// Offline support: the app shell is cached on install, everything else
// (fonts, icons) is cached the first time it loads. Decoding still needs
// the network; saved plans, examples and share links work offline.
const CACHE = 'decoder-v1'
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'samples.js', 'icon.svg', 'manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).pathname.startsWith('/api/')) return
  // Network first so updates show up right away; fall back to the cache offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
  )
})
