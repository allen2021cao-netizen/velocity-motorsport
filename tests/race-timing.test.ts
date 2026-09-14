import test from 'node:test';
import assert from 'node:assert/strict';
import {raceOrder} from '../src/race-timing';
test('live timing ranks by total progress, freezes finish order and does not mutate input',()=>{
 const entries=[{id:'p',name:'Player',distance:1100,finishTime:null,me:true},{id:'a',name:'A',distance:1200,finishTime:95},{id:'b',name:'B',distance:1500,finishTime:98},{id:'c',name:'C',distance:1150,finishTime:null}];
 assert.deepEqual(raceOrder(entries).map(e=>e.id),['a','b','c','p']);assert.equal(entries[0].id,'p');
 entries[0].distance=1170;assert.deepEqual(raceOrder(entries).map(e=>e.id),['a','b','p','c']);
 assert.equal(raceOrder([entries[0]]).length,1);
});
