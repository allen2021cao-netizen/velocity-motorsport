export function mountOffline(){
 const panel=document.createElement('section');panel.id='offlinePack';panel.innerHTML='<strong>本地游戏包</strong><p id="offlineStatus" role="status">正在检查本机资源…</p><progress max="100" value="0"></progress><button id="saveOffline" disabled>保存完整离线游戏</button><button id="stopOffline" hidden>暂停保存</button><small>首次需要下载。保存完成后可断网打开此网址；清除浏览器数据会移除本地资源。模型首次解压仍需片刻。</small>';
 document.querySelector('#carPanel')!.append(panel);
 const info=panel.querySelector('p')!,save=panel.querySelector<HTMLButtonElement>('#saveOffline')!,stop=panel.querySelector<HTMLButtonElement>('#stopOffline')!,progress=panel.querySelector('progress')!;
 if(!('serviceWorker'in navigator)||!import.meta.env.PROD){info.textContent=import.meta.env.PROD?'此浏览器不支持离线保存，请使用新版 Chrome、Edge 或 Safari。':'离线保存将在正式版中启用';return;}
 let worker:ServiceWorker|null=null;
 navigator.serviceWorker.addEventListener('message',event=>{
  const s=event.data;if(s?.type!=='GAME_CACHE')return;
  const complete=s.count===s.files,mb=(v:number)=>(v/1048576).toFixed(1);
  progress.value=s.bytes/s.total*100;save.disabled=!!s.saving||complete;stop.hidden=!s.saving;stop.disabled=false;
  info.textContent=s.error?'保存未完成：'+s.error:complete?'已保存在本机 · 全部 13 辆车、城市与音效可离线使用':(s.saving?'正在保存':s.paused?'已暂停，可继续':'已保存')+' '+mb(s.bytes)+' / '+mb(s.total)+' MB';
  save.textContent=complete?'离线游戏已就绪':s.paused||s.error?'继续保存完整游戏':'保存完整离线游戏';
 });
 save.onclick=async()=>{if(!worker)return;save.disabled=true;info.textContent='正在保存资源，可继续选车；网络中断后可续存。';try{await navigator.storage?.persist?.();}catch{}worker.postMessage({type:'CACHE_GAME'});};
 stop.onclick=()=>{worker?.postMessage({type:'CACHE_STOP'});stop.disabled=true;info.textContent='正在暂停，保留已经下载的资源…';};
 navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(reg=>{worker=reg.active;save.disabled=false;worker?.postMessage({type:'CACHE_STATUS'});}).catch(()=>{info.textContent='离线功能暂未就绪，请联网刷新后重试。';});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{worker=navigator.serviceWorker.controller;worker?.postMessage({type:'CACHE_STATUS'});});
}
