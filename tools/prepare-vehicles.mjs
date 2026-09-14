import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize,transformPrimitive,getBounds,prune,dedup,weld,draco,textureCompress} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4} from 'three';
import sharp from 'sharp';
import fs from 'node:fs';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule(),'meshopt.decoder':MeshoptDecoder});
const specs=[{key:'porsche',length:4.49,wheel:/^Cylinder\.00[01]_[012]$/,caliper:/^Cylinder\.00[01]_3$/,remove:/^Plane_0$/},{key:'bmw',length:4.794,wheel:/^Object_3[34]$/,caliper:/^Object_32$/},{key:'gt40',length:4.183,wheel:/^Object_4[4-7]$/}];
specs.push(
 {key:'f40',length:4.43,wheel:/^Object_(30|31|37|38|39|40)$/,caliper:/^Object_11$/},
 {key:'r34',length:4.6,wheel:/^Object_(13|14)$/},
 {key:'supra-mk4',length:4.52,wheel:/^(esta80_wheel_|3_Wheel|wheel pl.*(1disk|tormoz1))/,caliper:/^wheel pl.*(tormoz2|023|glossBlack)/},
);
for(const spec of specs.filter(s=>!process.argv[2]||process.argv.slice(2).includes(s.key))){
 const doc=await io.read(`artifacts/model-sources/${spec.key}.glb`);await doc.transform(dequantize());
 const scene=doc.getRoot().listScenes()[0],nodes=doc.getRoot().listNodes(),entries=[];
 for(const n of nodes){if(!n.getMesh()||spec.remove?.test(n.getName()))continue;const mesh=n.getMesh().clone();
  for(const original of mesh.listPrimitives()){const p=original.clone();for(const semantic of p.listSemantics())p.setAttribute(semantic,p.getAttribute(semantic).clone());transformPrimitive(p,n.getWorldMatrix());mesh.removePrimitive(original).addPrimitive(p);}
  entries.push({name:n.getName(),mesh});
 }
 for(const n of nodes)n.dispose();for(const e of entries)scene.addChild(doc.createNode(e.name).setMesh(e.mesh));
 const bounds=getBounds(scene),scale=spec.length/(bounds.max[2]-bounds.min[2]);
 const normalize=new Matrix4().makeScale(scale,scale,scale).multiply(new Matrix4().makeTranslation(-(bounds.min[0]+bounds.max[0])/2,-bounds.min[1],-(bounds.min[2]+bounds.max[2])/2));
 for(const e of entries)for(const p of e.mesh.listPrimitives())transformPrimitive(p,normalize.elements);
 const buffer=doc.getRoot().listBuffers()[0];
 for(const n of [...scene.listChildren()]){
  const name=n.getName();if(!spec.wheel.test(name)&&!spec.caliper?.test(name))continue;
  for(const p of n.getMesh().listPrimitives()){
   const pos=p.getAttribute('POSITION'),indices=p.getIndices()?.getArray()??Uint32Array.from({length:pos.getCount()},(_,i)=>i),bins={fl:[],fr:[],rl:[],rr:[]},v=[0,0,0];
   for(let i=0;i<indices.length;i+=3){let x=0,z=0;for(let j=0;j<3;j++){pos.getElement(indices[i+j],v);x+=v[0];z+=v[2];}bins[(z>0?'f':'r')+(x>0?'l':'r')].push(indices[i],indices[i+1],indices[i+2]);}
   for(const [corner,idx] of Object.entries(bins)){if(!idx.length)continue;const part=p.clone().setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer));scene.addChild(doc.createNode((spec.wheel.test(name)?'wheel_':'caliper_')+corner+'_'+name).setMesh(doc.createMesh().addPrimitive(part)));}
  }n.dispose();
 }
 for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='EXT_meshopt_compression')ext.dispose();
 await doc.transform(prune(),dedup(),weld(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:88}),draco({method:'edgebreaker',quantizePosition:16,quantizeNormal:12}));
 doc.getRoot().setExtras({...doc.getRoot().getExtras(),vehiclePreparation:{front:'+Z',up:'+Y',units:'metres',length:spec.length,changes:'Normalized dimensions; removed studio ground; split wheel/caliper assemblies; Draco geometry and WebP textures. Original attribution retained.'}});
 const out=`public/models/${spec.key}-detailed.glb`;await io.write(out,doc);console.log(out,fs.statSync(out).size,getBounds(scene));
}
