import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {surfaceFeedback,gripFeedback,rivalFeedback,MONACO_TUNNEL} from '../src/driving-feedback';
import {freshDriver} from '../src/race-ai';
import {cameraPose} from '../src/camera-rig';
const setup={mode:'race',tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear'};
test('wheel contact distinguishes kerb, visible grass shoulder, wet road and street walls',()=>{
 assert.equal(surfaceFeedback('shanghai',true,8,0,.1,0).curb,0);
 assert.ok(surfaceFeedback('shanghai',true,8,6.45,.1,0).curb>.9);
 assert.ok(surfaceFeedback('shanghai',true,8,8.1,.1,0).grass>.9);
 assert.equal(surfaceFeedback('shanghai',true,8,0,.1,1).wet,1);
 assert.equal(surfaceFeedback('tokyo',false,8,7,.1,0).curb,0);
});
test('tunnel fades only within the actual Monaco roof interval and road corridor',()=>{
 for(const u of [.2,MONACO_TUNNEL.start,MONACO_TUNNEL.end,.7])assert.equal(surfaceFeedback('monaco',true,4.5,0,u,0).tunnel,0);
 assert.equal(surfaceFeedback('monaco',true,4.5,0,.47,0).tunnel,1);
 assert.equal(surfaceFeedback('monaco',true,4.5,10,.47,0).tunnel,0);
 assert.equal(surfaceFeedback('shanghai',true,8,0,.47,0).tunnel,0);
});
test('grip warning precedes drift and follows available wet tire grip',()=>{
 const p={...freshDriver(),speed:30,latG:.85,drift:0};
 assert.ok(gripFeedback(p,setup,.9,0)>0);assert.ok(gripFeedback(p,setup,.9,1)>gripFeedback(p,setup,.9,0));
 assert.equal(gripFeedback({...p,speed:0},setup,.9,1),0);assert.equal(gripFeedback({...p,latG:.1},setup,.9,0),0);
});
test('side-by-side rivals give mirrored strong stereo cues, distant cars are quieter',()=>{
 const l=rivalFeedback(-2.8,0),r=rivalFeedback(2.8,0);assert.equal(l.pan,-r.pan);assert.ok(r.pan>.9);assert.equal(l.gain,r.gain);assert.ok(r.gain>rivalFeedback(50,0).gain*10);assert.ok(rivalFeedback(0,-10).rear<rivalFeedback(0,10).rear);
});
test('zero camera motion removes body roll while preserving position and driving direction',()=>{
 const car=new T.Group(),body=new T.Group();car.add(body);car.position.set(20,0,30);car.rotation.set(0,1,.03);body.rotation.set(.04,0,.035);
 const anchor={x:.2,y:1.1,z:0},stable=cameraPose(body,anchor,undefined,0),moving=cameraPose(body,anchor,undefined,1);
 assert.ok(stable.up.distanceTo(new T.Vector3(0,1,0))<1e-9);assert.ok(moving.up.distanceTo(stable.up)>.02);assert.ok(stable.eye.distanceTo(car.position)<2);
 assert.ok(stable.target.clone().sub(stable.eye).normalize().dot(new T.Vector3(Math.sin(1),0,Math.cos(1)))>.999);
});
