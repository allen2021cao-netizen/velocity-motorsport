import shell from './shell.html?raw';
import './legacy.css';
import './style.css';
import './menu.css';
import {startSplash} from './splash';
document.querySelector('#app')!.innerHTML=shell;
startSplash();
import('./runtime.js').catch(error=>{
 console.error(error);
 const el=document.querySelector<HTMLElement>('#loadErr');
 if(el){el.style.display='flex';el.textContent='3D 引擎加载失败。请开启浏览器硬件加速，使用支持 WebGL 2 的浏览器后刷新。';}
});
