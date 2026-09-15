import test from 'node:test';
import assert from 'node:assert/strict';
import {stepVehicle,type Controls} from '../src/physics';
import {freshDriver,stepOpponent,aiLimits} from '../src/race-ai';
import {CARS} from '../src/cars.js';
import {performanceScores,PERFORMANCE_AXES,type VehiclePerformance} from '../src/vehicle-performance';
const setup={mode:'race',tires:'sport',assist:'off',downforce:.4,balance:55,weather:'clear'};
const base:VehiclePerformance={top:310,accel:.85,handling:.9,braking:1,agility:1,stability:1};
function drive(car:VehiclePerformance,controls:Controls,seconds:number,speed=0,drift=0){const p={...freshDriver(),speed,drift};let distance=0;for(let i=0;i<seconds*120;i++){stepVehicle(p,controls,car,setup,1/120);distance+=p.speed/120;}return{...p,distance};}
const gas={throttle:1,brake:0,steer:0,handbrake:false};
test('all 13 cars have six distinct bounded scores sourced from simulation parameters',()=>{
 assert.equal(CARS.length,13);assert.equal(new Set(CARS.map(c=>performanceScores(c).join(','))).size,13);
 for(const c of CARS){assert.equal(performanceScores(c).length,6);assert.ok(performanceScores(c).every(v=>v>0&&v<=100));for(const a of PERFORMANCE_AXES)assert.ok(Number.isFinite(c[a.key]));}
});
test('higher speed and acceleration scores increase long-straight speed and launch distance',()=>{
 assert.ok(drive({...base,top:350},gas,60).speed>drive({...base,top:280},gas,60).speed+8);
 assert.ok(drive({...base,accel:1},gas,3).distance>drive({...base,accel:.7},gas,3).distance+3);
});
test('grip score changes achievable cornering, braking score changes stopping distance',()=>{
 const turn={...gas,throttle:0,steer:1};assert.ok(drive({...base,handling:1},turn,.4,35).latG>drive({...base,handling:.7},turn,.4,35).latG);
 const brake={...gas,throttle:0,brake:1};const strong=drive({...base,braking:1.12},brake,8,40),weak=drive({...base,braking:.87},brake,8,40);
 assert.ok(strong.speed<.1&&weak.speed<.1);assert.ok(strong.distance<weak.distance*.85);
 console.log('40 m/s stopping metres',{strong:strong.distance,weak:weak.distance});
});
test('response score changes turn-in time and stability score changes recovery after a slide',()=>{
 const turn={...gas,throttle:0,steer:1};assert.ok(drive({...base,agility:1.15},turn,.1,20).steer>drive({...base,agility:.8},turn,.1,20).steer*1.1);
 const coast={...gas,throttle:0};assert.ok(Math.abs(drive({...base,stability:1.12},coast,.5,25,.2).drift)<Math.abs(drive({...base,stability:.82},coast,.5,25,.2).drift)*.6);
});
test('AI uses every car trait through the same physics and its braking planner',()=>{
 const car={...base,braking:1.12,agility:1.15,stability:.82},p=freshDriver(),ai=freshDriver();
 for(let i=0;i<120;i++){stepVehicle(p,gas,car,setup,1/120);stepOpponent(ai.speed,100,car,setup,2,1/120,0,ai);}
 assert.ok(Math.abs(ai.speed-p.speed)<1e-8);assert.ok(aiLimits(car,setup,2).braking>aiLimits({...car,braking:.87},setup,2).braking);
});
