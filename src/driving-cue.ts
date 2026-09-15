import {aiLimits,aiTargetSpeed,roadCurvature,type OpponentCar} from './race-ai';
import type {Dynamics,Setup} from './physics';

export type DrivingCue={action:'brake'|'lift'|'hold'|'accelerate'|'recover';target:number|null;distance:number|null};
/** Uses the existing grip/braking planner, with live tire condition. Does not drive the car. */
export function drivingCue(curvature:number[],segment:number,index:number,car:OpponentCar,setup:Setup,driver:Dynamics,wet:number):DrivingCue{
 const limits=aiLimits(car,setup,2,wet,driver);
 const allowed=aiTargetSpeed(curvature,segment,index,car,setup,2,wet,driver);
 const look=Math.max(90,Math.min(500,driver.speed*driver.speed/(2*Math.max(1,limits.braking)) + driver.speed*1.4));
 let target:number|null=null,distance:number|null=null,best=Infinity;
 for(let metres=0;metres<=look;metres+=segment){
  const k=roadCurvature(curvature,segment,index+Math.round(metres/segment));
  const effective=k-limits.grip*setup.downforce*.000025;
  const speed=effective>1e-6?Math.sqrt(limits.grip/effective)*limits.pace:limits.top;
  if(speed>limits.top*.9)continue;
  const envelope=speed*speed+2*limits.braking*.75*metres;
  if(envelope<best){best=envelope;target=speed;distance=metres;}
 }
 if(target!==null&&driver.speed>allowed+.8)return{action:'brake',target,distance};
 const ahead=aiTargetSpeed(curvature,segment,index+Math.round(Math.max(8,driver.speed*1.2)/segment),car,setup,2,wet,driver);
 if(target!==null&&driver.speed>ahead+1.5)return{action:'lift',target,distance};
 if(Math.abs(driver.latG)>.35||roadCurvature(curvature,segment,index)>.004&&driver.speed>8)return{action:'hold',target,distance};
 return{action:'accelerate',target,distance};
}

export function mountDrivingCue(){
 const panel=document.createElement('section');panel.id='drivingCue';panel.hidden=true;panel.setAttribute('aria-label','驾驶提示');
 panel.innerHTML='<span class="cue-icon" aria-hidden="true"></span><span class="cue-speed" aria-hidden="true"><strong></strong><small>km/h</small></span><span class="cue-distance" aria-hidden="true"></span><span class="cue-assist" aria-hidden="true" hidden>A</span>';
 document.getElementById('hud')!.append(panel);
 const speed=panel.querySelector<HTMLElement>('.cue-speed')!,number=panel.querySelector('strong')!,icon=panel.querySelector('.cue-icon')!,detail=panel.querySelector<HTMLElement>('.cue-distance')!,assist=panel.querySelector<HTMLElement>('.cue-assist')!;
 const labels={brake:['▼','开始制动'],lift:['↘','松开油门'],hold:['↔','稳住转向'],accelerate:['↑','渐进加速'],recover:['↶','减速返回赛道，重置后本圈无效']};
 let last='';
 return{update(cue:DrivingCue|null,enabled:boolean,assisted:boolean){
  panel.hidden=!enabled||!cue||(cue.action==='accelerate'&&cue.target===null&&!assisted);if(panel.hidden||!cue)return;
  const [symbol,label]=labels[cue.action];
  const target=cue.target===null?null:Math.round(cue.target*3.6/5)*5;
  const distance=cue.distance===null?null:Math.round(cue.distance/10)*10;
  const ahead=distance!==null&&distance>=20;
  const text=label+(target!==null?' · 参考 '+target+' km/h':'')+(ahead?' · 前方 '+distance+' m':'')+(assisted?' · 弯道辅助正在减速':'');
  const key=[cue.action,target,distance,assisted].join('|');if(last===key)return;last=key;
  panel.dataset.action=cue.action;panel.setAttribute('aria-label',text);panel.title=text;
  icon.textContent=symbol;speed.hidden=target===null;number.textContent=target===null?'':String(target);
  detail.hidden=!ahead;detail.textContent=ahead?distance+' m':'';assist.hidden=!assisted;
 }};
}
