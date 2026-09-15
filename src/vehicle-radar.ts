import {PERFORMANCE_AXES,performanceScores,type VehiclePerformance} from './vehicle-performance';
const point=(i:number,r:number)=>[160+Math.cos(-Math.PI/2+i*Math.PI/3)*r,133+Math.sin(-Math.PI/2+i*Math.PI/3)*r];
const polygon=(r:number)=>PERFORMANCE_AXES.map((_,i)=>point(i,r).join(',')).join(' ');
export function updatePerformanceRadar(car:VehiclePerformance){
 let root=document.getElementById('performanceRadar');
 if(!root){
  document.querySelectorAll('#carPanel .statRow').forEach(el=>el.remove());
  root=document.createElement('section');root.id='performanceRadar';
  root.innerHTML=`<div class="radar-caption">车辆性能 <span>游戏内评分 / 100</span></div><svg viewBox="0 0 320 264" role="img" aria-labelledby="radarTitle"><title id="radarTitle"></title><defs><linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#51e6ff" stop-opacity=".65"/><stop offset="1" stop-color="#eeb568" stop-opacity=".12"/></linearGradient><filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><polygon class="radar-orbit" points="${polygon(93)}"/><polygon class="radar-platform" points="${polygon(85)}" transform="translate(0 7)"/>${[.25,.5,.75,1].map(s=>`<polygon class="radar-grid" points="${polygon(82*s)}"/>`).join('')}${PERFORMANCE_AXES.map((_,i)=>`<line class="radar-grid" x1="160" y1="133" x2="${point(i,82)[0]}" y2="${point(i,82)[1]}"/>`).join('')}<polygon id="radarDepth" transform="translate(0 6)"/><polygon id="radarShape"/>${PERFORMANCE_AXES.map((_,i)=>`<circle id="radarNode${i}" class="radar-node" r="3"/>`).join('')}${PERFORMANCE_AXES.map((a,i)=>{const [x,y]=point(i,111);return `<text x="${x}" y="${y-3}" text-anchor="middle">${a.name}<tspan class="radar-score" id="radarScore${i}" x="${x}" dy="17"></tspan></text>`;}).join('')}</svg><details><summary>六项如何影响驾驶</summary><ul>${PERFORMANCE_AXES.map(a=>`<li><b>${a.name}</b> · ${a.description}</li>`).join('')}</ul><p>统一标尺；分数越高，该项越强。车辆调校评分，非厂家实测。</p></details>`;
  document.getElementById('carDesc')!.before(root);
 }
 const scores=performanceScores(car);
 root.querySelector('#radarShape')!.setAttribute('points',scores.map((score,i)=>point(i,82*score/100).join(',')).join(' '));
 root.querySelector('#radarDepth')!.setAttribute('points',scores.map((v,i)=>point(i,82*v/100).join(',')).join(' '));
 scores.forEach((v,i)=>{root!.querySelector('#radarScore'+i)!.textContent=String(v);const [x,y]=point(i,82*v/100),node=root!.querySelector('#radarNode'+i)!;node.setAttribute('cx',String(x));node.setAttribute('cy',String(y));});
 root.querySelector('#radarTitle')!.textContent=PERFORMANCE_AXES.map((a,i)=>a.name+' '+scores[i]).join('，');
}
