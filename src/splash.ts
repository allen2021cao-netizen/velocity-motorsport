export function startSplash(){
 const splash=document.getElementById('launchCover')!,image=document.getElementById('launchImage') as HTMLImageElement;
 const app=document.getElementById('app')!;app.inert=true;
 // Count the hold from decoded artwork, so slow connections still get the full cover.
 const ready=image.decode().catch(()=>{});
 void ready.then(()=>{splash.dataset.shownAt=String(performance.now());splash.classList.add('ready');setTimeout(()=>{splash.classList.add('leaving');app.inert=false;setTimeout(()=>splash.remove(),250);},1500);});
}
