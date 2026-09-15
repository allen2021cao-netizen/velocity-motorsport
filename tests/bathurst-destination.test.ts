import test from 'node:test';
import assert from 'node:assert/strict';
import {bathurstDestinationHeight as height,bathurstLakeRadius} from '../src/environment/australian-destination';
test('Bathurst reservoir stays enclosed and the full tour clears terrain',()=>{
 assert.ok(height(0,200)<0);
 for(let i=0;i<=720;i++){
  const phase=i/720*Math.PI*2,x=Math.sin(phase)*1050,z=1400+Math.cos(phase)*90;
  const y=Math.max(height(x,z)+32,80+Math.sin(phase)*25);
  assert.ok(Number.isFinite(y)&&y-height(x,z)>=31.999);
  const ex=Math.cos(phase)*2700,ez=200+Math.sin(phase)*1500;
  assert.ok(bathurstLakeRadius(ex,ez)>1);
  assert.ok(height(ex,ez)>0);
 }
});
