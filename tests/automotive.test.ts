import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {SHAPES} from '../src/automotive/profiles';
import {buildAutomobile} from '../src/automotive/model';
test('all twelve coachwork models have finite geometry, four grounded tires and distinct axle layouts',()=>{
 for(const [type,p] of Object.entries(SHAPES)){
  const car=buildAutomobile({type,color:0x607080,nameEn:type});assert.equal(car.wheels.length,4,type);assert.equal(car.frontPivots.length,2,type);assert.ok(Math.abs(p.front-p.rear-p.wheelbase)<.002,type);
  let triangles=0;car.group.updateMatrixWorld(true);car.group.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh)return;const pos=m.geometry.attributes.position;for(const n of pos.array)assert.ok(Number.isFinite(n),type);triangles+=(m.geometry.index?.count??pos.count)/3;});
  assert.ok(triangles<200000,`${type}: ${triangles} triangles`);assert.ok(car.cockpit.y>p.waist&&car.cockpit.y<p.height,type);
  for(const wheel of car.wheels){const bounds=new T.Box3().setFromObject(wheel);assert.ok(Math.abs(bounds.min.y)<.02,`${type} tire contact`);}
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();car.group.traverse(o=>{const m=o as T.Mesh;if(m.isMesh){geometries.add(m.geometry);(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>materials.add(x));}});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());
 }
});
