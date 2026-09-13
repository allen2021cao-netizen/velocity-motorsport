import * as T from 'three';
import {Architecture} from './geometry';
import {facade,lettering} from './materials';
import {landmark} from './landmarks';
import {CITY_PROFILES,seeded,type CityKey} from './profiles';
export interface CityReport {key:string;buildings:number;landmark:string;focus:T.Vector3;instances:number;batches:number;minimumBuildingClearance:number;}
export function buildCity(world:T.Group,points:T.Vector3[],normals:T.Vector3[],key:CityKey,resources:any[],length:number){
 const p=CITY_PROFILES[key],rand=seeded(2309+key.charCodeAt(0)*71+key.length*829),night=p.sky==='night';
 const a=new Architecture(world,resources),concrete=a.material(0x92938b,0,.91),metal=a.material(0x434b50,.72,.42),stone=a.material(p.palette[0]),roof=a.material(key==='monaco'?0x98624a:0x505960,.15,.83),window=a.material(p.window,.65,.28),trim=a.material(0xc8c4b4,.1,.71),black=a.material(0x222929,.1,.84),white=a.material(0xd9d8cf,0,.8),accent=a.material(p.accent,.15,.6,p.accent,night?.65:.03),leaves=a.material(key==='alps'?0x39534a:0x46674a,0,.98),bark=a.material(0x605746,0,.96);
 const facades=[0,1,2].map(i=>facade(a,p,i)),shops=p.shops.map(t=>lettering(a,t)),lamplight=a.material(0xf8e1ab,0,.5,0xffd5a0,night?3:.2);
 let buildings=0,minClearance=Infinity;
 const distToRoad=(x:number,z:number)=>{let dist=Infinity;for(let i=0;i<points.length;i+=4)dist=Math.min(dist,Math.hypot(x-points[i].x,z-points[i].z));return dist;};
 const start=points[0],forward=new T.Vector3(-normals[0].z,0,normals[0].x).negate();
 const maxX=Math.max(...points.map(q=>q.x)),maxZ=Math.max(...points.map(q=>q.z)),minX=Math.min(...points.map(q=>q.x));
 // The hero skyline remains outside the collision corridor and visible above approach streets.
 const anchor=start.clone().addScaledVector(forward,145).addScaledVector(normals[0],-110);
 while(distToRoad(anchor.x,anchor.z)<120){anchor.addScaledVector(normals[0],-15);}
 // Keep the landmark on land, even when the circuit's outward normal points into the bay.
 if(p.water&&anchor.x>maxX-70){anchor.x=maxX-110;while(distToRoad(anchor.x,anchor.z)<120)anchor.z+=20;}
 const heroScale=key==='dubai'?.68:key==='shanghai'?.75:key==='paris'||key==='tokyo'?.78:1;
 a.at(anchor.x,0,anchor.z,Math.atan2(start.x-anchor.x,start.z-anchor.z),heroScale,()=>landmark(a,key,p));
 const tall=['tokyo','shanghai','hongkong','newyork','dubai','vegas','paris'].includes(key);
 const focus=anchor.clone();focus.y=tall?90:18;
 a.box(concrete,anchor.x,-.015,anchor.z,key==='shanghai'?200:110,.06,key==='shanghai'?160:95);
 function building(x:number,z:number,w:number,d:number,h:number,yaw:number,index:number,detail:boolean){
  const radius=Math.hypot(w,d)/2;const clearance=distToRoad(x,z)-radius;if(clearance<12||(p.water&&x+radius>maxX+55)||Math.hypot(x-anchor.x,z-anchor.z)<(key==='shanghai'?135:75)+radius)return false;minClearance=Math.min(minClearance,clearance);buildings++;
  a.at(x,0,z,yaw,1,()=>{
   const floors=Math.max(2,Math.round(h/3.4));h=floors*3.4;
   a.box(facades[index%3],0,h/2,0,w,h,d);a.box(concrete,0,.25,0,w+1,.5,d+1);
   a.box(roof,0,h+.3,0,w+1,.6,d+1);a.box(metal,-w*.22,h+.8,-d*.16,w*.24,1,d*.18);
   if(p.style==='stone'||p.style==='brick'){
    for(let floor=1;floor<=floors;floor++){const y=floor*3.4;if(floor===1||floor===floors||p.style==='stone')a.box(trim,0,y,0,w+.5,.25,d+.5);}
    if(key==='paris'||key==='monaco'||key==='alps'){
     const shape=a.shape('mansard',()=>new T.CylinderGeometry(.68,1,1,4));a.put(shape,roof,0,h+1.8,0,w*.75,3.6,d*.75,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/4));
     for(let dx=-w/2+3;dx<w/2;dx+=4){a.box(trim,dx,h+1.6,d*.32,1.8,2,1.8);a.box(window,dx,h+1.6,d*.32+.92,1.1,1.35,.1);}
    }
   }
   if(p.style==='deco'){
    for(let floor=1;floor<floors;floor++)a.box(trim,0,floor*3.4,0,w+.8,.35,d+.8);
    a.box(stone,0,h/2+.5,d/2+.4,w*.16,h+2,.8);for(const dx of [-w*.4,w*.4])a.box(accent,dx,h/2,d/2+.5,.18,h,.2);
   }
   if(p.style==='glass'){
    for(let dx=-w/2;dx<=w/2;dx+=w/5)a.box(metal,dx,h/2,d/2+.08,.12,h,.12,false);
    if(index%3===0){a.box(facades[(index+1)%3],0,h+4,0,w*.7,8,d*.7);a.box(metal,0,h+8.2,0,w*.74,.4,d*.74);}
   }
   if(key==='newyork'){a.cylinder(bark,w*.24,h+3,0,2,4);a.cylinder(metal,w*.24,h+5.6,0,2.3,1.3,0);}
   if(!detail)return;
   for(let dx=-w/2+2;dx<w/2;dx+=3.7){a.box(window,dx,1.6,d/2+.08,2.6,2.7,.25);a.box(metal,dx+1.4,1.6,d/2+.3,.15,3.2,.4);}
   a.plane(shops[index%shops.length],0,3.25,d/2+.4,Math.min(w-1,13),1.15);
   a.box(stone,0,3.9,d/2+.8,w,.16,1.7);
   if(['paris','monaco','hongkong','london','shanghai'].includes(key))for(let floor=2;floor<Math.min(floors,8);floor+=2){
    const y=floor*3.4;
    for(let dx=-w/2+3;dx<w/2-1;dx+=4.5){a.box(concrete,dx,y,d/2+.65,3,.15,1.25);a.box(metal,dx,y+1,d/2+1.25,3,.06,.06);for(let bx=-1.4;bx<1.5;bx+=.45)a.box(metal,dx+bx,y+.5,d/2+1.25,.04,1,.04);}
   }
   if(key==='tokyo'||key==='hongkong')for(let floor=2;floor<floors;floor+=2){a.box(trim,w*.35,floor*3.4,d/2+.5,1.1,.65,.65);a.cylinder(metal,w*.35,floor*3.4+.4,d/2+.5,.18,.05);}
   if(key==='newyork')for(let floor=2;floor<Math.min(floors,10);floor++){
    const y=floor*3.4;a.box(metal,0,y,d/2+.9,4,.14,1.8);for(const dx of [-2,2])a.box(metal,dx,y+.5,d/2+1.7,.05,1,.05);a.box(metal,0,y+1,d/2+1.7,4,.05,.05);a.beam(metal,new T.Vector3(-1.5,y,d/2+1),new T.Vector3(1.5,y-3.4,d/2+1),.1);
   }
  });return true;
 }
 const step=Math.max(17,Math.round(points.length/length*(key==='alps'?100:34)));
 for(let i=0;i<points.length;i+=step){const q=points[i],n=normals[i];
  for(const side of [-1,1]){
   if(key==='alps'&&rand()<.7)continue;if(p.water&&side===-1&&q.x>maxX-100)continue;if(rand()<.12)continue;
   const w=12+rand()*15,d=11+rand()*10,h=p.height[0]+rand()*(p.height[1]-p.height[0]);const offset=13+Math.hypot(w,d)*.5+rand()*4;
   building(q.x+n.x*side*offset,q.z+n.z*side*offset,w,d,h,Math.atan2(-n.x*side,-n.z*side),Math.floor(i/step)+(side===1?0:1),true);
  }
 }
 // District skyline behind the street blocks: different tower proportions, rather than a uniform ring.
 if(key!=='alps'){
  const street=a.material(0x414749,0,.98),paving=a.material(0x96938a,0,.98);
  const east=p.water?maxX+48:850,west=-850,width=east-west;
  for(let i=-12;i<=12;i++){
   const line=i*65+32.5;
   a.box(paving,(east+west)/2,-.023,line,width,.025,20,false);a.box(street,(east+west)/2,-.009,line,width,.014,13,false);
   if(line<east){a.box(paving,line,-.023,0,20,.025,1700,false);a.box(street,line,-.009,0,13,.014,1700,false);}
  }
 }
 if(key!=='alps')for(let row=-10;row<=10;row++)for(let col=-10;col<=10;col++){
  const x=col*65+rand()*9,z=row*65+rand()*9;if(Math.hypot(x,z)>850||rand()<.19)continue;
  const h=p.height[0]+rand()*(p.height[1]-p.height[0]);building(x,z,24+rand()*14,24+rand()*14,h,0,row*21+col+300,false);
 }
 // Street furniture is kept behind the concrete safety barrier.
 const roadWhite=a.material(0xe8e6d9,0,.92),roadYellow=a.material(0xd3b96a,0,.92),lane=['newyork','vegas','la','miami','tokyo','shanghai'].includes(key)?roadYellow:roadWhite;
 const metreStep=Math.max(3,Math.round(points.length/length*8));
 for(let i=0;i<points.length;i+=metreStep){const q=points[i],n=normals[i],heading=Math.atan2(-n.z,n.x);a.at(q.x,0,q.z,heading,1,()=>{
   for(const side of [-1,1])a.box(lane,side*.12,.012,0,.1,.014,3.3,false);
  });}
 const streetStep=Math.max(12,Math.round(points.length/length*26));
 for(let i=0;i<points.length;i+=streetStep){const q=points[i],n=normals[i];
  for(const side of [-1,1]){
   const x=q.x+n.x*side*10.5,z=q.z+n.z*side*10.5;if(distToRoad(x,z)<9.8)continue;
   a.at(x,0,z,Math.atan2(-n.x*side,-n.z*side),1,()=>{
    a.box(concrete,0,.16,0,3.4,.3,4.5);a.cylinder(metal,0,4,0,.11,8,.65,8);a.beam(metal,new T.Vector3(0,7.8,0),new T.Vector3(0,8.3,2.5),.07);a.box(metal,0,8.22,2.5,.45,.12,1.2);a.box(lamplight,0,8.14,2.5,.36,.02,.9,false);
    if((i/streetStep)%3===0){a.box(bark,.5,.7,-1.5,1.7,.1,.5);for(const x of [-.2,1.2])a.box(metal,x,.35,-1.5,.06,.7,.4);a.box(metal,-1,.55,1,.5,1.1,.5);}
   });
  }
  // Flush drainage slots and raised reflectors.
  for(const side of [-1,1])a.at(q.x+n.x*side*7.5,0,q.z+n.z*side*7.5,Math.atan2(-n.z,n.x),1,()=>{for(let j=0;j<7;j++)a.box(black,0,.022,(j-3)*.09,.45,.012,.035,false);a.box(roadWhite,side*-.45,.028,0,.12,.028,.22,false);});
 }
 const distanceSigns=[150,100,50];for(let zone=0;zone<4;zone++)for(let j=0;j<3;j++){
  const idx=(Math.floor(zone*points.length/4+points.length*(j+1)*.012))%points.length,q=points[idx],n=normals[idx];
  a.at(q.x+n.x*10,0,q.z+n.z*10,Math.atan2(-n.z,n.x),1,()=>{a.box(metal,0,1.4,0,.08,2.8,.08);a.plane(lettering(a,String(distanceSigns[j]),'#dfdfcf','#252d2e',128),0,2.5,.05,.85,1.1);});
 }
 // Nearby vegetation uses actual branch / leaf geometry with city-specific canopies.
 function tree(x:number,z:number,palm:boolean,scale:number){if(distToRoad(x,z)<12)return;a.at(x,0,z,rand()*6.28,scale,()=>{
  if(palm){a.beam(bark,new T.Vector3(0,0,0),new T.Vector3(.5,8,0),.2);for(let i=0;i<9;i++){const th=i*Math.PI*2/9;const mid=new T.Vector3(Math.cos(th)*2.1,8.6,Math.sin(th)*2.1),tip=new T.Vector3(Math.cos(th)*4,7.2,Math.sin(th)*4);a.beam(leaves,new T.Vector3(.5,8,0),mid,.16);a.beam(leaves,mid,tip,.12);for(let k=1;k<=6;k++){const f=k/7,c=mid.clone().lerp(tip,f);for(const sign of [-1,1])a.beam(leaves,c,c.clone().add(new T.Vector3(Math.sin(th)*sign*.65,-.2,Math.cos(th)*sign*.65)),.075);}}}
  else if(key==='alps'){a.cylinder(bark,0,3.5,0,.18,7);for(let j=0;j<4;j++){a.cylinder(leaves,0,3+j*1.3,0,2.4-j*.45,3,0,10);a.cylinder(white,0,3.6+j*1.3,0,1.7-j*.3,2.2,0,10);}}
  else{a.cylinder(bark,0,2.6,0,.22,5.2,.65,8);for(let k=0;k<7;k++){const th=k*2.4;a.sphere(leaves,Math.cos(th)*1.5,5+rand()*2,Math.sin(th)*1.5,1.7,1.25);}}
 });}
 for(let i=0;i<points.length;i+=key==='alps'?15:42){const side=(i%84)?1:-1,q=points[i],n=normals[i];tree(q.x+n.x*side*14.5,q.z+n.z*side*14.5,['miami','la','dubai','monaco'].includes(key),.8+rand()*.5);}
 // Waterfront uses a wave-normal water surface rather than a flat painted plane.
 if(p.water){
  const water=a.keep(new T.MeshPhysicalMaterial({color:night?0x122d3f:key==='miami'||key==='monaco'?0x397b88:0x48636e,roughness:.23,metalness:.2,clearcoat:1,envMapIntensity:.85}));
  const time={value:0};water.onBeforeCompile=shader=>{shader.uniforms.uWaveTime=time;shader.vertexShader='varying vec3 vWaterPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWaterPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader='uniform float uWaveTime; varying vec3 vWaterPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 normal=normalize(normal+vec3(sin(vWaterPosition.x*.31+vWaterPosition.z*.21+uWaveTime*.55)*.018+sin(vWaterPosition.x*1.8-vWaterPosition.z*.7)*.009,cos(vWaterPosition.z*.47+vWaterPosition.x*.19+uWaveTime*.42)*.022,0.0));`);};
  const surface=new T.Mesh(a.keep(new T.PlaneGeometry(2600,5000)),water);surface.rotation.x=-Math.PI/2;surface.position.set(maxX+1370,-.01,0);surface.userData.wave=time;world.add(surface);
  // Quay coping, promenade and moored yachts are outside the racing envelope.
  a.box(concrete,maxX+65,.1,0,12,.25,1700);for(let z=-750;z<800;z+=20){a.box(metal,maxX+70,.6,z,.09,1.2,.09);a.box(metal,maxX+70,1.1,z,.06,.06,20);}
  if(['monaco','miami','hongkong'].includes(key))for(let j=0;j<12;j++){
   a.at(maxX+95+(j%3)*22,0,-100+j*22,.35,1,()=>{a.cylinder(white,0,.5,0,3.2,1.4,.7,6);a.box(white,0,1,0,3.6,1.4,13);a.box(window,0,2.2,0,2.8,1.3,6);a.box(white,0,3,0,3,.25,6.5);a.cylinder(metal,0,7,0,.07,10);a.beam(metal,new T.Vector3(0,11,0),new T.Vector3(0,1.2,5),.025);});
  }
 }
 if(['alps','la','monaco','dubai'].includes(key)){
  // Multi-frequency ridges with slope-dependent snow, not a ring of smooth cones.
  const geo=a.keep(new T.PlaneGeometry(2600,2600,110,110));geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors:number[]=[];
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z);const outer=T.MathUtils.smoothstep(r,470,850),ridge=Math.abs(Math.sin(x*.007+z*.002))+Math.abs(Math.sin(z*.006-x*.004))*.6;const detail=Math.sin(x*.047)*Math.cos(z*.041)*12+Math.sin(x*.11+z*.078)*4;
   let y=outer*(key==='alps'?70+ridge*190+detail:key==='dubai'?5+ridge*20:25+ridge*75+detail*.4)-1;y*=T.MathUtils.smoothstep(Math.hypot(x-anchor.x,z-anchor.z),100,220);if(p.water&&x>maxX+50)y=-2;pos.setY(i,y);
   const snow=key==='alps'&&y>210+Math.sin(x*.012)*28;const c=new T.Color(snow?0xe6edef:key==='dubai'?0xbfa988:key==='alps'?0x656b68:0x727761);c.multiplyScalar(.83+Math.sin(x*.03+z*.02)*.12);colors.push(c.r,c.g,c.b);
  }geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,a.keep(new T.MeshStandardMaterial({vertexColors:true,roughness:1})));mesh.receiveShadow=true;world.add(mesh);
 }
 const stats=a.finish();return{key,buildings,landmark:p.landmark,focus,...stats,minimumBuildingClearance:minClearance} satisfies CityReport;
}
export function animateCity(world:T.Group|null,dt:number){world?.children.forEach(o=>{if(o.userData.wave)o.userData.wave.value+=dt;});}
