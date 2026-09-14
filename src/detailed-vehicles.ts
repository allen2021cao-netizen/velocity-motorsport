import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {supplementPorscheCabin} from './porsche-cabin';

export const DETAILED_VEHICLES={
 p911:{file:'porsche',wheelbase:2.45,cockpit:{x:.35,y:1.00,z:-.35},hood:.95,paint:/^(paint|coat)$/,glass:/^(window|glass)$/,brake:/^tex_shiny$/,author:'Karol Miklas / Lionsharp Studios',name:'Porsche 911 Carrera 4S'},
 m3:{file:'bmw',wheelbase:2.857,cockpit:{x:.37,y:1.13,z:-.18},hood:.95,paint:/body151/i,glass:/windows/i,brake:/redlight/i,author:'SRT Performance',name:'BMW M4 Competition M Package'},
 gt40:{file:'gt40',wheelbase:2.413,cockpit:{x:-.32,y:.84,z:-.45},hood:1.4,paint:/^Paint1/i,glass:/Meshpart14Mtl/,brake:/Meshpart12Mtl/,author:'vecarz',name:'Ford GT40 Mark II'},
};
export async function loadAdditionalCars(cars:any[]){
 const decoder=new DRACOLoader().setDecoderPath('/draco/').setWorkerLimit(2),loader=new GLTFLoader().setDRACOLoader(decoder);
 try{for(const car of cars){const spec=DETAILED_VEHICLES[car.cfg.type as keyof typeof DETAILED_VEHICLES];if(!spec)continue;
  try{
   const model=(await loader.loadAsync('/models/'+spec.file+'-detailed.glb')).scene;
   const body=new T.Group();body.add(model);body.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(body),size=bounds.getSize(new T.Vector3());
   const materialCache=new Map<T.Material,T.Material>();const brakeMaterials:T.MeshStandardMaterial[]=[];
   model.traverse(o=>{const mesh=o as T.Mesh;if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;
    const rear=new T.Box3().setFromObject(mesh).max.z<-.45;
    function finish(original:T.Material){const brake=rear&&spec.brake.test(original.name);if(!brake&&materialCache.has(original))return materialCache.get(original)!;
     const m=(original as T.MeshStandardMaterial).clone() as T.MeshPhysicalMaterial; m.side=T.DoubleSide;
     if(spec.paint.test(m.name)){m.roughness=Math.max(.18,Math.min(m.roughness,.32));m.metalness=Math.min(.7,Math.max(.35,m.metalness));if(m.isMeshPhysicalMaterial){m.clearcoat=1;m.clearcoatRoughness=.11;}}
     if(spec.glass.test(m.name)){m.transparent=true;m.opacity=Math.min(m.opacity,.25);m.depthWrite=false;m.roughness=.08;if(m.isMeshPhysicalMaterial)m.transmission=0;mesh.castShadow=false;}
     if(spec.file==='gt40'&&!spec.glass.test(m.name)&&m.opacity>.94){m.transparent=false;m.opacity=1;m.depthWrite=true;m.alphaTest=.3;}
     if(spec.file==='bmw'&&/Meshes(interior71|chrome51)Mtl/i.test(m.name)){m.color.set(0x25282b);m.metalness=0;m.roughness=.68;}
     if(spec.file==='porsche'&&/^(full_black|rubber)$/.test(m.name)){m.color.set(0x242529);m.metalness=0;m.roughness=.85;}
     if(spec.file==='porsche'&&m.name==='lights'){m.transmission=0;m.opacity=.45;m.depthWrite=false;}
     if(brake){brakeMaterials.push(m);}
     if(m.map)m.map.anisotropy=8;if(m.normalMap)m.normalMap.anisotropy=8;
     if(!brake)materialCache.set(original,m);return m;
    }
    mesh.material=Array.isArray(mesh.material)?mesh.material.map(finish):finish(mesh.material);
   });
   // The source Porsche is posed with steering applied; neutralize it before rigging.
   if(spec.file==='porsche'){
    for(const corner of ['fl','fr']){
     const parts:T.Mesh[]=[];model.traverse(o=>{if((o as T.Mesh).isMesh&&o.name.startsWith('wheel_'+corner+'_'))parts.push(o as T.Mesh);});
     const box=new T.Box3();parts.forEach(p=>box.union(new T.Box3().setFromObject(p)));const c=box.getCenter(new T.Vector3());
     model.traverse(o=>{if((o as T.Mesh).isMesh&&o.name.startsWith('caliper_'+corner+'_'))parts.push(o as T.Mesh);});
     const matrix=new T.Matrix4().makeTranslation(corner==='fl'?.76296:-.76296,c.y,1.227345).multiply(new T.Matrix4().makeRotationY(.30)).multiply(new T.Matrix4().makeTranslation(-c.x,-c.y,-c.z));
     for(const part of parts){part.geometry=part.geometry.clone().applyMatrix4(matrix);part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();}
    }
   }
   const wheels:T.Group[]=[],frontPivots:T.Group[]=[],rig=new T.Group(),axles:number[]=[],radii:number[]=[];
   for(const corner of ['fl','fr','rl','rr']){
    const parts:T.Object3D[]=[];model.traverse(o=>{if(o.name.startsWith('wheel_'+corner+'_'))parts.push(o);});if(!parts.length)throw Error('Missing wheel '+corner);
    const box=new T.Box3();parts.forEach(p=>box.union(new T.Box3().setFromObject(p)));const centre=box.getCenter(new T.Vector3());radii.push((box.max.y-box.min.y)/2);axles.push(centre.z);
    const pivot=new T.Group();pivot.name='axle_'+corner;pivot.position.copy(centre);rig.add(pivot);const spin=new T.Group();spin.name='spin_'+corner;pivot.add(spin);rig.updateMatrixWorld(true);parts.forEach(p=>spin.attach(p));
    const calipers:T.Object3D[]=[];model.traverse(o=>{if(o.name.startsWith('caliper_'+corner+'_'))calipers.push(o);});calipers.forEach(p=>pivot.attach(p));wheels.push(spin);if(corner[0]==='f')frontPivots.push(pivot);
   }
   const hoodRay=new T.Raycaster(new T.Vector3(0,4,spec.hood),new T.Vector3(0,-1,0));body.updateMatrixWorld(true);const hit=hoodRay.intersectObject(body,true)[0];
   const geo=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();car.group.traverse((o:T.Object3D)=>{const m=o as T.Mesh;if(m.isMesh){geo.add(m.geometry);(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>mats.add(x));}});car.group.clear();geo.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());car.group.add(body,rig);
   const brakeLight={set emissiveIntensity(value:number){for(const m of brakeMaterials){m.emissive.set(0xd90a03);m.emissiveIntensity=value*.18;}}};
   Object.assign(car,{bodyParts:body,wheels,frontPivots,flames:[],glowPlane:new T.Group(),brakeLight,detailed:true,modelKind:'imported-glb',wheelRadius:radii.reduce((a,b)=>a+b)/4,cockpit:spec.cockpit,bonnet:{x:0,y:(hit?.point.y??size.y*.6)+.19,z:spec.hood},steeringWheel:null,assetCredit:spec.author,assetName:spec.name});
   car.group.userData.dimensions={length:size.z,width:size.x,height:size.y,wheelbase:(axles[0]+axles[1]-axles[2]-axles[3])/2};
   if(spec.file==='porsche')car.steeringWheel=supplementPorscheCabin(body);
  }catch(error){console.warn('Detailed model unavailable for '+car.cfg.type,error);car.assetError=true;}
 }}finally{decoder.dispose();}
}
