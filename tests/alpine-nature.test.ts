import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {alpineMassif,firGeometry} from '../src/environment/alpine-nature';
test('massif is finite, continuous at its seam and stays outside the driving bounds',()=>{
 const box=new T.Box3(new T.Vector3(-1800,-60,-500),new T.Vector3(600,422,4000));const g=alpineMassif(box,true),p=g.attributes.position;
 for(let i=0;i<p.count;i++){assert.ok([p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite));assert.ok(p.getX(i)<box.min.x||p.getX(i)>box.max.x||p.getZ(i)<box.min.z||p.getZ(i)>box.max.z);}
 for(let r=0;r<=56;r++){const a=r*385,b=a+384;assert.ok(Math.hypot(p.getX(a)-p.getX(b),p.getY(a)-p.getY(b),p.getZ(a)-p.getZ(b))<.01);}
 assert.ok(p.count<25000);g.dispose();
});
test('forest distance levels reduce triangles while preserving tree height',()=>{
 const levels=[firGeometry(11,6),firGeometry(7,4),firGeometry(4,3)];const tris=levels.map(g=>g.index!.count/3);assert.ok(tris[0]>tris[1]&&tris[1]>tris[2]);for(const g of levels){g.computeBoundingBox();assert.ok(g.boundingBox!.max.y>15);g.dispose();}
});
