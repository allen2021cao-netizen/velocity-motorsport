import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve} from '../src/circuits/circuit';
import {aiTargetSpeed,stepOpponent,freshDriver,roadCurvature} from '../src/race-ai';
test('AI completes the entire Arosa stage under its own power without endpoint wrapping',()=>{
 const c=createTrackCurve({theme:'arosa',base:0,modes:[]}),n=1400,length=c.getLength(),seg=length/(n-1),p=Array.from({length:n},(_,i)=>c.getPointAt(i/(n-1))),t=p.map((_,i)=>c.getTangentAt(i/(n-1)));
 const curv=Object.assign(t.map((v,i)=>v.angleTo(t[Math.min(n-1,i+1)])*14),{open:true});
 const car={top:325,accel:.9,handling:.9},setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'sprint'},driver=freshDriver();let distance=5,speed=0,time=0,target=0;
 for(let i=0;i<120*900&&distance<length;i++){const index=Math.min(n-1,Math.floor(distance/seg)),slope=(p[Math.min(n-1,index+1)].y-p[index].y)/seg;if(i%10===0)target=aiTargetSpeed(curv,seg,index,car,setup,1,0,driver);speed=stepOpponent(speed,target,car,setup,1,1/120,0,driver,roadCurvature(curv,seg,index));speed=Math.max(0,speed-9.81*slope/120);distance+=speed/120;time+=1/120;assert.ok(Number.isFinite(speed));}
 assert.ok(distance>=length,'AI must reach the finish');assert.ok(driver.fuel>0,'AI must finish with usable fuel');console.log('Arosa AI finish seconds',time.toFixed(1));
});
