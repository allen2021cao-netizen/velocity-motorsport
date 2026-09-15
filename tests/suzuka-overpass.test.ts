import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackCurve} from '../src/circuits/circuit';
import {overlap,resolveContacts} from '../src/race-contact';
test('Suzuka crossing has clearance and keeps vehicles on different levels independent',()=>{
 const c=createTrackCurve({theme:'suzuka',base:0,modes:[]}),n=1400,p=Array.from({length:n},(_,i)=>c.getPointAt(i/n));let best=Infinity,pair=[0,0];
 for(let i=0;i<n;i++)for(let j=i+100;j<n;j++){if(n-j+i<100)continue;const d=Math.hypot(p[i].x-p[j].x,p[i].z-p[j].z);if(d<best){best=d;pair=[i,j];}}
 const [a,b]=pair.map(i=>p[i]);assert.ok(best<5);assert.ok(b.y-a.y>7,`clearance ${b.y-a.y}`);
 const body={x:0,z:0,heading:0,vx:10,vz:10,length:4.3,width:2.1},cars=[{...body,y:a.y},{...body,y:b.y}];assert.equal(overlap(cars[0],cars[1]),null);assert.equal(resolveContacts(cars).size,0);assert.equal(cars[0].x,0);
 assert.ok(overlap({...body,y:10},{...body,y:10.3}));
});
