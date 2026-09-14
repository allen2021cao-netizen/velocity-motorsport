import test from 'node:test';import assert from 'node:assert/strict';import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import draco from 'draco3dgltf';
test('classic GLBs have grounded articulated wheels, valid geometry and smaller distance bodies',async()=>{
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
 for(const [key,length] of [['f40',4.43],['r34',4.6],['supra-mk4',4.52],['r8',4.43],['mcf1',4.365]] as const){
  const high=await io.read(`public/models/${key}-detailed.glb`),low=await io.read(`public/models/${key}-body-lod.glb`);
  const bounds=getBounds(high.getRoot().listScenes()[0]);assert.ok(Math.abs(bounds.max[2]-bounds.min[2]-length)<.002,key);
  for(const corner of ['fl','fr','rl','rr']){const wheels=high.getRoot().listNodes().filter(n=>n.getName().startsWith(`wheel_${corner}_`));assert.ok(wheels.length,key+corner);const bottom=Math.min(...wheels.map(n=>getBounds(n).min[1]));assert.ok(Math.abs(bottom)<.012,`${key} ${corner} ground contact: ${bottom}`);}
  let fullBody=0,smallBody=0;
  for(const n of high.getRoot().listNodes()){for(const p of n.getMesh()?.listPrimitives()??[]){for(const x of p.getAttribute('POSITION')!.getArray()!)assert.ok(Number.isFinite(x),key);if(!/^(wheel|caliper)_/.test(n.getName()))fullBody+=p.getIndices()!.getCount()/3;}}
  for(const n of low.getRoot().listNodes()){assert.ok(!/^(wheel|caliper)_/.test(n.getName()));for(const p of n.getMesh()?.listPrimitives()??[])smallBody+=p.getIndices()!.getCount()/3;}
  assert.ok(smallBody<fullBody*.65,`${key}: ${smallBody}/${fullBody}`);
 }
});
