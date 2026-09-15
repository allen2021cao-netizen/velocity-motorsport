import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function setupGraphics(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera,sun:T.DirectionalLight){
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.info.autoReset=false;
 const generator=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
 const studioEnvironment=generator.fromScene(room,.04).texture;scene.environment=studioEnvironment;room.dispose();generator.dispose();
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=.1;sun.shadow.camera.far=200;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun.target);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.20,.45,1.15);composer.addPass(bloom);composer.addPass(new OutputPass());
 let quality='high';
 const studioColor=new T.Color(0x1c232a),savedSunColor=new T.Color(),defaultOffset=new T.Vector3(-35,60,25);
 return {
  quality(q:string){
   quality=q;renderer.shadowMap.enabled=q!=='low';
   const size=q==='high'?2048:1024;
   if(sun.shadow.mapSize.x!==size){sun.shadow.mapSize.set(size,size);sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.needsUpdate=true;}
  },
  resize(){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);},
  render(focus:T.Vector3,overview=false,studio=false,viewport?:DOMRect){
   const background=scene.background,environment=scene.environment,fog=scene.fog,intensity=scene.environmentIntensity,rotation=scene.environmentRotation.y,sunIntensity=sun.intensity;
   if(studio){savedSunColor.copy(sun.color);scene.background=studioColor;scene.environment=studioEnvironment;scene.environmentIntensity=1.25;scene.environmentRotation.y=0;scene.fog=null;sun.intensity=2.4;sun.color.set(0xfff5e9);}
   renderer.info.reset();const extent=overview?460:32;
   sun.shadow.bias=overview?-.0007:-.0001;sun.shadow.normalBias=overview?.5:.035;
   if(sun.shadow.camera.right!==extent){sun.shadow.camera.left=-extent;sun.shadow.camera.right=extent;sun.shadow.camera.top=extent;sun.shadow.camera.bottom=-extent;sun.shadow.camera.far=overview?1600:200;sun.shadow.camera.updateProjectionMatrix();}
   sun.position.copy(focus).addScaledVector(sun.userData.offset??defaultOffset,overview?10:1);sun.target.position.copy(focus);
   if(viewport){
    renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.setClearColor(0x0d161d,1);renderer.clear();
    const y=innerHeight-viewport.bottom;renderer.setViewport(viewport.left,y,viewport.width,viewport.height);renderer.setScissor(viewport.left,y,viewport.width,viewport.height);renderer.setScissorTest(true);renderer.render(scene,camera);renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);
   }else if(quality==='high')composer.render();else renderer.render(scene,camera);
   if(studio){scene.background=background;scene.environment=environment;scene.environmentIntensity=intensity;scene.environmentRotation.y=rotation;scene.fog=fog;sun.intensity=sunIntensity;sun.color.copy(savedSunColor);}
  }
 };
}
export function enhanceCar(car:any){
 const materials=new Map<T.Material,T.Material>();
 car.group.traverse((obj:T.Object3D)=>{const m=obj as T.Mesh;if(!m.isMesh)return;m.castShadow=!m.material || !(m.material as T.Material).transparent;m.receiveShadow=true;
 const old=m.material as T.MeshPhongMaterial;if(!old.isMeshPhongMaterial)return;
 if(!materials.has(old)){
  const paint=old.shininess===110,glass=old.shininess===180;
  const mat=new T.MeshPhysicalMaterial({color:old.color,map:old.map,metalness:paint?.65:glass?.08:old.shininess>80?.86:.22,roughness:paint?.23:glass?.09:old.shininess>80?.27:.72,clearcoat:paint?1:0,clearcoatRoughness:.13,envMapIntensity:paint?1.3:.85});
  materials.set(old,mat);
 }
 m.material=materials.get(old)!;
 });
 const body=car.bodyParts as T.Group;
 const carbon=new T.MeshStandardMaterial({color:0x13171a,roughness:.58,metalness:.3});
 const alloy=new T.MeshStandardMaterial({color:0xd6dce0,metalness:1,roughness:.25});
 const red=new T.MeshStandardMaterial({color:0xda3022,roughness:.42,metalness:.5});
 const w=car.cfg.type==='p911'?.82:.88;
 const box=(sx:number,sy:number,sz:number,x:number,y:number,z:number,mat:T.Material)=>{const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=true;body.add(m);return m;};
 for(const side of [-1,1]){
  box(.025,.014,1.4,side*w,.53,.05,carbon);box(.025,.075,.17,side*(w+.01),.69,-.15,alloy);
  box(.02,.50,.025,side*w,.48,-.57,carbon);
  for(const z of [-1.42,1.42]){
   box(.055,.2,.1,side*(w-.06),.35,z+.10,red);
   const ring=new T.Mesh(new T.TorusGeometry(.24,.012,6,36),alloy);ring.rotation.y=Math.PI/2;ring.position.set(side*(w+.10),.34,z);car.group.add(ring);
   for(let i=0;i<8;i++){const bolt=new T.Mesh(new T.SphereGeometry(.017,5,4),carbon);bolt.position.set(side*(w+.105),.34+Math.sin(i*Math.PI/4)*.16,z+Math.cos(i*Math.PI/4)*.16);car.group.add(bolt);}
  }
  box(.43,.09,.58,side*.40,.42,-.16,carbon);box(.43,.49,.11,side*.40,.65,-.42,carbon);
 }
 for(let i=-2;i<=2;i++)box(.026,.12,.35,i*.22,.19,-2.13,carbon);
 const brakeLight=new T.MeshStandardMaterial({color:0xaa1212,emissive:0xff1b0b,emissiveIntensity:.6});
 box(.9,.035,.028,0,.78,-2.16,brakeLight);car.brakeLight=brakeLight;
 // Body and wheel assemblies move as units; combine static parts inside each assembly.
 for(const group of [body,...car.wheels]){
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert();const bins=new Map<T.Material,T.Mesh[]>();
  group.traverse((o:T.Object3D)=>{const m=o as T.Mesh;if(m.isMesh&&!Array.isArray(m.material)&&!m.material.transparent&&m.geometry.attributes.normal&&m.geometry.attributes.uv){const list=bins.get(m.material)||[];list.push(m);bins.set(m.material,list);}});
  for(const [mat,list] of bins){if(list.length<3)continue;const gs=list.map(m=>(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(inverse.clone().multiply(m.matrixWorld)));const g=mergeGeometries(gs);gs.forEach(x=>x.dispose());if(g){const mesh=new T.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);list.forEach(x=>x.removeFromParent());}}
 }
}
