import {createTrackCurve} from './circuits/circuit';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function difficultyScore(m:{turningPerKm:number;tightFraction:number;brakingPerKm:number;halfWidth:number;precip?:string;time:string}){
 return Math.round(100*(.30*clamp(m.turningPerKm/14)+.20*clamp(m.tightFraction/.3)+.25*clamp((8-m.halfWidth)/4)+.15*clamp(m.brakingPerKm/250)+(m.precip==='snow'?.18:m.precip==='rain'?.13:0)+(m.time==='night'?.05:m.time==='dusk'?.025:0)));
}
/** Fixed reference car/grip and equal-distance samples; ratings do not depend on car selection. */
export function evaluateTrack(track:{theme:string;base:number;modes:number[][];circuit?:{halfWidth:number};precip?:string;time:string}){
 const curve=createTrackCurve(track),length=curve.getLength(),n=1400,step=length/n;
 const open=!curve.closed;
 const tangents=Array.from({length:n},(_,i)=>curve.getTangentAt(i/(open?n-1:n)));
 const curvature=tangents.map((t,i)=>t.angleTo(tangents[open?Math.min(n-1,i+1):(i+1)%n])/step);
 const speeds=curvature.map(k=>Math.min(80,Math.sqrt(10/Math.max(k,.00001))));
 let turning=0,tight=0,braking=0;
 curvature.forEach((k,i)=>{turning+=k*step;if(k>1/35)tight++;braking+=Math.max(0,speeds[i]-speeds[open?Math.min(n-1,i+1):(i+1)%n]);});
 const metrics={turningPerKm:turning/(length/1000),tightFraction:tight/n,brakingPerKm:braking/(length/1000),halfWidth:track.circuit?.halfWidth??8,precip:track.precip,time:track.time};
 const score=difficultyScore(metrics),stars=score<20?1:score<36?2:score<53?3:score<70?4:5;
 const reasons=[track.precip==='rain'?'雨天低抓地':track.precip==='snow'?'积雪低抓地':'',metrics.halfWidth<=4.5?'窄路容错低':'',metrics.turningPerKm>9?'连续变向':'',metrics.tightFraction>.13?'急弯密集':'',metrics.brakingPerKm>130?'重刹频繁':'',track.time==='night'?'夜间视野':''].filter(Boolean);
 return{stars,score,reason:reasons.slice(0,3).join(' · ')||'宽路面 · 节奏较舒缓',length:Math.round(length),metrics};
}
