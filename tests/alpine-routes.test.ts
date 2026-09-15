import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve,CIRCUITS} from '../src/circuits/circuit';
import {routeIndex,routeFraction,stageCrossing} from '../src/route-progress';
import {roadCurvature} from '../src/race-ai';
for(const theme of ['redbull','arosa'])test(theme+' has correct topology, length, grade and drivable corners',()=>{
 const c=createTrackCurve({theme,base:0,modes:[]}),m=CIRCUITS[theme],open=!!m.pointToPoint;
 assert.equal(c.closed,!open);assert.ok(Math.abs(c.getLength()-m.length)<.1);
 assert.ok(open?c.getPointAt(0).distanceTo(c.getPointAt(1))>1000:c.getPointAt(0).distanceTo(c.getPointAt(1))<.001);
 if(open)assert.ok(Math.abs(c.getPointAt(1).y-c.getPointAt(0).y-422)<.01);
 const n=1400,step=c.getLength()/(open?n-1:n);let down=0;
 for(let i=0;i<n-1;i++){const p=c.getPointAt(i/(open?n-1:n)),q=c.getPointAt((i+1)/(open?n-1:n)),t=c.getTangentAt(i/(open?n-1:n)),u=c.getTangentAt((i+1)/(open?n-1:n));assert.ok(p.toArray().every(Number.isFinite));assert.ok(Math.abs(q.y-p.y)/step<.16);assert.ok(step/Math.max(t.angleTo(u),1e-8)>m.halfWidth);if(q.y<p.y)down+=step;}
 if(open)assert.ok(down>1100&&down<1300);
});
test('open-route endpoints and curvature never wrap to the other end',()=>{
 assert.equal(routeIndex(-1,1400,true),0);assert.equal(routeIndex(1400,1400,true),1399);assert.equal(routeIndex(1400,1400,false),0);assert.equal(routeFraction(1399,1400,true),1);
 const c=Object.assign([14,7,0],{open:true});assert.equal(roadCurvature(c,1,3),0);
});
test('stage finish requires forward crossing, checkpoints and road corridor',()=>{
 assert.equal(stageCrossing(7299,7301,7300,3,0,4.5,100,.1),99.95);
 for(const [before,after,cp,lat] of [[7301,7299,3,0],[7299,7301,2,0],[7299,7301,3,9],[7300,7301,3,0]])assert.equal(stageCrossing(before,after,7300,cp,lat,4.5,100,.1),null);
});
