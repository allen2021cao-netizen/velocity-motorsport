import test from 'node:test';
import assert from 'node:assert/strict';
import {Object3D} from 'three';
import {RenderMotion} from '../src/render-motion.ts';
import {AdaptiveQuality} from '../src/adaptive-quality.ts';
import {drivingCue} from '../src/driving-cue.ts';
import {freshDriver} from '../src/race-ai.ts';
const car={top:300,accel:.8,handling:.9};
const setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'};

test('render interpolation takes the short turn across pi, restores simulation and resets teleports',()=>{
 const body=new Object3D(),motion=new RenderMotion();body.rotation.y=Math.PI-.1;motion.setTargets([body]);
 motion.beforeStep();body.position.x=10;body.rotation.y=-Math.PI+.1;motion.afterStep();
 motion.apply(.5);assert.equal(body.position.x,5);assert.ok(Math.abs(body.quaternion.y)>.999);
 motion.restore();assert.equal(body.position.x,10);assert.equal(body.rotation.x,0);assert.equal(body.rotation.y,-Math.PI+.1);assert.equal(body.rotation.z,0);
 body.position.x=100;motion.reset();motion.apply(.2);assert.equal(body.position.x,100);
});
test('render rate does not feed interpolated transforms back into simulation',()=>{
 function run(fps:number){const body=new Object3D(),motion=new RenderMotion();motion.setTargets([body]);let rest=0;
  for(let i=0;i<fps;i++){rest+=1/fps;while(rest+1e-10>=1/120){motion.beforeStep();body.position.x+=1;motion.afterStep();rest-=1/120;}motion.apply(rest*120);motion.restore();}return body.position.x;
 }assert.equal(run(30),120);assert.equal(run(144),120);
});
test('guidance requests braking before a tight bend and respects rain grip without modifying driver',()=>{
 const curve=Array(500).fill(0);for(let i=30;i<60;i++)curve[i]=.9;
 const driver={...freshDriver(),speed:45};const before={...driver};
 const dry=drivingCue(curve,2,0,car,setup,driver,0),wet=drivingCue(curve,2,0,car,setup,driver,1);
 assert.equal(dry.action,'brake');assert.ok(dry.distance!>=40&&dry.distance!<=65);
 assert.ok(wet.target!<dry.target!);assert.deepEqual(driver,before);
 assert.equal(drivingCue(Array(500).fill(0),2,0,car,setup,driver,0).action,'accelerate');
 assert.equal(drivingCue(curve,2,0,car,setup,{...driver,speed:2},0).action,'accelerate');
});
test('adaptive quality reacts to sustained load, recovers slowly and respects chosen ceiling',()=>{
 const q=new AdaptiveQuality();let level=1;
 for(let i=0;i<65;i++)level=q.update(1/30,level,1,true);
 assert.equal(level,2);
 for(let i=0;i<120;i++)level=q.update(1/60,level,1,true);
 assert.equal(level,2);
 for(let i=0;i<1000;i++)level=q.update(1/60,level,1,true);
 assert.equal(level,1);
 for(let i=0;i<300;i++)level=q.update(1/20,level,1,false);
 assert.equal(level,1);
});
