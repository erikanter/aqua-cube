const CACHE_NAME = 'aqua-cube-v8';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-v2.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;

  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  // HTML/navigation is always checked against the network first.
  // This prevents stale app versions after a GitHub Pages deployment.
  if(request.mode === 'navigate' || request.destination === 'document'){
    event.respondWith((async()=>{
      try{
        const fresh = await fetch(request, {cache:'no-store'});
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      }catch(e){
        return caches.match('./index.html');
      }
    })());
    return;
  }

  // Other local assets: network first, then cached fallback.
  event.respondWith((async()=>{
    try{
      const fresh = await fetch(request, {cache:'no-store'});
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
      return fresh;
    }catch(e){
      return (await caches.match(request)) || Response.error();
    }
  })());
});
