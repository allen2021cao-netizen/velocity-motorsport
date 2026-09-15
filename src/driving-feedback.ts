import {clamp,gripFor,type Setup,type Dynamics} from './physics';
export const MONACO_TUNNEL={start:.41,end:.54};
/** Zone estimates match the existing kerbs, shoulder and tunnel geometry. */
export function surfaceFeedback(track:string,circuit:boolean,halfWidth:number,lat:number,progress:number,wet:number){
 const wheels=[Math.abs(lat-.85),Math.abs(lat+.85)];
 const curb=circuit?Math.max(...wheels.map(x=>clamp(1-Math.abs(x-(halfWidth-.7))/.4,0,1))):0;
 const rough=circuit?clamp((Math.max(...wheels)-halfWidth)/1.3,0,1):0;
 // Grass shoulder strip occupies width + .36 .. 2.6; farther runoff may be paved.
 const grass=circuit&&['shanghai','miami'].includes(track)?Math.max(...wheels.map(x=>Math.max(clamp(Math.min((x-halfWidth-.36)/.3,(halfWidth+2.6-x)/.3),0,1),clamp(x-halfWidth-12,0,1)))):0;
 const u=((progress%1)+1)%1;
 const tunnel=track==='monaco'&&circuit&&Math.abs(lat)<halfWidth+1?clamp(Math.min((u-MONACO_TUNNEL.start)/.006,(MONACO_TUNNEL.end-u)/.006),0,1):0;
 return{curb,rough:rough*(1-grass),grass,wet:clamp(wet,0,1)*(1-rough),tunnel};
}
export function gripFeedback(p:Dynamics,setup:Setup,handling:number,wet:number){
 const capacity=gripFor(setup,p.wear,p.temperature,wet)*(1+setup.downforce*p.speed*p.speed*.000025)*(.85+handling*.18);
 const demand=Math.hypot(p.latG,(p.brakePressure??0)*capacity*.88);
 return clamp((demand/Math.max(.1,capacity)-.70)/.28,0,1)*clamp((p.speed-3)/7,0,1);
}
export function rivalFeedback(x:number,z:number){
 const distance=Math.hypot(x,z);
 return{pan:clamp(x/Math.max(2.5,distance*.65),-.95,.95),gain:.09/(1+(distance/12)**2),rear:z<0?.78:1};
}
