import {MONACO_TUNNEL} from '../driving-feedback';
import {urbanDistrict} from './urban';
import type {CityKey} from '../environment/profiles';
import * as T from 'three';
import {Architecture} from '../environment/geometry';
import {lettering} from '../environment/materials';
import {CIRCUITS} from './circuit';
import {CITY_PROFILES} from '../environment/profiles';
import {CITY_PORTRAITS} from '../environment/city-icons';
/** Dedicated venues: geography-derived route, hand-built architectural approximations. */
export function buildCircuitVenue(world:T.Group,points:T.Vector3[],normals:T.Vector3[],key:string,resources:any[],length:number,width:number){
 const a=new Architecture(world,resources),meta=CIRCUITS[key],night=CITY_PROFILES[key as CityKey].sky==='night';
 const concrete=a.material(0x929791),white=a.material(0xe8ece8),dark=a.material(0x263039,.45),glass=a.material(0x477e8a,.55,.25),red=a.material(0xc94337),green=a.material(0x438979),blue=a.material(0x319fb0),sand=a.material(0xc7b58e),light=a.material(0xffedd0,0,.4,0xffedd0,night?3:.2),asphalt=a.material(0x44494b),foliage=a.material(0x47754d),bark=a.material(0x74604a),pink=a.material(0xda6dbb,0,.5,0xf57bbb,night?1:0);
 const bounds=new T.Box3().setFromPoints(points),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 const distance=(x:number,z:number)=>{let d=Infinity;for(let i=0;i<points.length;i++){const q=points[i],r=points[(i+1)%points.length],dx=r.x-q.x,dz=r.z-q.z,t=T.MathUtils.clamp(((x-q.x)*dx+(z-q.z)*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-q.x-t*dx,z-q.z-t*dz));}return d;};
 const idx=(u:number)=>Math.floor(((u%1+1)%1)*points.length)%points.length;
 function at(u:number,offset:number,fn:()=>void){const i=idx(u),p=points[i],n=normals[i];a.at(p.x+n.x*offset,0,p.z+n.z*offset,Math.atan2(n.x,n.z),1,fn);}
 function safe(u:number,offset:number,radius:number){const i=idx(u),p=points[i],n=normals[i];return distance(p.x+n.x*offset,p.z+n.z*offset)>width+radius+3;}
 let buildings=0;const reserved:{x:number;z:number;r:number}[]=[];
 function reserve(u:number,offset:number,r:number){if(!safe(u,offset,r))return false;const i=idx(u),p=points[i],n=normals[i],x=p.x+n.x*offset,z=p.z+n.z*offset;if(reserved.some(b=>Math.hypot(x-b.x,z-b.z)<r+b.r+4))return false;reserved.push({x,z,r});return true;}
 // Open street edge lines, low kerbs and lamps sampled in metres.
 for(let m=0;m<length;m+=5){const u=m/length,i=idx(u),p=points[i],n=normals[i];a.at(p.x,0,p.z,Math.atan2(n.x,n.z),1,()=>{
 for(const side of [-1,1]){a.box(white,0,.026,side*(width-.28),4.9,.015,.12,false);a.box(Math.floor(m/5)%2?white:(key==='miami'?blue:red),0,.045,side*(width-.7),4.9,.05,.65,false);}
 });
 if(m%100===0)for(const side of [-1,1])if(safe(u,side*(width+4),.4))at(u,side*(width+4),()=>{a.cylinder(dark,0,6,0,.14,12);a.box(light,0,12,0,4,.15,1);});
 }
 // Asphalt runoff patches sit beyond the barriers and avoid neighboring road branches.
 if(key==='shanghai'||key==='miami')for(let m=0;m<length;m+=12){for(const side of [-1,1]){const u=m/length,off=side*(width+7);if(safe(u,off,3))at(u,off,()=>{a.box(asphalt,0,.009,0,11.9,.012,10,false);a.box(key==='miami'?blue:green,0,.022,-side*4,11.9,.014,1.2,false);});}}
 const urban=urbanDistrict(a,key as CityKey,length,width,at,reserve);buildings+=urban.buildings;
 // Start straight pit garages and stepped grandstands, outside the driving corridor.
 for(let j=0;j<16;j++){const u=(length-150+j*10)/length;if(reserve(u,width+16,6))at(u,width+16,()=>{a.box(concrete,0,4,0,9.5,8,12);a.box(glass,0,6.3,-6.02,8,2,.1);a.box(dark,0,1.8,-6.05,7,3.5,.12);a.box(white,0,8.4,0,10,.7,13);buildings++;});}
 function stand(u:number,side:number,rows=9){const offset=side*(width+19);if(!reserve(u,offset,19))return;at(u,offset,()=>{for(let r=0;r<rows;r++){a.box(concrete,0,.4+r*.65,(r-rows/2)*1.1,28,.6,1.15);for(let seat=0;seat<24;seat++)a.box((seat+r)%3?blue:white,(seat-11.5)*1.05,.95+r*.65,(r-rows/2)*1.1,.72,.55,.6,false);}a.box(white,0,rows*.65+3,0,32,.45,18);for(const x of [-14,14])a.cylinder(dark,x,4,5,.22,8);});buildings++;}
 for(const u of [.015,.045,.18,.33,.55,.83,.97])stand(u,-1);
 // Accurate metre spacing before strong corner clusters, instead of arbitrary quarter-lap signs.
 const corners:number[]=[];for(let i=0;i<points.length;i++){const prev=points[(i-5+points.length)%points.length],p=points[i],next=points[(i+5)%points.length],v=p.clone().sub(prev).normalize(),w=next.clone().sub(p).normalize();if(v.angleTo(w)>.32&&(!corners.length||(i-corners.at(-1)!)*length/points.length>140))corners.push(i);}
 for(const c of corners)for(const metres of [150,100,50]){const u=c/points.length-metres/length;if(!safe(u,width+2.7,.4))continue;at(u,width+2.7,()=>{a.cylinder(dark,0,1.5,0,.06,3);a.plane(lettering(a,String(metres),'#eeeeee','#17262d',128),0,2.5,0,1.4,1.1);});}
 function trees(u:number,offset:number){if(!safe(u,offset,4))return;at(u,offset,()=>{a.cylinder(bark,0,3.5,0,.2,7);if(key==='miami'||key==='vegas'||key==='monaco'){for(let k=0;k<8;k++){const th=k*Math.PI/4;a.beam(foliage,new T.Vector3(0,7,0),new T.Vector3(Math.cos(th)*4,6.2,Math.sin(th)*4),.22);}}else a.sphere(foliage,0,7,0,3.5,1.3);});}
 if(key==='shanghai'||key==='miami'){
 for(let m=0;m<length;m+=55)for(const side of [-1,1])trees(m/length,side*42);
 // Circuit facilities coexist with the fictional downtown streets.
 if(key==='shanghai'){
  for(const u of [.96,.98,.02,.04]){if(!reserve(u,-65,25))continue;at(u,-65,()=>{a.box(glass,0,12,0,34,24,24);for(let y=3;y<24;y+=4)a.box(white,0,y,0,35,.4,25);a.cylinder(dark,0,29,0,.5,12);a.cylinder(white,0,32,0,27,1.1,1,32);for(let k=0;k<12;k++){const th=k*Math.PI/6;a.beam(dark,new T.Vector3(0,33,0),new T.Vector3(Math.cos(th)*26,32,Math.sin(th)*26),.12);}buildings++;});}
 }else{
  // Hard Rock Stadium-inspired four-sided roof and exposed corner masts.
  let off=-180;while(!reserve(.04,off,120))off-=30;at(.04,off,()=>{a.box(concrete,0,8,0,180,16,135);a.box(green,0,16.15,0,118,.15,64);for(const side of [-1,1]){a.box(white,0,29,side*57,192,2,27);a.box(white,side*82,29,0,28,2,90);for(let r=0;r<9;r++)a.box(blue,0,17+r,side*(36+r*2),150,.8,1.7);for(const end of [-1,1]){a.cylinder(white,side*88,35,end*59,.65,70);a.beam(white,new T.Vector3(side*88,65,end*59),new T.Vector3(0,29,end*57),.2);}}buildings++;});
 }
 }else if(key==='vegas'){
 // Sphere-inspired LED dome at the northern loop, kept clear of both track branches.
 let off=-120;while(!reserve(.32,off,58))off-=25;at(.32,off,()=>{a.sphere(pink,0,50,0,52);for(let k=0;k<17;k++){const y=-40+k*5,r=Math.sqrt(52*52-y*y);const ring=a.shape('sphereRing'+k,()=>new T.TorusGeometry(r,.18,4,64));a.put(ring,light,0,50+y,0,1,1,1,new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2),false);}buildings++;});
 for(let j=0;j<100;j++){const u=.50+j*.0044,side=j%2?1:-1,off=side*(75+j%4*22);if(!reserve(u,off,30))continue;at(u,off,()=>{const h=35+j%6*12;a.box(j%3?glass:concrete,0,h/2,0,42,h,32);for(let y=5;y<h;y+=5)a.box(j%2?pink:light,0,y,-16.05,40,.18,.15,false);a.box(white,0,h+.7,0,43,1.4,34);buildings++;});}
 }else if(key==='monaco'){
 // Harbor-side tunnel follows the same centreline; roof and lights do not intrude on the road.
 for(let m=length*MONACO_TUNNEL.start;m<length*MONACO_TUNNEL.end;m+=6){at(m/length,0,()=>{a.box(concrete,0,7,0,6.4,.7,width*2+2);a.box(concrete,0,3.4,-width-1,6.4,6.8,.45);a.box(light,0,6.5,-width*.6,3,.08,.18);});}
 for(let j=0;j<170;j++){const u=j/170;for(const side of [-1,1]){const off=side*(width+24+j%3*13);if(!reserve(u,off,12))continue;at(u,off,()=>{const h=14+j%5*5;a.box(j%3?concrete:sand,0,h/2,0,17,h,15);a.box(red,0,h+.35,0,18,.7,16);for(let y=3;y<h;y+=3.3)for(let x=-6;x<=6;x+=3){a.box(glass,x,y,-7.55,1.4,1.8,.1,false);a.box(white,x,y-1,-8,2,.15,1,false);}buildings++;});}}
 // Mosaic harbor water avoids painting over the tight return section.
 const water=a.material(0x327e91,.5,.21);for(let x=center.x-150;x<center.x+340;x+=25)for(let z=center.z-30;z<center.z+320;z+=25)if(distance(x,z)>40&&!reserved.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+22)){a.box(water,x,-.015,z,24.9,.025,24.9,false);}
 for(const u of [.85,.87,.89]){const off=-60;if(!safe(u,off,18))continue;at(u,off,()=>{a.box(white,0,1,0,8,2,24);a.box(white,0,3,0,6,2,12);a.box(glass,0,4,0,5,.7,10);a.cylinder(dark,0,9,0,.07,10);});}
 }
 if(CITY_PORTRAITS[key as CityKey]){
  // City furnishings stay on clear ground and never create continuous barriers.
  const palms=['dubai','la'].includes(key);
  for(let m=10;m<length;m+=43)for(const side of [-1,1]){
   const off=side*(width+14);if(!reserve(m/length,off,4))continue;
   at(m/length,off,()=>{a.cylinder(bark,0,3.5,0,.18,7);if(palms){for(let k=0;k<9;k++){const t=k*Math.PI*2/9;a.beam(foliage,new T.Vector3(0,8,0),new T.Vector3(Math.cos(t)*4,6.5,Math.sin(t)*4),.19);}}else a.sphere(foliage,0,7,0,3,1.3);});
  }
  // Quays and water pockets blend into the city without covering the racing surface.
  if(!['dubai','paris'].includes(key)){
   const water=a.material(night?0x1e4355:0x548c9c,.55,.24);
   for(let m=0;m<length;m+=45){const u=m/length,off=-(width+85);if(!reserve(u,off,31))continue;at(u,off,()=>{a.box(water,0,-.08,0,43,.1,43,false);});}
  }
 }
 // Venue landscaping and parking occupy only verified clear ground.
 const grass=a.material(key==='miami'?0x4e9157:0x648145),parking=a.material(0x5c6263);
 if(key==='shanghai'||key==='miami')for(let x=bounds.min.x-100;x<bounds.max.x+100;x+=55)for(let z=bounds.min.z-100;z<bounds.max.z+100;z+=55){const d=distance(x,z);if(d<50||reserved.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+42))continue;const park=(Math.sin(x*12.31+z*4.17)>.94)&&d>90;
 if(park)a.box(parking,x,-.023,z,48,.025,48,false);
 if(park){for(let lane=0;lane<10;lane++)a.box(white,x-24+lane*5,.002,z,.08,.015,34,false);}else if(d<220){for(let k=0;k<3;k++){a.cylinder(bark,x+(k-1)*12,2.5,z,.16,5);a.sphere(foliage,x+(k-1)*12,5.5,z,3,1.2);}}
 }
 let separation=Infinity;for(let i=0;i<reserved.length;i++)for(let j=i+1;j<reserved.length;j++){const b=reserved[i],c=reserved[j];separation=Math.min(separation,Math.hypot(b.x-c.x,b.z-c.z)-b.r-c.r);}
 const stats=a.finish();return{key,buildings,landmark:meta.name+' · '+({shanghai:'东方明珠 · 陆家嘴天际线 · 外滩风格街区',miami:'南海滩酒店 · 自由塔 · 体育场',vegas:'Sphere · 酒店霓虹大道 · 金字塔',monaco:'蒙特卡洛赌场 · 王宫风格建筑 · 游艇港'}[key]||meta.description)+'｜城市幻想改编',urbanBuildings:urban.buildings,urbanLandmarks:urban.landmarks,roadsideBarriers:0,focus:center,previewRadius:Math.max(size.x,size.z)*1.04,instances:stats.instances,batches:stats.batches,minimumBuildingClearance:Math.min(...reserved.map(b=>distance(b.x,b.z)-b.r)),minimumBuildingSeparation:reserved.length>1?separation:0};
}
