import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3,InstancedMesh,SphereGeometry,MeshBasicMaterial} from 'three';
import {Architecture} from '../src/environment/geometry';
import {EnvironmentDetail} from '../src/environment/detail';

test('spatial sphere batches preserve all scenery and retain fewer triangles at distance',()=>{
 const root=new Group(),resources:{dispose:()=>void}[]=[],a=new Architecture(root,resources),mat=a.material(0x337733);
 for(const x of [0,10,400,410])a.sphere(mat,x,3,0,3);
 const stats=a.finish();assert.equal(stats.instances,4);assert.equal(stats.batches,2);
 const meshes=root.children as InstancedMesh[];
 assert.equal(meshes.reduce((n,m)=>n+m.count,0),4);
 const detail=new EnvironmentDetail();detail.register(root);detail.update(new Vector3(0,0,0));
 assert.ok(meshes[1].geometry.index!.count<meshes[0].geometry.index!.count);
 detail.setQuality('high');detail.update(new Vector3(0,0,0));assert.equal(meshes[1].geometry,meshes[0].geometry);
 detail.update(new Vector3(3000,0,0));assert.deepEqual(detail.snapshot().levels,[0,0,2]);
 detail.update(new Vector3(0,0,0));assert.deepEqual(detail.snapshot().levels,[2,0,0]);
 resources.forEach(resource=>resource.dispose());
});
test('large landmark spheres keep their original geometry even at low quality',()=>{
 const root=new Group(),resources:{dispose:()=>void}[]=[],a=new Architecture(root,resources),mat=a.material(0x5588aa);
 a.sphere(mat,900,60,0,40);a.finish();const mesh=root.children[0] as InstancedMesh,geometry=mesh.geometry;
 const detail=new EnvironmentDetail();detail.register(root);detail.setQuality('low');detail.update(new Vector3());assert.equal(mesh.geometry,geometry);assert.equal(detail.snapshot().batches,0);
 resources.forEach(r=>r.dispose());
});

test('destination forests use their translated world positions for detail',()=>{
 const root=new Group(),resources:{dispose:()=>void}[]=[],a=new Architecture(root,resources);root.position.x=40000;
 a.sphere(a.material(0x557755),0,3,0,3);a.finish();const detail=new EnvironmentDetail();detail.register(root);
 detail.update(new Vector3(40000,3,0));assert.deepEqual(detail.snapshot().levels,[1,0,0]);
 detail.update(new Vector3(0,0,0));assert.deepEqual(detail.snapshot().levels,[0,0,1]);resources.forEach(r=>r.dispose());
});
test('detail changes use a distance margin and preview restores full geometry',()=>{
 const root=new Group(),levels=[new SphereGeometry(1,24,16),new SphereGeometry(1,16,10),new SphereGeometry(1,8,6)];
 const mesh=new InstancedMesh(levels[0],new MeshBasicMaterial(),1);mesh.computeBoundingSphere();mesh.userData.environmentLods=levels;root.add(mesh);
 const detail=new EnvironmentDetail();detail.register(root);
 detail.update(new Vector3(220,0,0));assert.equal(mesh.geometry,levels[1]);
 detail.update(new Vector3(160,0,0));assert.equal(mesh.geometry,levels[1]);
 detail.update(new Vector3(130,0,0));assert.equal(mesh.geometry,levels[0]);
 detail.setQuality('low');detail.update(new Vector3());assert.equal(mesh.geometry,levels[1]);
 detail.update(new Vector3(900,0,0));assert.equal(mesh.geometry,levels[2]);
 detail.update(new Vector3(900,0,0),true);assert.equal(mesh.geometry,levels[0]);
 levels.forEach(g=>g.dispose());mesh.material.dispose();mesh.dispose();
});
