import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve,CIRCUITS,circuitCurvature} from '../src/circuits/circuit';
import {TRACKS} from '../src/tracks.js';
import {aiTargetSpeed} from '../src/race-ai';
for(const track of TRACKS.filter(t=>CIRCUITS[t.theme]&&!CIRCUITS[t.theme].mountain))test(track.theme+' route is closed, metre-scaled, drivable and brake-aware',()=>{
 const meta=CIRCUITS[track.theme],curve=createTrackCurve(track),n=1400,seg=curve.getLength()/n,ps=Array.from({length:n},(_,i)=>curve.getPointAt(i/n)),ts=ps.map((_,i)=>curve.getTangentAt(i/n));
 assert.ok(Math.abs(curve.getLength()-meta.length)<.1);assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1))<.0001);
 let minRadius=Infinity,gap=Infinity;for(let i=0;i<n;i++){assert.ok(ps[i].toArray().every(Number.isFinite));assert.ok(Math.abs(ps[i].distanceTo(ps[(i+1)%n])-seg)<seg*.1);minRadius=Math.min(minRadius,seg/Math.max(.000001,ts[i].angleTo(ts[(i+1)%n])));for(let j=i+1;j<n;j++)if(Math.min(j-i,n-j+i)*seg>65)gap=Math.min(gap,ps[i].distanceTo(ps[j]));}
 assert.ok(minRadius>meta.halfWidth,'inner road edge must not fold');assert.ok(gap>meta.halfWidth*2+1,'separate branches must have distinct walls');
 const curvature=circuitCurvature(ts),tight=curvature.indexOf(Math.max(...curvature)),setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'},car={top:325,accel:.9,handling:.9};
 const speed=aiTargetSpeed(curvature,seg,tight,car,setup,2);assert.ok(speed<16,'AI must slow for the tightest corner');assert.ok(speed>3,'tightest corner is traversable');
 console.log(track.theme,{length:meta.length,minRadius:minRadius.toFixed(2),branchGap:gap.toFixed(2),tightCornerKmh:(speed*3.6).toFixed(1)});
});
