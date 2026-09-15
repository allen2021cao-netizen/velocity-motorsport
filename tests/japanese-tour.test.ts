import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {createTrackCurve} from '../src/circuits/circuit';
import {japaneseTour} from '../src/environment/japanese-tour';
for(const key of ['suzuka','fuji'])test(key+' aerial tour stays above scenery and loops without a camera jump',()=>{
 const c=createTrackCurve({theme:key,base:0,modes:[]}),p=Array.from({length:1400},(_,i)=>c.getPointAt(i/1400)),max=Math.max(...p.map(v=>v.y)),tour=japaneseTour(p,key),camera=new PerspectiveCamera(53,16/9,.1,18000);
 for(let i=0;i<2200;i++){tour.view(camera,i*.1);assert.ok(camera.position.y>max+170);assert.ok([...camera.position.toArray(),...camera.quaternion.toArray()].every(Number.isFinite));}
 tour.view(camera,219.999);const eye=camera.position.clone(),q=camera.quaternion.clone();tour.view(camera,0);assert.ok(eye.distanceTo(camera.position)<.1);assert.ok(q.angleTo(camera.quaternion)<.001);
});
