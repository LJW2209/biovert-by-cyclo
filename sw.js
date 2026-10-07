/* Service worker Biovert: halaman tetap bisa dibuka saat sinyal lemah/offline (setelah pernah dibuka sekali). */
const CACHE='biovert-shell-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','manifest.json','icon-192.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  // data Firestore selalu langsung ke jaringan
  if(/firestore\.googleapis\.com|googleapis\.com\/google\.firestore/.test(u.host+u.pathname)) return;
  e.respondWith(fetch(r).then(res=>{ if(res&&res.ok&&(u.origin===location.origin||/gstatic\.com|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host))){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./'):undefined))));
});
