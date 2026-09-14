/** Start with the cover; never delay entry or request persistent-storage permission. */
export function startOfflineCache(){
 if(!('serviceWorker' in navigator)||!import.meta.env.PROD)return;
 let registration:ServiceWorkerRegistration|undefined;
 const save=(worker:ServiceWorker|null|undefined)=>worker?.postMessage({type:'CACHE_GAME',background:true});
 const resume=()=>{save(navigator.serviceWorker.controller||registration?.active);save(registration?.waiting);};
 navigator.serviceWorker.addEventListener('controllerchange',resume);
 window.addEventListener('online',resume);
 void navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(async reg=>{
  registration=reg;
  // Prepare an installed update too, without interrupting the current game.
  const watch=()=>{const worker=reg.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed')save(worker);});};
  reg.addEventListener('updatefound',watch);watch();
  const ready=await navigator.serviceWorker.ready;save(ready.active);save(reg.waiting);
 }).catch(()=>{/* A later visit can retry; the game continues normally. */});
}
