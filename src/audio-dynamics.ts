export type EngineFamily='muscle'|'porscheBoxer'|'nissanRB26'|'toyota2JZ'|'bmwS58'|'ferrari458'|'ferrariF40'|'audiV10'|'lamboV12'|'mclarenV12';
export interface EngineProfile {family:EngineFamily;cylinders:number;idle:number;redline:number;pitch:number;body:number;turbo:number;}
export const ENGINE_PROFILES:Record<string,EngineProfile>={
 p911:{family:'porscheBoxer',cylinders:6,idle:780,redline:7400,pitch:1,body:1,turbo:0},
 r34:{family:'nissanRB26',cylinders:6,idle:850,redline:8000,pitch:1,body:.8,turbo:1},
 supra:{family:'toyota2JZ',cylinders:6,idle:850,redline:7600,pitch:1,body:1,turbo:1},
 m3:{family:'bmwS58',cylinders:6,idle:780,redline:7200,pitch:1,body:.85,turbo:.7},
 f40:{family:'ferrariF40',cylinders:8,idle:1000,redline:7800,pitch:1,body:.90,turbo:1},
 '458':{family:'ferrari458',cylinders:8,idle:950,redline:9000,pitch:1,body:.85,turbo:0},
 diablo:{family:'lamboV12',cylinders:12,idle:900,redline:8500,pitch:1,body:1,turbo:0},
 mcf1:{family:'mclarenV12',cylinders:12,idle:900,redline:8000,pitch:1,body:.95,turbo:0},
 r8:{family:'audiV10',cylinders:10,idle:850,redline:8500,pitch:1,body:.90,turbo:0},
 viper:{family:'muscle',cylinders:8,idle:750,redline:6400,pitch:.91,body:1.2,turbo:0},
 clk:{family:'muscle',cylinders:8,idle:750,redline:7000,pitch:1.03,body:1,turbo:.45},
 c5:{family:'muscle',cylinders:8,idle:750,redline:6600,pitch:1,body:1.1,turbo:0},
 gt40:{family:'muscle',cylinders:8,idle:1000,redline:7000,pitch:.95,body:1.25,turbo:0},
};
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export interface Powertrain {gear:number;rpm:number;shift:number;cooldown:number;}
export function advancePowertrain(p:Powertrain,speed:number,throttle:number,top:number,profile:EngineProfile,dt:number,freeRev=false){
 dt=clamp(dt,0,.1);p.cooldown=Math.max(0,p.cooldown-dt);p.shift=Math.max(0,p.shift-dt);
 const kph=Math.abs(speed)*3.6,limits=[0,.15,.29,.44,.60,.78,1.07].map(x=>x*top);let change=0;
 if(!freeRev&&p.cooldown===0){if(p.gear<6&&kph>limits[p.gear])change=1;else if(p.gear>1&&kph<limits[p.gear-1]*.83)change=-1;if(change){p.gear+=change;p.shift=.13;p.cooldown=.3;}}
 const fraction=freeRev?throttle*.82:clamp(kph/Math.max(1,limits[p.gear]),0,1)*.93;
 const target=profile.idle+(profile.redline-profile.idle)*Math.max(fraction,throttle*(kph<7?.22:.03));
 p.rpm+=(target-p.rpm)*(1-Math.exp(-dt*(change<0?20:12)));return change;
}
