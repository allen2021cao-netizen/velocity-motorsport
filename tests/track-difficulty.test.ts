import test from 'node:test';
import assert from 'node:assert/strict';
import {TRACKS,TRACK_REGIONS} from '../src/tracks.js';
import {evaluateTrack,difficultyScore} from '../src/track-difficulty';
test('all displayed track ratings reproduce the current geometry and native conditions',()=>{
 assert.equal(TRACKS.length,17);assert.ok(TRACKS.every(t=>t.theme!=='alps'));assert.deepEqual(TRACKS.map(t=>t.theme),TRACK_REGIONS.flatMap(r=>r.themes));for(const t of TRACKS){const r=evaluateTrack(t);assert.equal(t.stars,r.stars,t.theme);assert.equal(t.difficulty.score,r.score,t.theme);assert.ok(r.stars>=1&&r.stars<=5);}
});
test('narrower roads, stronger braking, tighter curves and poor weather never lower difficulty',()=>{
 const m={turningPerKm:5,tightFraction:.05,brakingPerKm:100,halfWidth:8,time:'day'};const score=difficultyScore(m);
 for(const patch of [{halfWidth:4},{precip:'rain'},{precip:'snow'},{time:'night'},{turningPerKm:12},{tightFraction:.2},{brakingPerKm:200}])assert.ok(difficultyScore({...m,...patch})>score);
});
