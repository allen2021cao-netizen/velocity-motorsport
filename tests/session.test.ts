import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Session,options} from '../src/session.ts';
test('finish-line oscillation cannot count as a completed lap',()=>{const s=new Session();s.start('test','car');s.progress(.9,.01,20);assert.equal(s.complete(20),false);assert.equal(s.best,null);});
test('ordered checkpoints produce a valid lap; reset invalidates best time',()=>{const s=new Session();s.start('test','car');for(const [a,b,t]of[[.24,.26,10],[.49,.51,20],[.74,.76,30]])s.progress(a,b,t);assert.equal(s.complete(40),true);assert.equal(s.best,40);for(const [a,b,t]of[[.24,.26,5],[.49,.51,10],[.74,.76,15]])s.progress(a,b,t);s.invalid=true;assert.equal(s.complete(20),false);assert.equal(s.best,40);});
test('mode defines real race distance',()=>{const s=new Session();options.mode='endurance';s.start('a','b');assert.equal(s.laps,8);options.mode='sprint';s.start('a','b');assert.equal(s.laps,1);});
