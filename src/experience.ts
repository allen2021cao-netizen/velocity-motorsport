/** Player-facing orientation guidance and optional performance display. */
export function mountExperience(setQuality:(value:string)=>void){
 const ipad=/iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 document.documentElement.dataset.touchDevice=ipad?'ipad':/iPhone|iPod/.test(navigator.userAgent)?'iphone':'';
 const rotate=document.createElement('aside');rotate.id='rotateHint';rotate.setAttribute('role','dialog');rotate.setAttribute('aria-label','横屏体验提示');
 rotate.innerHTML='<div><span class="rotate-icon">↻</span><h2>横屏，体验更出色</h2><p>请将手机旋转至横屏，获得更宽的赛道视野和更舒适的操控空间。</p><button>知道了，继续游戏</button></div>';
 document.body.append(rotate);let dismissed=false;
 function orientation(){rotate.hidden=dismissed||!matchMedia('(pointer: coarse) and (orientation: portrait)').matches;}
 rotate.querySelector('button')!.onclick=()=>{dismissed=true;orientation();};window.addEventListener('resize',orientation);orientation();
 const panel=document.createElement('div');panel.id='performancePanel';panel.hidden=true;
 panel.innerHTML='<button id="fpsToggle" aria-pressed="true">隐藏帧数</button><output id="fpsValue">— FPS</output><div id="fpsAdvice" role="status" hidden><span></span><button>切换画质</button><button aria-label="关闭帧率提示">×</button></div>';
 document.body.append(panel);
 const toggle=panel.querySelector<HTMLButtonElement>('#fpsToggle')!,value=panel.querySelector<HTMLOutputElement>('output')!,advice=panel.querySelector<HTMLElement>('#fpsAdvice')!;
 let show=true,seconds=0,frames=0,lowSeconds=0,cooldown=0,lastQuality='',target='balanced';
 toggle.onclick=()=>{show=!show;toggle.setAttribute('aria-pressed',String(show));toggle.textContent=show?'隐藏帧数':'显示帧数';value.hidden=!show;toggle.blur();};
 advice.querySelectorAll('button')[0].onclick=()=>{setQuality(target);advice.hidden=true;cooldown=45;lowSeconds=0;};
 advice.querySelectorAll('button')[1].onclick=()=>{advice.hidden=true;cooldown=45;};
 return {update(dt:number,active:boolean,quality:string){
  panel.hidden=!active;
  if(!active||document.hidden||dt>.25){seconds=frames=lowSeconds=0;advice.hidden=true;return;}
  if(lastQuality!==quality){lastQuality=quality;lowSeconds=0;advice.hidden=true;cooldown=8;}
  cooldown=Math.max(0,cooldown-dt);seconds+=dt;frames++;
  if(seconds<.5)return;
  const fps=frames/seconds;value.textContent=Math.round(fps)+' FPS';value.classList.toggle('slow',fps<35);
  lowSeconds=fps<35?lowSeconds+seconds:0;seconds=frames=0;
  if(lowSeconds>=5&&cooldown===0&&quality!=='low'){
   target=quality==='high'?'balanced':'low';const label=target==='balanced'?'均衡':'流畅';
   advice.querySelector('span')!.textContent='帧数持续偏低，建议调至「'+label+'」画质。';advice.querySelectorAll('button')[0].textContent='切换至'+label;advice.hidden=false;cooldown=45;lowSeconds=0;
  }
 }};
}
