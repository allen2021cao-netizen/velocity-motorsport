import * as T from 'three';
import {Architecture} from './geometry';
import {lettering} from './materials';
import type {CityKey,CityProfile} from './profiles';
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
/** Hand-built structural silhouettes. Dimensions are artistic scale; this is not a survey model. */
export function landmark(a:Architecture,key:CityKey,p:CityProfile){
 const stone=a.material(0xc9b99a),dark=a.material(0x303a40,.55,.37),glass=a.material(0x648a9c,.68,.24),steel=a.material(key==='tokyo'?0xd84520:0x7e6e58,.7,.48),cream=a.material(0xe1d4bb),gold=a.material(0xc7a465,.65,.38),white=a.material(0xe3e8e7,.15,.55),lit=a.material(0xf1d9ae,.1,.5,0xffbf75,p.sky==='night'?2:.3);
 function lattice(tokyo:boolean){
  const levels=tokyo?[[0,44],[56,22],[106,13],[152,7],[205,2]]:[[0,49],[52,26],[105,16],[177,6],[238,1.8]];
  for(let k=0;k<levels.length-1;k++){
   const [y0,r0]=levels[k],[y1,r1]=levels[k+1];
   for(let side=0;side<4;side++){
    const ang=side*Math.PI/2,point=(x:number,y:number,r:number)=>v(Math.cos(ang)*x-Math.sin(ang)*r,y,Math.sin(ang)*x+Math.cos(ang)*r);
    a.beam(steel,point(-r0,y0,r0),point(-r1,y1,r1),k<2?1.2:.65);
    a.beam(steel,point(r0,y0,r0),point(r1,y1,r1),k<2?1.2:.65);
    for(let n=0;n<7;n++){const t=n/7,u=(n+1)/7,ry=r0+(r1-r0)*t,ry2=r0+(r1-r0)*u,y=y0+(y1-y0)*t,y2=y0+(y1-y0)*u;
     a.beam(steel,point(-ry,y,ry),point(ry2,y2,ry2),.26);a.beam(steel,point(ry,y,ry),point(-ry2,y2,ry2),.26);a.beam(steel,point(-ry,y,ry),point(ry,y,ry),.28);
    }
   }
   if(k>0&&k<3){a.box(tokyo?white:dark,0,y0,0,r0*2.4,3.8,r0*2.4);a.box(tokyo?glass:steel,0,y0+4,0,r0*2.1,4,r0*2.1);}
  }
  a.cylinder(tokyo?white:steel,0,tokyo?224:254,0,1.3,38,.3);a.sphere(lit,0,tokyo?244:274,0,1.4);
 }
 switch(key){
 case 'paris':lattice(false);break;
 case 'tokyo':lattice(true);break;
 case 'shanghai':{
  const pearl=a.material(0xb15d72,.65,.3,0x6b1b3d,.7);
  for(let i=0;i<3;i++){const t=i*Math.PI*2/3;a.beam(stone,v(Math.cos(t)*28,0,Math.sin(t)*28),v(Math.cos(t)*7,80,Math.sin(t)*7),3.4);a.cylinder(stone,Math.cos(t)*5,116,Math.sin(t)*5,2.5,150);}
  a.sphere(pearl,0,80,0,22);a.cylinder(glass,0,80,0,22.1,7);a.sphere(pearl,0,183,0,13);a.cylinder(glass,0,183,0,13.2,5);a.cylinder(white,0,223,0,1.8,68,.3);a.sphere(lit,0,259,0,1.3);
  a.at(110,0,45,0,1,()=>{for(let i=0;i<30;i++){a.at(0,i*10+5,0,i*.026,1,()=>a.cylinder(i%4===0?dark:glass,0,0,0,23-i*.36,10,.985,7));}a.cylinder(glass,0,308,0,12,16,.1,12);});
  a.at(56,0,-75,0,1,()=>{for(let i=0;i<16;i++){const w=32-i*1.5;a.box(i%2?stone:glass,0,i*12+6,0,w,12,w);}a.cylinder(gold,0,210,0,3,40,.1);});
  a.at(140,0,-72,0,1,()=>{a.box(glass,0,112,0,36,224,22);for(const s of [-1,1])a.box(glass,s*14,240,0,8,32,22);a.box(dark,0,258,0,36,7,22);});break;
 }
 case 'hongkong':{
  const heights=[180,214,250,283];for(let i=0;i<4;i++){const x=(i%2?1:-1)*12,z=(i>1?1:-1)*12,h=heights[i];a.box(glass,x,h/2,z,24,h,24);for(let y=0;y<h-35;y+=36){for(const s of [-1,1])a.beam(white,v(x-12,y,z+s*12.2),v(x+12,y+36,z+s*12.2),.45);}}
  for(const z of [-24,24]){a.beam(white,v(-24,0,z),v(-24,214,z),.5);a.beam(white,v(24,0,z),v(24,283,z),.5);}for(const x of [2,22])a.cylinder(white,x,307,16,.9,70,.4);break;
 }
 case 'newyork':{
  const tiers=[[0,55,86],[55,75,65],[130,66,42],[196,22,32],[218,18,24]];for(const [y,h,w]of tiers){a.box(stone,0,y+h/2,0,w,h,w*.68);for(let x=-w/2+2;x<w/2;x+=4)for(const s of [-1,1])a.box(glass,x,y+h/2,s*(w*.34+.1),1.7,h-2,.3);a.box(cream,0,y+h,0,w+1,1.2,w*.68+1);}
  a.cylinder(lit,0,245,0,12,20,.65,8);a.cylinder(white,0,269,0,4.5,35,.25,12);a.cylinder(steel,0,304,0,.8,43,.1);break;
 }
 case 'london':{
  a.box(stone,0,30,0,17,60,17);for(const x of [-8,8])for(const z of [-8,8])a.box(cream,x,36,z,1.7,72,1.7);
  for(let y=4;y<56;y+=5){a.box(cream,0,y,0,18,.6,18);for(let x=-5;x<=5;x+=5)for(const s of [-1,1])a.box(dark,x,y+2,s*8.55,1.3,3,.25);}
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;g.fillStyle='#dedbd0';g.fillRect(0,0,256,256);g.strokeStyle='#343a3c';g.lineWidth=8;g.beginPath();g.arc(128,128,112,0,Math.PI*2);g.stroke();g.font='bold 22px serif';g.textAlign='center';g.textBaseline='middle';for(let i=1;i<=12;i++){let t=i*Math.PI/6;g.fillStyle='#303338';g.fillText(String(i),128+Math.sin(t)*88,128-Math.cos(t)*88);}g.lineWidth=6;g.beginPath();g.moveTo(128,128);g.lineTo(82,92);g.moveTo(128,128);g.lineTo(184,101);g.stroke();const map=a.keep(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;const face=a.keep(new T.MeshStandardMaterial({map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:.3}));
  a.box(stone,0,64,0,20,16,20);for(let k=0;k<4;k++)a.at(0,0,0,k*Math.PI/2,1,()=>a.plane(face,0,64,10.1,13,13));a.box(gold,0,74,0,22,2,22);a.cylinder(dark,0,84,0,13,19,0,4);a.cylinder(gold,0,99,0,.7,16,.1);
  a.at(65,0,4,0,1,()=>{a.box(stone,0,15,0,100,30,30);for(let x=-48;x<=48;x+=8){a.box(dark,x,18,15.1,3,18,.3);a.cylinder(stone,x,35,15,1.5,12,0,4);}a.box(dark,0,32,0,104,4,34);});break;
 }
 case 'dubai':{
  for(let level=0;level<28;level++){const y=level*12,w=32-level*.82;for(let wing=0;wing<3;wing++){const angle=wing*Math.PI*2/3+(Math.floor(level/4)%3)*.15;a.at(Math.sin(angle)*w*.52,y+6,Math.cos(angle)*w*.52,angle,1,()=>{a.cylinder(glass,0,0,0,w*.53,12,.97,12);for(let n=0;n<3;n++)a.cylinder(dark,0,n*3.8-5,0,w*.535,.25,1,12);});}a.cylinder(glass,0,y+6,0,w*.52,12,.97,12);}
  a.cylinder(steel,0,364,0,3,66,.08);a.cylinder(white,0,405,0,.5,25,.1);break;
 }
 case 'vegas':{
  for(const x of [-8,8])a.cylinder(stone,x,85,0,4,170,.55,12);a.cylinder(dark,0,176,0,29,12,.8,32);a.cylinder(lit,0,185,0,25,7,.7,32);a.cylinder(glass,0,192,0,22,9,.7,32);a.cylinder(steel,0,220,0,2.5,50,.1);const sphere=a.material(0x3d4e8b,.45,.45,0x493675,.7);a.sphere(sphere,100,46,30,46,.95);for(let y=12;y<84;y+=6){const r=Math.sqrt(Math.max(0,46*46-(y-46)**2));a.cylinder(lit,100,y,30,r,.3,1,48);}const sign=lettering(a,'LAS VEGAS','#352024','#f1d6a2');a.plane(sign,0,140,9,32,10);break;
 }
 case 'la':{
  a.box(stone,0,12,0,100,24,40);a.box(cream,0,24,0,104,2,44);for(const x of [-36,0,36]){a.cylinder(stone,x,29,0,x===0?20:12,12,1,24);a.sphere(dark,x,35,0,x===0?20:12,.6);}for(let x=-40;x<=40;x+=8){a.box(dark,x,14,20.1,4,12,.3);a.cylinder(cream,x+3,12,23,1,24);}a.box(stone,0,2,32,66,4,22);break;
 }
 case 'monaco':{
  a.box(stone,0,14,0,76,28,32);a.box(cream,0,29,0,78,2,34);for(const x of [-29,29]){a.box(stone,x,26,0,17,48,22);a.cylinder(gold,x,54,0,12,15,0,4);a.cylinder(dark,x,65,0,.7,10,.1);}for(let x=-18;x<=18;x+=9){a.cylinder(cream,x,12,17,1,24);a.box(dark,x+3,14,16.1,4,15,.3);}a.plane(lettering(a,'CASINO DE MONTE CARLO','#ae9873','#f8eccf'),0,29,18,32,4);break;
 }
 case 'miami':{
  const pink=a.material(0xd7c0b8),teal=a.material(0x73b8b3);a.box(pink,0,15,0,52,30,28);a.box(white,0,17,0,12,34,30);for(let y=5;y<30;y+=5){a.box(teal,0,y,14.2,54,.65,.6);for(const x of [-18,-10,10,18])a.box(glass,x,y+2,14.3,5,2.7,.3);}a.cylinder(teal,0,36,0,5,3,1,24);a.plane(lettering(a,'OCEAN DRIVE','#315b63','#f6e7ca'),0,31,15.2,24,4);break;
 }
 case 'alps':{
  a.box(stone,0,4,0,21,8,15);a.cylinder(dark,0,11,0,15,7,0,4);a.box(white,0,15,0,5,1,5);for(const x of [-15,15])a.cylinder(steel,x,15,0,.6,30);a.beam(steel,v(-15,30,0),v(15,30,0),.6);a.box(gold,0,23,0,6,5,4);break;
 }
 }
}
