export function startSplash(runtimeReady: Promise<unknown>){
 const splash=document.getElementById('launchCover')!,image=document.getElementById('launchImage') as HTMLImageElement;
 const app=document.getElementById('app')!;app.inert=true;app.style.visibility='hidden';
 const initialized=runtimeReady.then(()=>true,()=>false);
 // Count the hold from decoded artwork, so slow connections still get the full cover.
 const ready=image.decode().catch(()=>{});
 const hold=ready.then(()=>new Promise<void>(resolve=>{splash.dataset.shownAt=String(performance.now());splash.classList.add('ready');setTimeout(()=>{splash.querySelector('.cover-foot')!.textContent='正在准备 3D 车库，请稍候…';resolve();},2500);}));
 // Do not expose the unfinished legacy shell while the default car is loading.
 void Promise.all([hold,initialized]).then(([,loaded])=>{
  if(!loaded)document.getElementById('menu')!.classList.add('hidden');
  app.style.visibility='';app.inert=false;splash.classList.add('leaving');setTimeout(()=>splash.remove(),250);
 });
}
