import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,MeshBasicMaterial,CanvasTexture} from 'three';
import {makeR34Cabin} from '../src/classic-cabins';

test('GTR display skips hidden uploads and limits visible redraws without rebuilding textures',t=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'document');
 const context=new Proxy({}, {get:()=>()=>{},set:()=>true});
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({width:0,height:0,getContext:()=>context})}});
 let now=0;t.mock.method(performance,'now',()=>now);
 const body=new Group(),cabin=makeR34Cabin(body);let texture:CanvasTexture|undefined;
 body.traverse(o=>{const map=((o as Mesh).material as MeshBasicMaterial)?.map;if(map?.image?.height===256)texture=map as CanvasTexture;});
 assert.ok(texture);const initial=texture.version;
 cabin.update(50,2,false);assert.equal(texture.version,initial);
 cabin.update(50,2,true);assert.equal(texture.version,initial+1);
 now=20;cabin.update(80,3,true);assert.equal(texture.version,initial+1);
 now=120;cabin.update(80,3,true);assert.equal(texture.version,initial+2);
 assert.equal(texture.generateMipmaps,false);
 const version=texture.version;for(let i=0;i<300;i++)cabin.update(i,4,false);assert.equal(texture.version,version);
 body.traverse(o=>{const m=o as Mesh;if(m.isMesh){m.geometry.dispose();const materials=Array.isArray(m.material)?m.material:[m.material];materials.forEach(mat=>{(mat as MeshBasicMaterial).map?.dispose();mat.dispose();});}});
 if(old)Object.defineProperty(globalThis,'document',old);else Reflect.deleteProperty(globalThis,'document');
});
