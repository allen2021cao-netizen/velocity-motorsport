import type {ReviewProfile} from './profiles';
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export type Mode='idle'|'mid'|'high'|'sweep'|'lift'|'straight'|'curb'|'grass'|'wet'|'grip'|'rival'|'tunnel';
export interface ReviewFrame {rpm:number;load:number;speed:number;gear:number;shift:number;wind:number;curb:number;grass:number;wet:number;grip:number;tunnel:number;rival:number;pan:number;release:number}
/** Pure timeline: the same second produces the same audio controls on any device. */
export function reviewFrame(p:ReviewProfile,mode:Mode,time:number):ReviewFrame {
 const t=Math.max(0,time), road=['straight','curb','grass','wet','grip','rival','tunnel'].includes(mode);
 let rpm=p.idle,load=.13,speed=0,gear=0,shift=1,release=0;
 if(mode==='mid'){rpm=p.mid;load=.65;} if(mode==='high'){rpm=p.high;load=.95;}
 if(mode==='sweep'){const phase=t%14,n=phase<9?phase/9:Math.max(0,1-(phase-9)/4);rpm=p.idle+(p.redline*.94-p.idle)*n;load=phase<9?.85:.05;}
 if(mode==='lift'){const phase=t%7;rpm=phase<2.5?p.mid+(p.high-p.mid)*phase/2.5:p.idle+(p.high-p.idle)*Math.exp(-(phase-2.5)*.85);load=phase<2.5?.95:.02;release=phase>=2.5?Math.exp(-(phase-2.5)*11):0;}
 if(road){const phase=t%24,segment=3.6,step=Math.min(5,Math.floor(phase/segment)),local=phase-step*segment;gear=step+1;speed=Math.min(82,phase*3.8);load=.9;rpm=p.idle+(p.redline*.9-p.idle)*clamp((local+.8)/(segment+.8));shift=local<.13&&step>0?.45:1;}
 return {rpm,load,speed,gear,shift,release,wind:road?clamp(speed/85)**2*.10:0,curb:mode==='curb'?(.6+.4*Math.sin(t*30)**2):0,grass:mode==='grass'?1:0,wet:mode==='wet'?1:0,grip:mode==='grip'?clamp(Math.sin(t*1.2)*.7+.4):0,tunnel:mode==='tunnel'?1:0,rival:mode==='rival'?.8:0,pan:Math.sin(t*.65)};
}
export function blend(p:ReviewProfile,rpm:number){
 const high=clamp((rpm-p.mid*.98)/(p.high-p.mid*.98)),idle=1-clamp((rpm-p.idle)/(1900-p.idle));
 return {mid:Math.cos(high*Math.PI/2)*(1-idle*.87),high:Math.sin(high*Math.PI/2),idle,midRate:clamp(rpm/p.mid,.58,1.48),highRate:clamp(rpm/p.high,.6,1.22)};
}
