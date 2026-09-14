import test from 'node:test';
import assert from 'node:assert/strict';
import {raceOrder} from '../src/race-timing';
test('live timing ranks by total progress, freezes finish order and does not mutate input',()=>{
 const entries=[{id:'p',name:'Player',distance:1100,finishTime:null,me:true},{id:'a',name:'A',distance:1200,finishTime:95},{id:'b',name:'B',distance:1500,finishTime:98},{id:'c',name:'C',distance:1150,finishTime:null}];
 assert.deepEqual(raceOrder(entries).map(e=>e.id),['a','b','c','p']);assert.equal(entries[0].id,'p');
 entries[0].distance=1170;assert.deepEqual(raceOrder(entries).map(e=>e.id),['a','b','p','c']);
 assert.equal(raceOrder([entries[0]]).length,1);
});

import {CheckpointTiming} from '../src/race-timing';
test('evenly spaced splits interpolate crossings and compare identical points across laps',()=>{
 const t=new CheckpointTiming(1020);assert.equal(t.count,21);assert.ok(t.spacing<=50);
 const c=new CheckpointTiming(1000);c.sample('a',0,0);c.sample('b',0,0);c.sample('a',100,10);c.sample('b',100,12);
 assert.equal(c.gap('b','a'),2);assert.equal(c.gap('a','b'),null);
 c.sample('a',1050,110);c.sample('b',1050,115);assert.equal(c.gap('b','a'),5);
});
test('splits wait for shared crossings and ignore reverse repeats and teleport resets',()=>{
 const c=new CheckpointTiming(1000);c.sample('a',0,0);c.sample('b',0,0);assert.equal(c.gap('b','a'),null);
 c.sample('a',60,6);c.sample('b',60,8);const gap=c.gap('b','a');c.sample('b',40,9);c.sample('b',60,10);assert.equal(c.gap('b','a'),gap);
 c.sample('b',900,10.01);assert.equal(c.gap('b','a'),null);
});
