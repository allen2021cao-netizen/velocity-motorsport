import {clamp,gripFor,stepVehicle,type Dynamics,type Setup} from './physics';
export const DIFFICULTIES=[
 {name:'休闲',en:'CLUB',pace:.72,throttle:.76,braking:.72,mistake:.035,weave:.3,description:'提前制动、温和出弯，适合熟悉路线。'},
 {name:'竞技',en:'SPORT',pace:.94,throttle:1,braking:.91,mistake:.009,weave:.08,description:'充分利用直道，主动超车，稳定控制制动点与出弯。'},
 {name:'专家',en:'EXPERT',pace:.985,throttle:1,braking:.98,mistake:.002,weave:.025,description:'接近抓地极限，精确制动与连续进攻，失误极少。'},
] as const;
export type OpponentCar={top:number;accel:number;handling:number;wheelbase?:number};
export function freshDriver():Dynamics{return {speed:0,heading:0,steer:0,drift:0,fuel:100,wear:0,temperature:75,longG:0,latG:0,traction:false,abs:false};}
export function aiLimits(car:OpponentCar,setup:Setup,difficulty:number,wet=0,driver?:Dynamics){
 const d=DIFFICULTIES[difficulty],grip=gripFor(setup,driver?.wear??0,driver?.temperature??75,wet),g=9.81*grip*(.85+car.handling*.18);
 return{top:car.top/3.6*(1-setup.downforce*.035),grip:g,braking:g*d.braking*(setup.assist==='off'?.79:1)*(1-Math.abs(setup.balance-55)*.004),throttle:d.throttle,pace:d.pace};
}
/** Road curvature contract is the angle over fourteen samples. */
export function roadCurvature(curvature:number[],segment:number,index:number){return Math.abs(curvature[((index%curvature.length)+curvature.length)%curvature.length]||0)/(14*segment);}
/** Backward braking envelope includes simultaneous lateral load, not a fixed speed multiplier on straights. */
export function aiTargetSpeed(curvature:number[],segment:number,index:number,car:OpponentCar,setup:Setup,difficulty:number,wet=0,driver?:Dynamics){
 const l=aiLimits(car,setup,difficulty,wet,driver);
 const horizon=Math.min(curvature.length*segment,Math.max(240,l.top*l.top/(2*Math.max(1,l.braking))+70));
 const step=Math.max(segment,Math.min(5,segment*2));let target=l.top;
 for(let metres=Math.ceil(horizon/step)*step;metres>=0;metres-=step){
  const k=roadCurvature(curvature,segment,index+Math.round((metres+18)/segment));
  const corner=k>1e-6?Math.sqrt(l.grip/k)*l.pace:l.top;
  const lateral=Math.min(l.grip,target*target*k);
  const brake=l.braking*.58*Math.sqrt(Math.max(0,1-(lateral/l.grip)**2));
  target=Math.min(l.top,corner,Math.sqrt(target*target+2*brake*step));
 }
 const currentK=roadCurvature(curvature,segment,index);
 return Math.min(target,currentK>1e-6?Math.sqrt(l.grip/currentK)*l.pace:l.top);
}
/** Uses the player's power, drag, pedal response, tire temperature, fuel and combined-grip physics. */
export function stepOpponent(speed:number,target:number,car:OpponentCar,setup:Setup,difficulty:number,dt:number,wet=0,driver?:Dynamics,curvature=0){
 const p=driver??freshDriver();p.speed=speed;
 const l=aiLimits(car,setup,difficulty,wet,p),error=target-speed;
 const brake=clamp(-error/2.2,0,1),throttle=brake>.02?0:l.throttle*clamp((error+.8)/2,0,1);
 const wheelbase=car.wheelbase??2.65;
 const maxG=l.grip*(1+setup.downforce*speed*speed*.000025);
 const lock=Math.min(.68,Math.atan(maxG*wheelbase/Math.max(speed*speed,1))*1.18);
 const steer=clamp(Math.atan(wheelbase*curvature)/Math.max(.00001,lock*(setup.steering??1)),-1,1);
 stepVehicle(p,{throttle,brake,steer,handbrake:false},car,setup,dt,wet);
 return p.speed;
}
export type TrafficCar={dist:number;lat:number;speed:number;acceleration?:number};
/** Snapshot-based decisions consider all cars, including lapped traffic, without rubber banding. */
export function trafficPlan(self:TrafficCar,others:TrafficCar[],length:number,halfWidth:number,dt:number,holdLane=false){
 const ahead=others.map(o=>({...o,gap:((o.dist-self.dist+length/2)%length+length)%length-length/2}));
 const lead=ahead.filter(o=>o.gap>0&&o.gap<Math.max(20,self.speed*.9)&&Math.abs(o.lat-self.lat)<2.3).sort((a,b)=>a.gap-b.gap)[0];
 let lane=self.lat,target=Infinity;
 if(lead){
  const candidates=[lead.lat-2.8,lead.lat+2.8].filter(lat=>Math.abs(lat)<=halfWidth-1.3&&ahead.every(o=>Math.abs(o.lat-lat)>2.3||o.gap>Math.max(12,self.speed*.55)||o.gap< -Math.max(9,o.speed*.4)));
  if(candidates.length&&!holdLane)lane=candidates.sort((a,b)=>Math.abs(a-self.lat)-Math.abs(b-self.lat))[0];
  if(Math.abs(lead.lat-self.lat)<2.3){
   const closing=Math.max(0,self.speed-lead.speed);
   const desiredGap=6+self.speed*.18+closing*.55;
   // Predict an accelerating lead car, but never extrapolate through an emergency stop.
   const prediction=closing<2?clamp(lead.acceleration??0,0,10)*.35:0;
   target=Math.max(0,lead.speed+prediction+(lead.gap-desiredGap)*1.2);
  }
 }else if(!holdLane&&ahead.every(o=>Math.abs(o.lat)>2.3||Math.abs(o.gap)>12))lane=0;
 // Limit lane changes to 1.4 m/s: no lateral snapping during overtaking.
 return{lat:self.lat+clamp(lane-self.lat,-1.4*dt,1.4*dt),target};
}

/** Match the field to the selected car; never modify an opponent's real specification. */
export function matchedOpponents(cars:OpponentCar[],selected:number,difficulty:number){
 const performance=(c:OpponentCar)=>c.top/300*.45+c.accel*.35+c.handling*.2;
 const reference=performance(cars[selected]);
 const score=(i:number)=>Math.abs(performance(cars[i])-reference)+Math.max(0,reference-performance(cars[i]))*(difficulty===2?2:1);
 return cars.map((_,i)=>i).filter(i=>i!==selected).sort((a,b)=>score(a)-score(b)).slice(0,3);
}
