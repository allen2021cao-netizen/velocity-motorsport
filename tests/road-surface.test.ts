import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createTrackCurve,CIRCUITS} from '../src/circuits/circuit';
import {roadSurface,roadAttitude} from '../src/road-surface';
for(const theme of ['redbull','arosa','bathurst','phillip'])test(theme+' grounding matches actual road triangles across lanes and grades',()=>{
 const c=createTrackCurve({theme,base:0,modes:[]}),open=!c.closed,n=1400,width=CIRCUITS[theme].halfWidth;
 const points=Array.from({length:n},(_,i)=>c.getPointAt(i/(open?n-1:n))),normals=points.map((_,i)=>{const t=c.getTangentAt(i/(open?n-1:n));return new T.Vector3(-t.z,0,t.x).normalize();});
 // Independent barycentric interpolation of triangle interior test positions.
 for(let i=0;i<n-1;i+=3){const p=points[i],q=points[i+1],a=p.clone().addScaledVector(normals[i],width),b=q.clone().addScaledVector(normals[i+1],width),d=p.clone().addScaledVector(normals[i],-width),e=q.clone().addScaledVector(normals[i+1],-width);
  for(const tri of [[a,b,d],[d,b,e]])for(const weights of [[.2,.3,.5],[.8,.1,.1],[.05,.9,.05]]){const pos=new T.Vector3();tri.forEach((v,k)=>pos.addScaledVector(v,weights[k]));const hit=roadSurface(points,normals,width,open,pos.x,pos.z,i);assert.ok(Math.abs(hit.height-pos.y)<1e-6);const pose=roadAttitude(hit.gx,hit.gz,.8);assert.ok(Number.isFinite(pose.pitch)&&Number.isFinite(pose.roll));}
 }
});
test('flat routes retain zero height and attitude after lateral contact displacement',()=>{
 const p=[{x:0,y:0,z:0},{x:0,y:0,z:10}],n=[{x:1,y:0,z:0},{x:1,y:0,z:0}];const hit=roadSurface(p,n,8,true,3,6,0);assert.equal(hit.height,0);assert.equal(Math.abs(roadAttitude(hit.gx,hit.gz,2).pitch),0);
});
