import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveContacts,overlap,type ContactBody} from '../src/race-contact';
import {freshTactics,tacticalPlan} from '../src/race-tactics';
const body=(x:number,z:number,vx=0,vz=20,heading=0):ContactBody=>({x,z,vx,vz,heading,length:4.3,width:2.1});
const energy=(b:ContactBody[])=>b.reduce((s,c)=>s+c.vx*c.vx+c.vz*c.vz,0);
test('side scrape separates both cars and exchanges lateral momentum without creating energy',()=>{
 const b=[body(0,0,2),body(2,0,0)],before=energy(b);resolveContacts(b);
 assert.equal(overlap(b[0],b[1]),null);assert.ok(b[1].vx>0);assert.ok(b[0].vx<2);assert.ok(energy(b)<=before);
 const v=b.map(c=>c.vx);for(let i=0;i<120;i++)resolveContacts(b);assert.deepEqual(b.map(c=>c.vx),v);
});
test('angled rear impact and crowded start remain finite, separate and dissipate energy',()=>{
 const b=[body(0,0,0,35,.1),body(0,4,0,15),body(1.9,0),body(1.9,4)];const before=energy(b);
 for(let frame=0;frame<120;frame++){for(const c of b){c.x+=c.vx/120;c.z+=c.vz/120;}resolveContacts(b);}
 assert.ok(energy(b)<=before+.0001);for(let i=0;i<b.length;i++){assert.ok(Object.values(b[i]).every(Number.isFinite));for(let j=i+1;j<b.length;j++)assert.ok((overlap(b[i],b[j])?.depth??0)<.001);}
});
test('maximum relative straight-line speed at 120 Hz cannot skip a car',()=>{
 const b=[body(0,0,0,120),body(0,6,0,-120)];let touched=false;
 for(let frame=0;frame<10;frame++){for(const c of b)c.z+=c.vz/120;if(resolveContacts(b).size)touched=true;}
 assert.ok(touched);assert.ok(b[0].z<b[1].z);
});
test('side by side corner retains occupied lanes and blocked traffic slows',()=>{
 const self={dist:100,lat:0,speed:30},m=freshTactics();m.lane=2.8;
 const result=tacticalPlan(self,[{dist:102,lat:2.8,speed:30},{dist:110,lat:0,speed:10}],1000,7,.1,m,.5);
 assert.equal(result.lat,0);assert.ok(result.target<10);
});
test('failed attack enters recovery and waits before retrying',()=>{
 const self={dist:100,lat:0,speed:30},m=freshTactics();
 const others=[{dist:118,lat:0,speed:20}];tacticalPlan(self,others,1000,7,.1,m,0);assert.equal(m.mode,'pass');
 m.age=10;tacticalPlan(self,others,1000,7,.1,m,0);assert.equal(m.mode,'recover');assert.ok(m.cooldown>0);
 tacticalPlan(self,others,1000,7,.1,m,0);assert.equal(m.mode,'recover');
});
test('lapped blocking car across finish line is treated as nearby traffic',()=>{
 const m=freshTactics(),result=tacticalPlan({dist:1995,lat:0,speed:40},[{dist:5,lat:0,speed:10}],1000,7,.1,m,0);
 assert.ok(Number.isFinite(result.target));assert.ok(result.target<10);assert.equal(m.mode,'pass');
});
