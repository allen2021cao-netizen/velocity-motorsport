import {naturalMeadow} from './australian-materials';
import * as T from 'three';
import {Architecture} from './geometry';
import {landNoise} from './alpine-nature';
import {seeded} from './profiles';
import {foliageBatches} from './australian-foliage';

export function destinationCoast(x:number){return -160+150*Math.sin(x*.002)+55*Math.sin(x*.006);}
export function bathurstLakeRadius(x:number,z:number){
 const angle=Math.atan2((z-200)/1000,x/1800);
 return Math.hypot(x/1800,(z-200)/1000)*(1+.17*Math.sin(angle*3+.5)+.09*Math.sin(angle*7));
}
export function bathurstDestinationHeight(x:number,z:number){
 const basin=bathurstLakeRadius(x,z),shore=basin-1;
 const ridge=Math.max(0,shore)*155;
 return Math.max(-55,shore*90)+ridge+T.MathUtils.smoothstep(basin,1,1.6)*(35*landNoise(x*.003,z*.003)+120*landNoise(x*.0012,z*.0015));
}
/** Original composite landscapes inspired by nearby landmarks, not a geographic survey. */
export function australianDestination(world:T.Group,resources:any[],key:string,rock:T.MeshStandardMaterial,grass:T.MeshStandardMaterial){
 const coastal=key==='phillip',root=new T.Group();root.name='australian-destination';root.visible=false;root.position.x=40000;world.add(root);
 const a=new Architecture(root,resources),rand=seeded(coastal?782:912),center=new T.Vector3(40000,0,0);
 const land=a.keep(grass.clone());land.vertexColors=false;naturalMeadow(land,coastal,rock.map);land.normalScale.set(.12,.12);land.color.setHex(coastal?0xa4aa81:0xa9ac78);
 const cliffs=a.keep(rock.clone());cliffs.color.setHex(coastal?0xb49b87:0x8f9783);
 const terrain=a.keep(new T.PlaneGeometry(9000,7000,240,200));terrain.rotateX(-Math.PI/2);const p=terrain.attributes.position,uv=terrain.attributes.uv;
 const elevation=(x:number,z:number)=>{
  const coast=destinationCoast(x),d=coast-z;
  if(coastal)return d<0?-18+Math.max(-80,d*.23):18+85*(1-Math.exp(-d/170))+30*landNoise(x*.003,z*.003);
  return bathurstDestinationHeight(x,z);
 };
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,elevation(x,z));uv.setXY(i,x/40,z/40);}terrain.computeVertexNormals();
 const ground=new T.Mesh(terrain,land);ground.receiveShadow=true;root.add(ground);
 const time={value:0},waterMat=a.keep(new T.MeshPhysicalMaterial({color:coastal?0x226978:0x2a5b68,roughness:coastal?.5:.44,metalness:0,clearcoat:.02,clearcoatRoughness:.6,envMapIntensity:.16}));
 waterMat.onBeforeCompile=s=>{
  s.uniforms.destinationTime=time;s.vertexShader='uniform float destinationTime;varying vec3 waterLocal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.y+=${coastal?'1.5':'.15'}*sin(position.x*.018+destinationTime*.9)+${coastal?'.65':'.08'}*sin(position.z*.04-destinationTime*1.2);
   waterLocal=transformed+vec3(0.,0.,${coastal?'9500.':'200.'});`);
  s.fragmentShader='uniform float destinationTime;varying vec3 waterLocal;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=waterLocal.xz;float coast=-160.+150.*sin(p.x*.002)+55.*sin(p.x*.006);
   float depth=${coastal?'max(0.,p.y-coast)':'max(0.,(1.-length(vec2(p.x/1800.,(p.y-200.)/1000.)))*850.)'};
   vec3 shallow=vec3(.035,.29,.30),deep=vec3(.012,.075,.16);
   diffuseColor.rgb*=mix(shallow,deep,smoothstep(10.,1100.,depth));
   float swell=sin(depth*.10-destinationTime*1.6+sin(p.x*.016)*1.1);
   float foam=pow(max(0.,swell),10.)*(1.-smoothstep(20.,190.,depth))*(.6+.4*sin(p.x*.11+sin(p.x*.031)*2.));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.84,.93,.94),foam*${coastal?'.9':'.12'});
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   vec2 waveP=waterLocal.xz;float wx=sin(waveP.x*.07+waveP.y*.025+sin(waveP.y*.043)*2.+destinationTime)*.17+sin(waveP.x*.21-destinationTime*1.8)*.05;
   float wz=cos(waveP.y*.06-waveP.x*.018+sin(waveP.x*.039)*2.-destinationTime*.8)*.14+sin(waveP.y*.19+destinationTime*1.7)*.045;
   normal=normalize(mat3(viewMatrix)*vec3(wx*${coastal?'1.':'.22'},1.,wz*${coastal?'1.':'.22'}));`);
 };
 waterMat.customProgramCacheKey=()=>coastal?'destination-ocean-v2':'destination-lake-v3';
 const wg=a.keep(new T.PlaneGeometry(coastal?26000:5400,coastal?22000:3000,100,100));wg.rotateX(-Math.PI/2);const water=new T.Mesh(wg,waterMat);water.position.set(0,0,coastal?9500:200);root.add(water);
 // Eroded cliff columns and isolated sea stacks, each with a distinct silhouette.
 if(coastal){
  const geo=a.shape('coastal-stack',()=>{const g=new T.CylinderGeometry(.08,1,1,11,9);const v=g.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),k=.85+.24*landNoise(x*8+y*5,z*8);v.setXYZ(i,x*k,y,z*k);}g.computeVertexNormals();return g;});
  const cp:number[]=[],cu:number[]=[],ci:number[]=[];
  for(let i=0;i<=240;i++)for(let j=0;j<=8;j++){const x=-3600+i*30,t=j/8,z=destinationCoast(x)-95+t*125+Math.sin(t*Math.PI)*(landNoise(x*.017,t*7)-.5)*35,y=(1-t)*elevation(x,destinationCoast(x)-95)-t*28;cp.push(x,y,z);cu.push(x/35,y/35);if(i<240&&j<8){const k=i*9+j;ci.push(k,k+9,k+1,k+1,k+9,k+10);}}
  const cg=a.keep(new T.BufferGeometry());cg.setAttribute('position',new T.Float32BufferAttribute(cp,3));cg.setAttribute('uv',new T.Float32BufferAttribute(cu,2));cg.setIndex(ci);cg.computeVertexNormals();cliffs.side=T.DoubleSide;const cliffMesh=new T.Mesh(cg,cliffs);cliffMesh.receiveShadow=true;root.add(cliffMesh);
  const stacks=[[-850,230,90,115],[-660,310,45,86],[-480,160,38,105],[500,650,180,50],[820,860,120,32],[1450,330,95,120]];
  for(const [x,z,r,h]of stacks){a.put(geo,cliffs,x,h*.5-8,z,r,h,r*.65,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rand()*6.28));
   const ring=a.keep(new T.RingGeometry(r*.75,r*1.35,64));ring.rotateX(-Math.PI/2);const rv=ring.attributes.position;for(let k=0;k<rv.count;k++){const x=rv.getX(k),z=rv.getZ(k),v=.88+landNoise(x*.035,z*.035)*.25;rv.setXYZ(k,x*v,0,z*v);}const foam=new T.Mesh(ring,a.keep(new T.MeshBasicMaterial({color:0xd5e8e8,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide})));foam.position.set(x,.3,z);foam.scale.z=.7;root.add(foam);
  }
 }
 const wood=a.material(0x81725b),metal=a.material(0x606c6c,.3),bark=a.material(0x84745b),foliage=foliageBatches(a,false);
 if(!coastal){
  // Reservoir embankment and a small lakeside jetty distinguish the inland scene.
  // Follow the true procedural shoreline: exposed stone, reeds and grouped eucalyptus.
  const boulder=a.shape('reservoir-boulder',()=>new T.IcosahedronGeometry(1,1));
  const reed=a.material(0x7f8554);
  for(let i=0;i<2600;i++){
   const x=(rand()-.5)*4700,z=(rand()-.5)*3100,y=elevation(x,z);
   if(y>1&&y<17){const r=2+rand()*7;a.put(boulder,cliffs,x,y+r*.25,z,r,r*.55,r*.8);}
   if(y>.5&&y<6)for(let j=0;j<5;j++)a.cylinder(reed,x+rand()*4,y+1,z+rand()*4,.16,2+rand()*2,.35,4);
  }
  // Small timber outlook anchored to the southern bank, with shaded shelter.
  const deckX=-450,deckZ=1380,deckY=elevation(deckX,deckZ)+3;
  a.box(wood,deckX,deckY,deckZ,38,1,24);
  for(const dx of [-17,17])for(const dz of [-10,10])a.box(wood,deckX+dx,deckY+4,deckZ+dz,.7,8,.7);
  a.box(metal,deckX,deckY+8,deckZ,43,.6,29);
  for(let i=0;i<13;i++)a.box(wood,deckX-18+i*3,deckY+1.2,deckZ-12,.25,2.4,.25);
  a.box(wood,deckX,deckY+2.3,deckZ-12,38,.3,.3);
  a.box(wood,-600,3,720,8,.5,130);for(let i=0;i<9;i++)for(const side of [-1,1])a.box(metal,-600+side*3,1,665+i*14,.25,5,.25);
 }
 // Lookout/boardwalk in the foreground gives the coast or valley a human scale.
 for(let i=0;i<75;i++){const x=-380+i*8,z=coastal?destinationCoast(x)-85:1380+Math.sin(x*.003)*80,y=elevation(x,z)+1;
  a.box(wood,x,y,z,8,.4,5);for(const side of [-1,1]){a.box(metal,x,y+1,z+side*2.4,.12,2,.12);a.box(wood,x,y+1.85,z+side*2.4,8,.12,.12);}}
 const canopy=a.material(0x4b6350),crown=a.shape('eucalyptus-core',()=>new T.IcosahedronGeometry(1,2));
 let trees=0;
 for(let i=0;i<(coastal?2200:11500);i++){const x=(rand()-.5)*(coastal?6500:7000),z=(rand()-.5)*(coastal?4800:5400),y=elevation(x,z);if(y<(coastal?25:12))continue;if(coastal&&z>destinationCoast(x)-170)continue;if(!coastal&&(y<15||rand()> .35+.6*landNoise(x*.004,z*.004)))continue;
  const h=coastal?2+rand()*3:12+rand()*14,r=coastal?2+rand()*2:6+rand()*5;a.cylinder(bark,x,y+h*.4,z,.18,h*.8,.5,6);foliage.add(x,y+h*.8,z,r,rand()*6);if(!coastal){a.put(crown,canopy,x,y+h*.76,z,r*.9,r*.6,r*.8);a.put(crown,canopy,x+r*.55,y+h*.9,z+r*.3,r*.65,r*.48,r*.6);}trees++;}
 foliage.finish();a.finish();
 let active=false;
 return {trees,focus:center,landmark:coastal?'伍拉迈角尖峰岩 · 诺比斯海岬 · 金字塔岩｜景点意境重建':'Wahluu 山顶远眺 · 奇夫利水库｜景点意境重建',
  setActive(value:boolean){if(active===value)return;active=value;for(const child of world.children)child.visible=child===root?value:!value;},
  update(dt:number){if(active)time.value+=Math.min(dt,.05);},
  view(camera:T.PerspectiveCamera,t:number){const phase=t/170*Math.PI*2;
   const x=coastal?Math.sin(phase)*1350:Math.sin(phase)*1050,z=coastal?700+Math.cos(phase)*250:1400+Math.cos(phase)*90,y=coastal?190+Math.sin(phase)*65:Math.max(elevation(x,z)+32,80+Math.sin(phase)*25);
   camera.position.set(40000+x,y,z);camera.up.set(0,1,0);camera.lookAt(40000+(coastal?Math.sin(phase+.5)*850:0),coastal?55:100,coastal?-100:-1000);camera.fov=camera.aspect<1?66:57;camera.updateProjectionMatrix();}
 };
}
