import test from 'node:test';
import assert from 'node:assert/strict';
import {DIFFICULTIES,aiTargetSpeed,stepOpponent} from '../src/race-ai';
import {stepVehicle,type Dynamics,type Setup} from '../src/physics';
const setup:Setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'},car={top:296,accel:.84,handling:.9};
test('exactly three distinct CPU levels, with acceleration within the player limit',()=>{
 assert.equal(DIFFICULTIES.length,3);const speeds:number[]=[];
 for(let d=0;d<3;d++){let speed=0;for(let i=0;i<600;i++)speed=stepOpponent(speed,80,car,setup,d,1/120);speeds.push(speed);}
 const p:Dynamics={speed:0,heading:0,steer:0,drift:0,fuel:100,wear:0,temperature:75,longG:0,latG:0,traction:false,abs:false};for(let i=0;i<600;i++)stepVehicle(p,{throttle:1,brake:0,steer:0,handbrake:false},car,setup,1/120);
 assert.ok(speeds[1]>speeds[0]*1.10);assert.ok(speeds[2]>speeds[1]*1.06);assert.ok(speeds[2]<=p.speed*1.015);
});
test('expert leaves a reachable grip margin; all levels plan braking before a sharp corner',()=>{
 const curv=Array(1400).fill(.014);for(let i=80;i<130;i++)curv[i]=.42;
 const target=[0,1,2].map(d=>aiTargetSpeed(curv,1,0,car,setup,d));assert.ok(target[0]<target[1]&&target[1]<target[2]);
 assert.ok(target[2]<car.top/3.6*.7);assert.ok(aiTargetSpeed(curv,1,80,car,setup,2)<Math.sqrt(9.81*1.06/.03));
});
test('repeatable lap benchmark separates every CPU tier',()=>{
 const curv=Array.from({length:1400},(_,i)=>i%350>230?.22:.018),times:number[]=[];
 for(let d=0;d<3;d++){let distance=0,speed=0,time=0;while(distance<2800&&time<300){const target=aiTargetSpeed(curv,1,Math.floor(distance)%1400,car,setup,d);speed=stepOpponent(speed,target,car,setup,d,1/30);distance+=speed/30;time+=1/30;}times.push(time);}
 console.log('CPU two-lap benchmark seconds:',times.map(t=>t.toFixed(1)));assert.ok(times[0]>times[1]*1.08);assert.ok(times[1]>times[2]*1.06);
});
