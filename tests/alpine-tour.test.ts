import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {createAlpineTour} from '../src/environment/alpine-tour';
test('nature tour stays above forest height and joins smoothly at the loop boundary',()=>{
 const points=Array.from({length:100},(_,i)=>new Vector3(Math.sin(i*.1)*600,i*4,i*50));
 for(const snowy of [false,true]){
  const rig=createAlpineTour(points,snowy),camera=new PerspectiveCamera();
  for(let t=0;t<180;t+=.25){rig.view(camera,t);assert.ok(camera.position.y>456);assert.ok(camera.position.toArray().every(Number.isFinite));}
  rig.view(camera,179.999);const p=camera.position.clone(),q=camera.quaternion.clone();rig.view(camera,180.001);
  assert.ok(p.distanceTo(camera.position)<1);assert.ok(q.angleTo(camera.quaternion)<.001);
 }
});
