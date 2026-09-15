import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve,CIRCUITS} from '../src/circuits/circuit';
for(const theme of ['suzuka','fuji'])test(theme+' is a continuous, metre-scaled closed circuit with usable slopes',()=>{
 const c=createTrackCurve({theme,base:0,modes:[]}),meta=CIRCUITS[theme];let maxGrade=0,minRadius=Infinity,minY=Infinity,maxY=-Infinity;
 assert.ok(c.closed);assert.ok(Math.abs(c.getLength()-meta.length)<.1);assert.ok(c.getPointAt(0).distanceTo(c.getPointAt(1))<.001);
 for(let i=0;i<1400;i++){const p=c.getPointAt(i/1400),q=c.getPointAt((i+1)/1400),t=c.getTangentAt(i/1400),u=c.getTangentAt((i+1)/1400);assert.ok(p.toArray().every(Number.isFinite));maxGrade=Math.max(maxGrade,Math.abs(q.y-p.y)/Math.hypot(q.x-p.x,q.z-p.z));minRadius=Math.min(minRadius,p.distanceTo(q)/Math.max(t.angleTo(u),1e-8));minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
 assert.ok(maxGrade<.25,`grade ${maxGrade}`);assert.ok(minRadius>meta.halfWidth,`radius ${minRadius}`);if(theme==='bathurst')assert.ok(Math.abs(maxY-minY-174)<.2);
 console.log(theme,{maxGrade,minRadius,height:maxY-minY});
});
