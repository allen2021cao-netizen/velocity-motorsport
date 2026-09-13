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
 scene.environment=generator.fromScene(room,.04).texture;room.dispose();generator.dispose();
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=.1;sun.shadow.camera.far=200;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun.target);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.20,.45,1.15);composer.addPass(bloom);composer.addPass(new OutputPass());
 let quality='high';
 return {quality(q:string){quality=q;renderer.shadowMap.enabled=q!=='low';},resize(){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);},render(focus:T.Vector3){renderer.info.reset();sun.position.copy(focus).add(new T.Vector3(-35,60,25));sun.target.position.copy(focus);if(quality==='high')composer.render();else renderer.render(scene,camera);}};
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
const CITY_SIGNS:Record<string,string[]>={tokyo:['湾岸線 / BAYSHORE','東京港 / TOKYO PORT'],shanghai:['中山东一路 / THE BUND','陆家嘴 / LUJIAZUI'],hongkong:['中環 / CENTRAL','維多利亞港 / VICTORIA'],london:['WESTMINSTER','THAMES EMBANKMENT'],paris:['QUAI DE SEINE','AVENUE FOCH'],monaco:['MONTE CARLO','PORT HERCULE'],newyork:['FDR DRIVE','LOWER MANHATTAN'],vegas:['LAS VEGAS BLVD','THE STRIP'],dubai:['DOWNTOWN DUBAI','SHEIKH ZAYED RD'],miami:['OCEAN DRIVE','SOUTH BEACH'],la:['SUNSET BLVD','PACIFIC COAST'],alps:['COL DES ALPES','MOUNTAIN PASS']};
/** Roadside details follow the circuit tangent, keeping the drivable corridor clear. */
export function enhanceTrack(world:T.Group,points:T.Vector3[],normals:T.Vector3[],theme:string,wet:boolean,disposables:any[]){
 const keep=<A>(v:A):A=>{disposables.push(v);return v;};
 const steel=keep(new T.MeshStandardMaterial({color:0x777f83,metalness:.7,roughness:.45}));
 const concrete=keep(new T.MeshStandardMaterial({color:0x777c77,roughness:.94}));
 const box=keep(new T.BoxGeometry(1,1,1));
 const add=(geo:T.BufferGeometry,mat:T.Material,p:T.Vector3,scale:T.Vector3,heading:number)=>{const m=new T.Mesh(geo,mat);m.position.copy(p);m.scale.copy(scale);m.rotation.y=heading;m.receiveShadow=true;world.add(m);};
 for(let i=0;i<points.length;i+=24){const p=points[i],n=normals[i];const heading=Math.atan2(n.x,n.z);
  for(const side of [-1,1]){const pos=p.clone().addScaledVector(n,side*9.5);pos.y=.08;add(box,concrete,pos,new T.Vector3(2.5,.16,2.5),heading);pos.y=1.5;add(box,steel,pos,new T.Vector3(.06,2.8,.06),heading);}
 }
 const names=CITY_SIGNS[theme]||[theme.toUpperCase()];
 if(theme==='shanghai'){
  // A readable Bund composition: historic bank on one side, river and Pudong skyline opposite.
  // Artistic geography, not a surveyed street reconstruction.
  const edge=Math.max(...points.map(p=>p.x));
  const water=keep(new T.MeshPhysicalMaterial({color:0x294d57,roughness:.22,metalness:.5,clearcoat:1}));
  add(box,water,new T.Vector3(edge+260,-.18,0),new T.Vector3(470,.1,1800),0);
  const facade=keep(new T.MeshStandardMaterial({color:0x57717b,metalness:.65,roughness:.29}));
  const glow=keep(new T.MeshStandardMaterial({color:0x9dcccc,emissive:0x385a69,emissiveIntensity:.5,metalness:.6,roughness:.22}));
  const towerX=edge+380;
  for(let level=0;level<18;level++){
   const r=19-level*.65;const geo=keep(new T.CylinderGeometry(r-.5,r,9,7));
   add(geo,level%2?facade:glow,new T.Vector3(towerX,level*9+4.5,-40),new T.Vector3(1,1,1),level*.055);
  }
  for(let level=0;level<12;level++){
   const width=24-level*1.35;add(box,facade,new T.Vector3(towerX-36,level*9+4.5,12),new T.Vector3(width,9,width),0);
  }
  add(box,facade,new T.Vector3(towerX+12,63,64),new T.Vector3(30,126,15),0);
  add(box,glow,new T.Vector3(towerX+12,135,64),new T.Vector3(30,5,15),0);
  for(const dx of [-12,12])add(box,facade,new T.Vector3(towerX+12+dx,129,64),new T.Vector3(6,18,15),0);
  const bank=keep(new T.MeshStandardMaterial({color:0xab9d84,roughness:.9}));
  for(let i=0;i<points.length;i+=105){const p=points[i].clone().addScaledVector(normals[i],22),a=Math.atan2(normals[i].x,normals[i].z);p.y=7;add(box,bank,p,new T.Vector3(18,14,8),a);p.y=14;add(box,concrete,p,new T.Vector3(20,.6,10),a);}
 }
 for(let i=65;i<points.length;i+=210){
  const p=points[i],n=normals[i];const pos=p.clone().addScaledVector(n,10);pos.y=2.5;
  add(box,steel,pos,new T.Vector3(.12,5,.12),0);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=theme==='tokyo'||theme==='shanghai'?'#126749':'#183941';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#d5e8d9';ctx.lineWidth=6;ctx.strokeRect(8,8,496,112);ctx.fillStyle='white';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText(names[Math.floor(i/210)%names.length],256,58);ctx.font='18px sans-serif';ctx.fillText('↑  CITY CIRCUIT    /    '+Math.round(i/points.length*100)+'%',256,96);
  const tex=keep(new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;
  const sign=new T.Mesh(keep(new T.PlaneGeometry(5,1.25)),keep(new T.MeshBasicMaterial({map:tex,side:T.DoubleSide})));sign.position.copy(pos);sign.position.y=4.6;sign.rotation.y=Math.atan2(-n.z,n.x);world.add(sign);
 }
 // Convert the asphalt to PBR, preserving the source road UV mapping.
 world.traverse(obj=>{const mesh=obj as T.Mesh;if(!mesh.isMesh)return;const mat=mesh.material as T.MeshPhongMaterial;
  if(mat.isMeshPhongMaterial&&mat.map&&(mat.shininess===90||mat.shininess===25))mesh.material=keep(new T.MeshStandardMaterial({map:mat.map,roughness:wet?.24:.88,metalness:wet?.3:.02,envMapIntensity:wet?.6:.12}));
  mesh.receiveShadow=true;
 });
 // Batch static geometry by material to avoid one draw call per architectural component.
 world.updateMatrixWorld(true);const groups=new Map<T.Material,T.Mesh[]>();
 world.traverse(obj=>{const m=obj as T.Mesh;if(!m.isMesh||Array.isArray(m.material)||m.material.transparent||m.children.length||m.geometry.index===null||!m.geometry.attributes.normal||!m.geometry.attributes.uv)return;const a=groups.get(m.material)||[];a.push(m);groups.set(m.material,a);});
 for(const [material,meshes] of groups){if(meshes.length<4)continue;const geometries=meshes.map(m=>m.geometry.clone().applyMatrix4(m.matrixWorld));const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;const m=new T.Mesh(keep(merged),material);m.receiveShadow=true;world.add(m);meshes.forEach(o=>o.removeFromParent());}
}
