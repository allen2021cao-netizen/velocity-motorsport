import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve} from '../src/circuits/circuit';
import {aiTargetSpeed,stepOpponent,freshDriver,roadCurvature} from '../src/race-ai';
for(const theme of ['bathurst','phillip'])test(theme+' AI completes a lap including all climbs and braking zones',()=>{
 const c=createTrackCurve({theme,base:0,modes:[]}),n=1400,length=c.getLength(),seg=length/n,p=Array.from({length:n},(_,i)=>c.getPointAt(i/n)),t=p.map((_,i)=>c.getTangentAt(i/n));
 const curv=t.map((v,i)=>{let peak=0;for(let k=0;k<14;k++)peak=Math.max(peak,t[(i+k)%n].angleTo(t[(i+k+1)%n]));return peak*14;});
 const car={top:325,accel:.9,handling:.9},setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'sprint'},driver=freshDriver();let distance=5,speed=0,time=0,target=0;
 for(let i=0;i<120*900&&distance<length;i++){const index=Math.floor(distance/seg)%n,slope=(p[(index+1)%n].y-p[index].y)/seg;if(i%10===0)target=aiTargetSpeed(curv,seg,index,car,setup,1,0,driver);speed=stepOpponent(speed,target,car,setup,1,1/120,0,driver,roadCurvature(curv,seg,index));speed=Math.max(0,speed-9.81*slope/120);distance+=speed/120;time+=1/120;assert.ok(Number.isFinite(speed));}
 assert.ok(distance>=length);assert.ok(driver.fuel>0);console.log(theme,'AI lap seconds',time.toFixed(1));
});
