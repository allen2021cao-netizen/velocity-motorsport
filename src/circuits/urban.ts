import * as T from 'three';
import {Architecture} from '../environment/geometry';
import {facade,lettering} from '../environment/materials';
import {landmark} from '../environment/landmarks';
import {CITY_PROFILES,type CityKey} from '../environment/profiles';
import {CITY_PORTRAITS,cityIcons} from '../environment/city-icons';
/** A deliberately fictional city setting around the preserved circuit geometry. */
export function urbanDistrict(a:Architecture,key:CityKey,length:number,width:number,
 at:(u:number,offset:number,fn:()=>void)=>void,reserve:(u:number,offset:number,r:number)=>boolean){
 const profile=CITY_PROFILES[key],night=profile.sky==='night',p={...profile,sky:night?'night' as const:profile.sky};
 const fronts=[0,1,2].map(i=>facade(a,p,i)),shops=p.shops.map(t=>lettering(a,t)),stone=a.material(0xd1c3aa),glass=a.material(0x5c91a5,.55,.25),roof=a.material(key==='monaco'?0xa65c46:0x515d66),metal=a.material(0x344653,.5),pavement=a.material(0xb1aaa0),gold=a.material(0xd9b76d,.4),warm=a.material(0xffe6ac,0,.5,0xffc875,night?2.5:.35),neon=a.material(p.accent,0,.45,p.accent,night?2:.3);
 let buildings=0,landmarks=0;
 function hero(u:number,side:number,radius:number,fn:()=>void){for(let off=radius+width+32;off<1200;off+=35){if(!reserve(u,side*off,radius))continue;at(u,side*off,fn);landmarks++;return;}}
 if(CITY_PORTRAITS[key])cityIcons(a,key,p).forEach((icon,i)=>hero([.14,.46,.77][i],i===1?-1:1,icon.radius,icon.draw));
 if(key==='shanghai')hero(.17,-1,185,()=>landmark(a,key,p));
 if(key==='miami'){
  hero(.28,1,38,()=>landmark(a,key,p));
  // Freedom Tower-inspired Mediterranean base, belfry and cupola.
  hero(.70,-1,34,()=>{a.box(stone,0,9,0,48,18,32);a.box(stone,0,35,0,17,52,17);for(let y=20;y<60;y+=6)for(const s of [-1,1])a.box(glass,s*5,y,8.6,2.6,3,.15,false);a.box(gold,0,61,0,23,3,23);for(const x of [-7,7])for(const z of [-7,7])a.cylinder(stone,x,68,z,.7,12);a.cylinder(roof,0,77,0,11,8,0,8);a.cylinder(gold,0,85,0,.5,12);});
 }
 if(key==='monaco'){
  hero(.20,1,49,()=>landmark(a,key,p));
  hero(.75,1,48,()=>{a.box(stone,0,12,0,72,24,36);for(const x of [-30,30]){a.box(stone,x,20,0,15,40,22);for(let k=-6;k<=6;k+=4)a.box(stone,x+k,41,0,2,3,23);}for(let x=-22;x<25;x+=6)a.box(glass,x,15,18.1,2,4,.15,false);a.box(roof,0,25,0,56,2,38);});
 }
 if(key==='vegas'){
  hero(.80,1,95,()=>{ // Bellagio-inspired three-wing hotel silhouette.
   for(const angle of [-.4,0,.4])a.at(0,0,0,angle,1,()=>{a.box(gold,0,47,0,150,94,25);for(let x=-70;x<=70;x+=7)a.box(glass,x,46,12.6,3,84,.15,false);a.box(warm,0,93,0,153,1,27,false);});a.cylinder(stone,0,100,0,10,14);a.sphere(gold,0,108,0,12,.4);
  });
  hero(.61,-1,58,()=>{a.cylinder(glass,0,38,0,68,76,0,4);for(const x of [-1,1])for(const z of [-1,1])a.beam(neon,new T.Vector3(x*48,0,z*48),new T.Vector3(0,76,0),.4);});
 }
 // Three depth bands: walkable shopfront scale, urban blocks and a distant skyline.
 for(let band=0;band<3;band++)for(let m=20;m<length;m+=band===0?42:band===1?95:170)for(const side of [-1,1]){
  const i=Math.floor(m/13)+band*17+(side+1)*3,w=band===0?17+i%4*2:26+i%4*5,d=band===0?15:24+i%3*6,r=Math.hypot(w+3,d+4)/2;
  const off=side*(width+(band===0?27+i%3*4:band===1?105+i%3*22:245+i%4*35));
  if(!reserve(m/length,off,r))continue;
  at(m/length,off,()=>{const historic=key==='paris'||key==='london'||key==='la',h=band===0?(key==='miami'?12:18)+i%4*4:historic?22+i%4*7:band===1?30+i%5*9:65+i%7*14;
   a.box(fronts[i%3],0,h/2,0,w,h,d);a.box(pavement,0,.14,0,w+2,.28,d+3);a.box(roof,0,h+.35,0,w+1,.7,d+1);
   // Both façades remain convincing when driven in either direction around the loop.
   for(const face of [-1,1]){
    if(band===0){for(let x=-w/2+2;x<w/2;x+=4)a.box(glass,x,1.6,face*(d/2+.1),2.8,2.8,.12,false);a.at(0,0,0,face===1?0:Math.PI,1,()=>{a.plane(shops[i%shops.length],0,3.8,d/2+.25,w-2,1.2);a.box(neon,0,4.7,d/2+.55,w,.2,1.1,false);});}
    for(let y=5;y<h;y+=key==='vegas'?6:10)a.box(key==='vegas'?warm:stone,0,y,face*(d/2+.12),w,.22,.2,false);
   }
   if(key==='miami'){a.box(stone,0,h/2,0,w*.17,h+3,d+1);a.box(neon,0,h+2,0,w*.2,.3,d+1,false);}
   if(key==='shanghai'&&band===0)for(const x of [-w*.4,w*.4])a.box(stone,x,h/2,d/2+.25,.7,h,.5);
   if(key==='monaco')a.cylinder(roof,0,h+2,0,1,4,0,4); // small roof ornament, no roadside railings
   if(key==='paris'){a.box(roof,0,h+2,0,w+1,4,d+1);for(let x=-w/2+3;x<w/2;x+=5)for(let y=7;y<h;y+=4)a.box(metal,x,y,d/2+.6,3.8,.4,1.2);}
   if(key==='london')for(const x of [-w*.3,w*.3])a.box(stone,x,h+2,0,2,4,2);
   if(key==='tokyo')a.plane(shops[i%shops.length],w*.35,h*.6,d/2+.4,3,Math.min(18,h*.65));
   if(band>0)a.box(metal,w*.2,h+1,-d*.15,w*.18,1.5,d*.2);
   if(night)for(const x of [-w/2,w/2])a.box(neon,x,h/2,d/2+.15,.22,h,.2,false);
  });buildings++;
 }
 // Broad scenic backdrops are reserved outside every road branch, like buildings.
 if(['hongkong','la','dubai'].includes(key))for(const u of [.30,.62,.90])hero(u,-1,180,()=>{
  const terrain=a.material(key==='dubai'?0xc7ab7c:key==='la'?0x857a56:0x385449);
  a.sphere(terrain,0,-45,0,175,key==='dubai'?.4:.9);
 });
 // Illuminated street furniture and planted squares; never a continuous roadside barrier.
 for(let m=10;m<length;m+=65)for(const side of [-1,1]){const off=side*(width+8);if(!reserve(m/length,off,2.2))continue;at(m/length,off,()=>{a.box(pavement,0,.08,0,4,.16,4);a.cylinder(metal,0,3.5,0,.1,7);a.box(warm,0,7,0,1.5,.18,.8,false);a.box(neon,.4,5,0,.7,1.5,.08,false);});}
 return {buildings,landmarks};
}
