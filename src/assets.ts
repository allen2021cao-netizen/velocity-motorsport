import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
/** Separate compressed asset pipeline; all decoder files are served from the same site. */
export async function loadDetailedCar(car:any){
 const draco=new DRACOLoader().setDecoderPath('/draco/');
 try{
  const gltf=await new GLTFLoader().setDRACOLoader(draco).loadAsync('/models/ferrari-458.glb');
  const model=gltf.scene;model.rotation.y=Math.PI;
  const wrapper=new T.Group();wrapper.add(model);wrapper.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(wrapper);const size=bounds.getSize(new T.Vector3());
  const scale=4.55/size.z;wrapper.scale.setScalar(scale);wrapper.position.y=-bounds.min.y*scale;
  wrapper.updateMatrixWorld(true);
  const paint=new T.MeshPhysicalMaterial({color:0xb31321,metalness:.65,roughness:.23,clearcoat:1,clearcoatRoughness:.1});
  const glass=new T.MeshPhysicalMaterial({color:0xb3d5df,metalness:.08,roughness:.07,transparent:true,opacity:.25,depthWrite:false});
  const brakeLight=new T.MeshStandardMaterial({color:0x8d0804,emissive:0xff1109,emissiveIntensity:.7});
  const wheels:T.Group[]=[],frontPivots:T.Group[]=[];
  const rubber=new T.MeshStandardMaterial({color:0x141617,roughness:.92});
  const leather=new T.MeshStandardMaterial({color:0x292321,roughness:.84});
  const alloy=new T.MeshStandardMaterial({color:0xaeb5b7,metalness:1,roughness:.27});
  model.traverse(obj=>{const m=obj as T.Mesh;if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;if(m.name==='body')m.material=paint;if(m.name==='glass')m.material=glass;if(m.name==='lights_red')m.material=brakeLight;if(/tire|grill|carbon|carpet|plastic/.test(m.name))m.material=rubber;if(/leather|interior/.test(m.name))m.material=leather;if(/rim_|chrome|metal|centre|nuts/.test(m.name))m.material=alloy;});
  const oldGeo=new Set<T.BufferGeometry>(),oldMat=new Set<T.Material>();car.group.traverse((o:T.Object3D)=>{const m=o as T.Mesh;if(m.isMesh){oldGeo.add(m.geometry);(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>oldMat.add(x));}});
  car.group.clear();oldGeo.forEach(g=>g.dispose());oldMat.forEach(m=>m.dispose());
  const body=new T.Group();car.group.add(body);body.add(wrapper);car.group.updateMatrixWorld(true);
  // World-space attachment preserves the imported wheel transforms while exposing a metre-based axle.
  for(const name of ['wheel_fl','wheel_fr','wheel_rl','wheel_rr']){
   const wheel=model.getObjectByName(name);if(!wheel)continue;
   const pos=wheel.getWorldPosition(new T.Vector3());car.group.worldToLocal(pos);
   const pivot=new T.Group();pivot.position.copy(pos);car.group.add(pivot);const spin=new T.Group();pivot.add(spin);spin.updateMatrixWorld(true);spin.attach(wheel);wheels.push(spin);if(name.includes('_f'))frontPivots.push(pivot);
  }
  const steeringWheel=model.getObjectByName('steering_wheel');
  const steeringPosition=steeringWheel?body.worldToLocal(steeringWheel.getWorldPosition(new T.Vector3())):new T.Vector3(.34,.78,.2);
  car.group.userData.dimensions={length:4.55,width:size.x*scale,height:size.y*scale,wheelbase:2.65};
  Object.assign(car,{bodyParts:body,wheels,frontPivots,flames:[],glowPlane:new T.Group(),brakeLight,detailed:true,modelKind:'imported-glb',wheelRadius:.34,cockpit:{x:steeringPosition.x,y:T.MathUtils.clamp(steeringPosition.y+.22,.95,1.14),z:steeringPosition.z-.45},bonnet:{x:0,y:.83,z:1.84},steeringWheel});
 }finally{draco.dispose();}
}
