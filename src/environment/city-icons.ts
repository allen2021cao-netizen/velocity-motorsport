import * as T from 'three';
import {Architecture} from './geometry';
import {landmark} from './landmarks';
import {lettering} from './materials';
import type {CityKey,CityProfile} from './profiles';
export const EXPANDED_CITIES=['tokyo','dubai','la','london','newyork','paris','hongkong'] as const;
export const CITY_PORTRAITS:Partial<Record<CityKey,{title:string;description:string;height:number;span:number}>>={
 tokyo:{title:'东京 · 湾岸霓虹',description:'东京塔 · 彩虹大桥 · 国际展示场 · 霓虹街区',height:85,span:690},
 dubai:{title:'迪拜 · 沙海之城',description:'哈利法塔 · 帆船酒店 · 未来博物馆风貌 · 棕榈与沙丘',height:135,span:890},
 la:{title:'洛杉矶 · 太平洋日落',description:'格里菲斯天文台 · HOLLYWOOD 山丘 · 海滨摩天轮与棕榈',height:53,span:710},
 london:{title:'伦敦 · 泰晤士暮光',description:'伊丽莎白塔与西敏宫 · 伦敦眼 · 塔桥 · 河畔街区',height:65,span:680},
 newyork:{title:'纽约 · 曼哈顿之夜',description:'帝国大厦 · 布鲁克林大桥 · 自由女神像 · 港湾灯海',height:105,span:770},
 paris:{title:'巴黎 · 塞纳河金色时刻',description:'埃菲尔铁塔 · 荣军院金顶 · 凯旋门 · 奥斯曼街区',height:85,span:710},
 hongkong:{title:'香港 · 维港灯海',description:'中银大厦 · 国际金融中心 · 会展中心 · 太平山与天星小轮',height:100,span:790}
};
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
/** Original, instanced architectural interpretations; not surveyed replicas. */
export function cityIcons(a:Architecture,key:CityKey,p:CityProfile){
 const stone=a.material(0xc9b99f),white=a.material(0xe4e4d7),glass=a.material(0x56899c,.7,.24),steel=a.material(0x586b73,.65,.35),gold=a.material(0xd6ac55,.6,.3),leaf=a.material(key==='la'?0x797754:0x375947),copper=a.material(0x559785,.35,.6),night=p.sky==='night',light=a.material(0xffe0b2,0,.4,0xffcf8b,night?2:.5);
 const icons:{radius:number;draw:()=>void}[]=[{radius:key==='london'?128:76,draw:()=>landmark(a,key,p)}];
 function add(radius:number,draw:()=>void){icons.push({radius,draw});}
 function bridge(tower:boolean){
  a.box(steel,0,15,0,230,3,18);a.box(stone,0,16.7,0,230,.5,14);
  for(const x of [-65,65]){
   for(const z of [-10,10]){a.box(tower?stone:white,x,37,z,10,74,7);if(tower){a.cylinder(steel,x,81,z,8,15,0,4);a.box(light,x,66,z,11,1,8);}}
   a.box(tower?stone:white,x,61,0,10,8,27);
  }
  if(tower)a.box(steel,0,55,0,130,3,9);
  for(const z of [-10,10])for(let x=-112;x<112;x+=4){const y=(x:number)=>Math.abs(x)<65?25+36*(x/65)**2:61-(Math.abs(x)-65)*.9;
   a.beam(white,v(x,y(x),z),v(x+4,y(x+4),z),.3);a.beam(white,v(x,17,z),v(x,y(x),z),.12);
   if(x%8===0)a.sphere(light,x,18,z,.35);
  }
 }
 function wheel(radius=45){
  const geo=a.shape('city-wheel-'+radius,()=>new T.TorusGeometry(radius,.6,6,96));a.put(geo,white,0,radius+10,0);
  for(const s of [-1,1])a.beam(white,v(s*17,0,12),v(0,radius+10,0),1);
  for(let i=0;i<28;i++){const t=i*Math.PI*2/28,x=Math.cos(t)*radius,y=radius+10+Math.sin(t)*radius;a.beam(steel,v(0,radius+10,0),v(x,y,0),.13);a.sphere(glass,x,y,0,2.3,.65);a.sphere(light,x,y,1.6,.4);}
 }
 switch(key){
 case 'tokyo':
  add(125,()=>bridge(false));
  add(78,()=>{a.box(stone,0,8,0,105,16,75);for(const x of [-26,26])for(const z of [-23,23]){a.box(white,x,32,z,6,48,6);a.at(x,50,z,Math.PI/4,1,()=>a.cylinder(steel,0,0,0,12,28,2.4,4));a.box(glass,x,50,z,33,9,33);}a.plane(lettering(a,'TOKYO BIG SIGHT'),0,18,39,80,6);});break;
 case 'dubai':
  add(55,()=>{a.cylinder(stone,0,1,0,49,2,1,48);for(let i=0;i<30;i++){const y=i*5+4,w=11+28*Math.sin(i/30*Math.PI);a.box(glass,0,y,0,w,5,20);a.box(white,-w/2,y,0,1,5,23);a.box(white,w/2,y,0,1,5,23);a.box(white,0,y+2.4,10.2,w,.24,.25);}a.beam(white,v(0,0,-14),v(0,168,-10),1.4);a.cylinder(white,24,132,3,12,1.5,1,32);a.beam(white,v(0,121,0),v(24,132,3),1);});
  add(64,()=>{const geo=a.shape('future-ring',()=>new T.TorusGeometry(30,11,18,64));a.put(geo,steel,0,39,0,1.65,1,1);for(let i=0;i<64;i++){const t=i*Math.PI*2/64,x=Math.cos(t)*49,y=39+Math.sin(t)*30;a.at(x,y,10,-t,1,()=>{a.box(light,0,0,0,3.5,.4,.2,false);a.box(light,1,1,0,.4,2,.2,false);});}a.box(stone,0,3,0,110,6,34);});break;
 case 'la':
  add(116,()=>{a.sphere(leaf,0,-22,0,112,.65);a.plane(lettering(a,'HOLLYWOOD','#777755','#fff8e5'),0,62,72,160,20);for(let x=-70;x<=70;x+=14)a.box(steel,x,42,70,.8,40,.8);});
  add(91,()=>{a.box(stone,0,1,0,160,2,38);wheel(36);for(const x of [-65,65]){a.box(stone,x,6,0,22,12,24);a.cylinder(white,x,16,0,18,8,0,4);}a.plane(lettering(a,'PACIFIC PARK'),0,5,21,50,5);});break;
 case 'london':add(65,()=>wheel(52));add(125,()=>bridge(true));break;
 case 'newyork':
  add(125,()=>bridge(true));
  add(40,()=>{a.cylinder(stone,0,1,0,38,2,1,12);a.box(stone,0,14,0,21,26,21);a.box(stone,0,29,0,25,4,25);a.cylinder(copper,0,47,0,11,34,.55,12);a.sphere(copper,0,69,0,4.7,1.25);a.beam(copper,v(4,60,0),v(12,81,0),2.3);a.beam(copper,v(-4,59,0),v(-9,50,6),2.4);a.box(copper,-8,54,7,6,10,2);a.cylinder(gold,12,87,0,2.5,6,.6);a.sphere(light,12,92,0,2,1.7);for(let i=0;i<7;i++){const t=(i/6-.5)*Math.PI;a.beam(copper,v(Math.sin(t)*3,72,Math.cos(t)*3),v(Math.sin(t)*8,76,Math.cos(t)*8),.4);}for(let x=-7;x<=7;x+=2)a.beam(copper,v(x,32,6),v(x*.45,62,3),.25);});break;
 case 'paris':
  add(70,()=>{a.box(stone,0,13,0,100,26,55);a.box(stone,0,33,0,34,40,34);a.cylinder(stone,0,59,0,19,16,1,24);a.sphere(gold,0,69,0,21,.9);a.cylinder(gold,0,94,0,3,18,.25);a.cylinder(gold,0,108,0,.7,12);for(let i=0;i<16;i++){const t=i*Math.PI/8;a.box(white,Math.cos(t)*18,59,Math.sin(t)*18,1.5,13,1.5);}for(let x=-45;x<=45;x+=6)a.box(glass,x,15,27.6,2,9,.2);});
  add(35,()=>{for(const x of [-15,15]){a.box(stone,x,18,0,16,36,18);for(const z of [-9,9])a.box(white,x,16,z,10,22,.4);}a.box(stone,0,38,0,46,15,20);a.box(white,0,47,0,48,3,22);const arc=a.shape('triumph-arch',()=>new T.TorusGeometry(8,2,6,28,Math.PI));for(const z of [-8,8])a.put(arc,stone,0,25,z);});break;
 case 'hongkong':
  add(55,()=>{for(let i=0;i<24;i++){const w=44-i*.7;a.box(glass,0,i*10+5,0,w,10,w*.7);for(const x of [-w*.4,-w*.2,0,w*.2,w*.4])a.box(white,x,i*10+5,w*.35+.15,.4,10,.2);a.box(light,0,i*10+10,0,w,.14,w*.7);}for(const x of [-12,12])a.box(white,x,249,0,4,18,20);});
  add(86,()=>{a.box(glass,0,12,0,120,24,70);for(let i=0;i<16;i++){const x=(i-7.5)*8,y=27+16*Math.cos(x/67*Math.PI/2);a.box(white,x,y,0,8.2,2,80-Math.abs(x)*.3);}a.box(stone,0,1,0,140,2,90);});break;
 }
 return icons;
}
