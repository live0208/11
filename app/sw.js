self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('guangyu-v1').then(cache =>
      cache.addAll([
        'index.html',
        'css/style.css',
        'js/app.js',
        'manifest.json'
      ])
    )
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
