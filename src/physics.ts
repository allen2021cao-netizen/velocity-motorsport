export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export interface Dynamics {speed:number;heading:number;steer:number;drift:number;fuel:number;wear:number;temperature:number;longG:number;latG:number;traction:boolean;abs:boolean;}
export interface Controls {throttle:number;brake:number;steer:number;handbrake:boolean;}
export interface Setup {tires:string;assist:string;downforce:number;balance:number;weather:string;mode:string;steering?:number;cornerAssist?:boolean;}
export function gripFor(setup:Setup,wear=0,temp=75,wet=0){
 const compound=setup.tires==='soft'?1.18:setup.tires==='wet'?1.00:1.06;
 const water=1-wet*(setup.tires==='wet'?.12:setup.tires==='soft'?.49:.36);
 return compound*water*(1-clamp(wear,0,1)*.32)*clamp(1-Math.abs(temp-78)*.003,.76,1);
}
/** Approximate bicycle model in metres/seconds. Combined grip budget limits braking + cornering. */
export function stepVehicle(p:Dynamics,c:Controls,car:{top:number;accel:number;handling:number;wheelbase?:number},s:Setup,dt:number,wet=0){
 const v=Math.abs(p.speed), grip=gripFor(s,p.wear,p.temperature,wet);
 const load=1+s.downforce*v*v*.000025;
 const maxG=9.81*grip*load*(.85+car.handling*.18);
 const wheelbase=car.wheelbase??2.65;
 // Digital input requests usable grip at speed, with full steering lock for tight slow corners.
 const steeringLock=Math.min(.68,Math.atan(maxG*wheelbase/Math.max(v*v,1))*1.18);
 const steerGoal=clamp(clamp(c.steer,-1,1)*steeringLock*(s.steering??1),-.74,.74);
 p.steer+=(steerGoal-p.steer)*(1-Math.exp(-(Math.abs(steerGoal)<.001?16:12)*dt));
 const demanded=p.speed*p.speed/wheelbase*Math.tan(p.steer);
 const braking=c.brake*maxG*(s.assist==='off'?.79:1)*(1-Math.abs(s.balance-55)*.004);
 const lateralLimit=Math.sqrt(Math.max(0,maxG*maxG-braking*braking*.78));
 const lateral=clamp(demanded,-lateralLimit,lateralLimit);
 p.traction=c.throttle>.5&&v<18&&grip<.9;
 p.abs=c.brake>.7&&v>5&&s.assist!=='off';
 const top=car.top/3.6*(1-s.downforce*.035);
 let power=c.throttle*(8+car.accel*4)*Math.max(0,1-Math.pow(v/top,2));
 if(p.fuel<=0)power=0;
 if(s.assist!=='off')power=Math.min(power,maxG*.94);
 else if(p.traction)power*=.77;
 // Scrubbing excess front-tire demand sheds speed instead of endlessly pushing into the wall.
 const understeerDrag=s.assist==='off'?0:clamp((Math.abs(demanded)-maxG)/Math.max(maxG,1),0,1)*2.8;
 const resistance=v*.015+v*v*.00023+(c.throttle?0:.75)+understeerDrag;
 const acceleration=power-braking-resistance;
 p.speed=clamp(p.speed+acceleration*dt,0,top);
 p.longG=acceleration/9.81;p.latG=lateral/9.81;
 const yaw=v>.2?lateral/Math.max(v,2):0;
 const slip=Math.max(0,Math.abs(demanded)-lateralLimit)/Math.max(maxG,1);
 const driftGoal=Math.sign(p.steer)*clamp((c.handbrake?.18:0)+slip*(s.assist==='off'?.08:.012),0,.3);
 p.drift+=(driftGoal-p.drift)*(1-Math.exp(-5*dt));
 p.heading+=yaw*dt*(c.handbrake?1.22:1);
 if(c.handbrake)p.speed=Math.max(0,p.speed-4*dt);
 const targetTemp=36+v*.62+Math.abs(p.latG)*16+c.brake*14;
 p.temperature+=(targetTemp-p.temperature)*dt*.06;
 if(s.mode==='endurance'){
  p.fuel=Math.max(0,p.fuel-dt*(.035+c.throttle*.22));
  p.wear=clamp(p.wear+dt*(.00015+Math.abs(p.latG)*.0005)*(s.tires==='soft'?1.7:1),0,1);
 }
 return {moveDir:p.heading-p.drift,grip};
}
export function readGamepad():Controls {
 const pad=Array.from(navigator.getGamepads?.()??[]).find(Boolean);
 const axis=pad?.axes[0]??0;
 return {steer:Math.abs(axis)>.12?-Math.sign(axis)*(Math.abs(axis)-.12)/.88:0,throttle:pad?.buttons[7]?.value??0,brake:pad?.buttons[6]?.value??0,handbrake:!!pad?.buttons[0]?.pressed};
}
