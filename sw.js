/* FitcoachAI service worker — versioned cache; bump VERSION on every release. */
const VERSION='fcai-v0.9.1';
const LOCAL=["./","index.html","manifest.json","js/app.js","js/config.js","js/engine.js","js/v05.js","js/v06.js","js/v07.js","vendor/three/build/three.module.min.js","vendor/three/examples/jsm/loaders/GLTFLoader.js","vendor/three/examples/jsm/controls/OrbitControls.js","vendor/three/examples/jsm/utils/BufferGeometryUtils.js","assets/coach-mannequin.glb","icons/apple-touch-icon.png","icons/icon-180.png","icons/icon-192.png","icons/icon-32.png","icons/icon-512.png","icons/maskable-192.png","icons/maskable-512.png","vendor/rich-body-highlighter/bodies/female-back-dark.webp","vendor/rich-body-highlighter/bodies/female-back-light.webp","vendor/rich-body-highlighter/bodies/female-front-dark.webp","vendor/rich-body-highlighter/bodies/female-front-light.webp","vendor/rich-body-highlighter/bodies/male-back-dark.webp","vendor/rich-body-highlighter/bodies/male-back-light.webp","vendor/rich-body-highlighter/bodies/male-front-dark.webp","vendor/rich-body-highlighter/bodies/male-front-light.webp","vendor/rich-body-highlighter/chunk-BIYLJBFN.js","vendor/rich-body-highlighter/chunk-CGKLCEZK.js","vendor/rich-body-highlighter/index.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(async c=>{await c.addAll(LOCAL)}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('fcai-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const same=u.origin===self.location.origin;if(!same)return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:same})||(r.mode==='navigate'?await c.match('./'):null);if(hit)return hit;
    try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}
    catch(err){if(r.mode==='navigate'){const idx=await c.match('index.html');if(idx)return idx}throw err}}))});
