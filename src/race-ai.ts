import {clamp,gripFor,type Setup} from './physics';
export const DIFFICULTIES=[
 {name:'休闲',en:'CLUB',pace:.70,throttle:.76,braking:.76,mistake:.035,weave:.55,description:'较早刹车、起步温和，适合熟悉路线。'},
 {name:'竞技',en:'SPORT',pace:.84,throttle:.90,braking:.88,mistake:.015,weave:.32,description:'保持稳定节奏，抓住出弯加速与超车机会。'},
 {name:'专家',en:'EXPERT',pace:.96,throttle:.98,braking:.97,mistake:.004,weave:.14,description:'更晚刹车、更少失误，精准走线仍可争胜。'},
] as const;
export type OpponentCar={top:number;accel:number;handling:number};
export function aiLimits(car:OpponentCar,setup:Setup,difficulty:number,wet=0){
 const d=DIFFICULTIES[difficulty],grip=gripFor(setup,0,75,wet),g=9.81*grip*(.85+car.handling*.18);
 return{top:car.top/3.6*(1-setup.downforce*.035),grip:g,braking:g*d.braking,throttle:d.throttle,pace:d.pace};
}
/** Look ahead in metres; speed plan obeys a braking-distance envelope. No player-distance inputs. */
export function aiTargetSpeed(curvature:number[],segment:number,index:number,car:OpponentCar,setup:Setup,difficulty:number,wet=0){
 const limits=aiLimits(car,setup,difficulty,wet);let target=limits.top*limits.pace;
 for(let metres=0;metres<=200;metres+=10){const i=(index+Math.round(metres/segment))%curvature.length,k=Math.max(.0001,curvature[i]/(14*segment));const corner=Math.sqrt(limits.grip/k)*limits.pace;target=Math.min(target,Math.sqrt(corner*corner+2*limits.braking*metres));}
 return target;
}
export function stepOpponent(speed:number,target:number,car:OpponentCar,setup:Setup,difficulty:number,dt:number,wet=0){
 const l=aiLimits(car,setup,difficulty,wet),power=Math.min((8+car.accel*4)*Math.max(0,1-(speed/l.top)**2),l.grip*.94)*l.throttle,resistance=speed*.015+speed*speed*.00023;
 return speed<target?Math.min(target,speed+Math.max(0,power-resistance)*dt):Math.max(target,speed-(l.braking+resistance)*dt);
}
