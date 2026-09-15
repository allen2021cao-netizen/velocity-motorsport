import {trafficPlan,type TrafficCar} from './race-ai';
import {clamp} from './physics';
export const PERSONALITIES=[
 {name:'保守',patience:3.2,retry:3,gap:1.2},
 {name:'稳定',patience:4.5,retry:2,gap:1},
 {name:'进攻',patience:6,retry:1.3,gap:.9},
] as const;
export function freshTactics(profile=1){return{profile,mode:'follow',lane:0,age:0,cooldown:0,leadGap:Infinity};}
export type Tactics=ReturnType<typeof freshTactics>;
/** Persistent intent; personalities change patience and spacing, never engine power. */
export function tacticalPlan(self:TrafficCar,others:TrafficCar[],length:number,halfWidth:number,dt:number,m:Tactics,corner:number,hold=false){
 const p=PERSONALITIES[m.profile],traffic=others.map(o=>({...o,gap:((o.dist-self.dist+length/2)%length+length)%length-length/2}));
 const beside=traffic.some(o=>Math.abs(o.gap)<6&&Math.abs(o.lat-self.lat)<3.5);
 const clear=(lane:number)=>traffic.every(o=>Math.abs(o.lat-lane)>2.4||o.gap>Math.max(10,self.speed*.45)||o.gap< -Math.max(8,o.speed*.3));
 const lead=traffic.filter(o=>o.gap>0&&o.gap<Math.max(30,self.speed*1.2)&&Math.abs(o.lat-self.lat)<2.4).sort((a,b)=>a.gap-b.gap)[0];
 m.age+=dt;m.cooldown=Math.max(0,m.cooldown-dt);
 const base=trafficPlan(self,others,length,halfWidth,dt,true);
 if(hold){m.lane=self.lat;return base;}
 if(m.mode==='pass'){
  if((!clear(m.lane)&&!beside)||(m.age>p.patience&&lead&&lead.gap>=m.leadGap-2)){m.mode='recover';m.cooldown=p.retry;m.age=0;}
  else if(!lead&&!beside&&m.age>1.5){m.mode='follow';m.age=0;}
 }else if(m.mode==='recover'){
  if(!beside&&clear(0))m.lane=0;
  if(m.cooldown===0){m.mode='follow';m.age=0;}
 }else if(lead&&m.cooldown===0&&Math.abs(corner)<.15&&!beside){
  const lanes=[lead.lat-2.8,lead.lat+2.8].filter(l=>Math.abs(l)<halfWidth-1.3&&clear(l)).sort((a,b)=>Math.abs(a-self.lat)-Math.abs(b-self.lat));
  if(lanes.length){m.mode='pass';m.lane=lanes[0];m.age=0;m.leadGap=lead.gap;}
 }else if(!lead&&!beside){const entry=clamp(corner*8,-halfWidth*.35,halfWidth*.35);if(clear(entry))m.lane=entry;}
 // Never sweep across a neighbouring car; retain the occupied lane through a corner.
 if(beside)m.lane=self.lat;
 const destination=clear(m.lane)?m.lane:self.lat;
 let target=base.target;
 if(lead&&Number.isFinite(target))target=Math.max(0,target-(p.gap-1)*self.speed*.3);
 return{lat:self.lat+clamp(destination-self.lat,-1.4*dt,1.4*dt),target};
}
