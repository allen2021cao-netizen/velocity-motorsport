import test from 'node:test';
import assert from 'node:assert/strict';
import {fujiGeometry,fujiHeight} from '../src/environment/fuji-mountain';
test('winter Fuji has a continuous finite radial surface and a recessed summit',()=>{
 const g=fujiGeometry(),p=g.attributes.position,n=g.attributes.normal;
 assert.ok(Array.from(p.array).every(Number.isFinite));assert.ok(Array.from(n.array).every(Number.isFinite));
 for(let ring=0;ring<=144;ring++)for(let axis=0;axis<3;axis++)assert.ok(Math.abs(p.array[(ring*257)*3+axis]-p.array[(ring*257+256)*3+axis])<.001);
 assert.ok(fujiHeight(0,0)<fujiHeight(100,0));assert.ok(fujiHeight(5900,0)<0);
 assert.ok(g.index!.count/3<80000);g.dispose();
});
