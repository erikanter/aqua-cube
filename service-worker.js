const CACHE='aqua-cube-v0.14.8';
const ASSETS=[
 './','./index.html',
  './storm-bg.svg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon-v2.png',
 './cube-level-0-final.png','./cube-level-25-final.png','./cube-level-50-final.png','./cube-level-75-final.png','./cube-level-100-final.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET') return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',
  './storm-bg.svg',copy));return r}).catch(()=>caches.match('./index.html')));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r}).catch(()=>cached)));
});
