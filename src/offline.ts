/** Cache visited assets on demand; do not compete with the selected car or a race. */
export function startOfflineCache(){
 if(!('serviceWorker' in navigator)||!import.meta.env.PROD)return;
 // Stop a full-pack download left by an older page. Fetches still use the
 // worker's content-verified cache, including on browsers without saveData.
 const stop=()=>navigator.serviceWorker.controller?.postMessage({type:'CACHE_STOP'});
 stop();navigator.serviceWorker.addEventListener('controllerchange',stop);
 void navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{
  reg.waiting?.postMessage({type:'CACHE_STOP'});
 }).catch(()=>{/* A later visit can retry; the game continues normally. */});
}
