/* MANIFEST is injected by the build. Content hashes isolate revisions without
 * deleting an older working offline game while an update is incomplete. */
const CACHE='velocity-offline-v1',entries=new Map(MANIFEST.entries.map(e=>[e.url,e])),pending=new Map();
const key=e=>new URL('/__game_cache__/'+e.hash,self.location.origin).href;
let saving=false,cancelled=false;
async function notify(data){for(const client of await self.clients.matchAll({includeUncontrolled:true}))client.postMessage({type:'GAME_CACHE',...data});}
async function obtain(e){
 const cache=await caches.open(CACHE),cached=await cache.match(key(e));if(cached)return cached;
 if(pending.has(e.hash))return (await pending.get(e.hash)).clone();
 const task=(async()=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),90000);
  try{
   const response=await fetch(e.url,{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('下载失败：'+e.url);
   const bytes=await response.arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
   if(hash!==e.hash)throw Error('资源版本已更新，请刷新页面后重试');
   const headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');
   const result=new Response(bytes,{status:200,headers});
   // Browsing remains usable if storage is unavailable; a full pack explicitly verifies it.
   try{await cache.put(key(e),result.clone());}catch{}
   return result;
  }finally{clearTimeout(timeout);}
 })();pending.set(e.hash,task);
 try{return (await task).clone();}finally{pending.delete(e.hash);}
}
async function status(){const cache=await caches.open(CACHE);let bytes=0,count=0;for(const e of MANIFEST.entries)if(await cache.match(key(e))){bytes+=e.bytes;count++;}return {bytes,count,total:MANIFEST.entries.reduce((s,e)=>s+e.bytes,0),files:MANIFEST.entries.length,version:MANIFEST.version};}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 // Cache only the application shell on installation, not every car before entry.
 for(const e of MANIFEST.entries.filter(e=>/\.(html|js|css)$/.test(e.url)&&!e.url.startsWith('/draco/')))await obtain(e);
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;
 const path=url.pathname==='/'?'/index.html':url.pathname,e=entries.get(path);if(!e)return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),2500);try{const response=await fetch(event.request,{signal:controller.signal});if(response.ok)return response;}finally{clearTimeout(timer);}}catch{}return obtain(e);})());
 }else event.respondWith(obtain(e));
});
self.addEventListener('message',event=>{
 if(event.data?.type==='CACHE_STATUS')event.waitUntil(status().then(s=>notify({...s,saving})));
 if(event.data?.type==='CACHE_STOP'){cancelled=true;}
 if(event.data?.type==='CACHE_GAME'&&!saving)event.waitUntil((async()=>{
  saving=true;cancelled=false;
  try{
   await notify({...await status(),saving:true});
   let next=0;const ordered=[...MANIFEST.entries].sort((a,b)=>Number(!a.url.startsWith('/models/'))-Number(!b.url.startsWith('/models/')));
   const work=async()=>{while(next<ordered.length&&!cancelled){const e=ordered[next++];await obtain(e);if(!await (await caches.open(CACHE)).match(key(e)))throw Error('本机存储不足，无法保存完整游戏');await notify({...await status(),saving:true});}};
   const results=await Promise.allSettled([work(),work()]);const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
   await notify({...await status(),saving:false,paused:cancelled});
  }catch(error){await notify({...await status(),saving:false,error:String(error.message||error)});}
  finally{saving=false;}
 })());
});
