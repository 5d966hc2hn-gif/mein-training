const CACHE = 'mein-training-v1-2-0';
const FILES = ['./', './index.html', './style.css', './app.js', './version.json', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('mein-training-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Immer zuerst Netzwerk; gespeicherte Dateien dienen nur als Offline-Fallback.
  event.respondWith((async()=>{
    try{
      const response=await fetch(req,{cache:'no-store'});
      if(response.ok){
        const cache=await caches.open(CACHE);
        // Für query-basierte Aktualisierungsaufrufe keinen Eintrag pro Zeitstempel anlegen.
        const normalized=new URL(req.url);
        normalized.search='';
        if(normalized.pathname.startsWith(new URL(self.registration.scope).pathname)){
          await cache.put(normalized.toString(),response.clone());
        }
      }
      return response;
    }catch(err){
      const url=new URL(req.url);url.search='';
      return (await caches.match(url.toString())) || (req.mode==='navigate' ? await caches.match(new URL('./index.html',self.registration.scope).toString()) : Response.error());
    }
  })());
});
