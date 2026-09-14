import test from 'node:test';
import assert from 'node:assert/strict';
import {DIFFICULTIES,aiTargetSpeed,stepOpponent,freshDriver,roadCurvature,trafficPlan} from '../src/race-ai';
import {stepVehicle,type Dynamics,type Setup} from '../src/physics';
const setup:Setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'},car={top:296,accel:.84,handling:.9};
test('exactly three distinct CPU levels, with acceleration within the player limit',()=>{
 assert.equal(DIFFICULTIES.length,3);const speeds:number[]=[];
 for(let d=0;d<3;d++){let speed=0;const driver=freshDriver();for(let i=0;i<600;i++)speed=stepOpponent(speed,80,car,setup,d,1/120,0,driver);speeds.push(speed);}
 const p:Dynamics={speed:0,heading:0,steer:0,drift:0,fuel:100,wear:0,temperature:75,longG:0,latG:0,traction:false,abs:false};for(let i=0;i<600;i++)stepVehicle(p,{throttle:1,brake:0,steer:0,handbrake:false},car,setup,1/120);
 assert.ok(speeds[1]>speeds[0]*1.10);assert.ok(speeds[2]>=speeds[1]);assert.ok(speeds[2]<=p.speed*1.015);
});
test('expert leaves a reachable grip margin; all levels plan braking before a sharp corner',()=>{
 const curv=Array(1400).fill(.014);for(let i=80;i<130;i++)curv[i]=.42;
 const target=[0,1,2].map(d=>aiTargetSpeed(curv,1,0,car,setup,d));assert.ok(target[0]<target[1]&&target[1]<target[2]);
 assert.ok(target[2]<car.top/3.6*.7);assert.ok(aiTargetSpeed(curv,1,80,car,setup,2)<Math.sqrt(9.81*1.06/.03));
});
test('repeatable lap benchmark separates every CPU tier',()=>{
 const curv=Array.from({length:1400},(_,i)=>i%350>230?.22:.018),times:number[]=[];
 for(let d=0;d<3;d++){let distance=0,speed=0,time=0;const driver=freshDriver();while(distance<2800&&time<300){const target=aiTargetSpeed(curv,1,Math.floor(distance)%1400,car,setup,d);speed=stepOpponent(speed,target,car,setup,d,1/30,0,driver,roadCurvature(curv,1,Math.floor(distance)%1400));distance+=speed/30;time+=1/30;}times.push(time);}
 console.log('CPU two-lap benchmark seconds:',times.map(t=>t.toFixed(1)));assert.ok(times[0]>times[1]*1.08);assert.ok(times[1]>times[2]*1.025);
});

test('traffic avoids occupied passing lanes and slows for a blocked lead car',()=>{
 const self={dist:100,lat:0,speed:40};const lead={dist:110,lat:0,speed:25};
 const blocked=trafficPlan(self,[lead,{dist:102,lat:-2.8,speed:40},{dist:98,lat:2.8,speed:42}],1000,6,.1);
 assert.equal(blocked.lat,0);assert.ok(blocked.target<25);
 const pass=trafficPlan(self,[lead,{dist:102,lat:-2.8,speed:40}],1000,6,.1);assert.ok(pass.lat>0&&pass.lat<=.14+.000001);
 const seam=trafficPlan({...self,dist:995},[{...lead,dist:5}],1000,4,.1);assert.ok(Number.isFinite(seam.target));
});
test('expert acceleration is exactly shared player physics, including wet grip and worn tires',()=>{
 const a=freshDriver(),p=freshDriver();a.wear=p.wear=.6;a.temperature=p.temperature=50;
 for(let i=0;i<1000;i++){a.speed=stepOpponent(a.speed,100,car,setup,2,1/120,1,a);stepVehicle(p,{throttle:1,brake:0,steer:0,handbrake:false},car,setup,1/120,1);}
 assert.ok(Math.abs(a.speed-p.speed)<1e-9);
});

test('both race tiers use exactly the same launch physics and selected tires as the player',()=>{
 for(const tires of ['sport','soft','wet'])for(const difficulty of [1,2]){
  const s={...setup,tires},a=freshDriver(),p=freshDriver();a.temperature=p.temperature=60;
  for(let i=0;i<1200;i++){a.speed=stepOpponent(a.speed,150,car,s,difficulty,1/120,.3,a);stepVehicle(p,{throttle:1,brake:0,steer:0,handbrake:false},car,s,1/120,.3);assert.ok(Math.abs(a.speed-p.speed)<1e-9);}
 }
});
test('a same-car starting grid retains its launch pace without converging lanes',()=>{
 for(const difficulty of [1,2]){
  const grid=[26,19,12].map((dist,i)=>({dist,lat:i%2?-2.9:2.9,speed:0,driver:freshDriver()}));const solo=freshDriver();let minGap=Infinity;
  for(let i=0;i<600;i++){
   const snapshot=grid.map(a=>({dist:a.dist,lat:a.lat,speed:a.speed,acceleration:a.driver.longG*9.81}));
   for(let j=0;j<grid.length;j++){const a=grid[j],plan=trafficPlan(a,snapshot.filter((_,k)=>k!==j),5000,8,1/120,true);
    a.speed=stepOpponent(a.speed,Math.min(150,plan.target),car,setup,difficulty,1/120,0,a.driver);a.dist+=a.speed/120;a.lat=plan.lat;
   }
   stepVehicle(solo,{throttle:1,brake:0,steer:0,handbrake:false},car,setup,1/120);minGap=Math.min(minGap,grid[0].dist-grid[2].dist);
  }
  console.log('Launch tier',difficulty,'player/AI km/h',solo.speed*3.6,grid.map(a=>a.speed*3.6));
  assert.ok(grid.every(a=>a.speed>=solo.speed*.98));assert.ok(minGap>=6);assert.deepEqual(grid.map(a=>a.lat),[2.9,-2.9,2.9]);
 }
});
