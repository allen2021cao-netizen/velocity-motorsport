import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {Architecture} from './geometry';
import {facade,lettering} from './materials';
import {landmark} from './landmarks';
import {CITY_PROFILES,seeded,type CityKey} from './profiles';
/** Standalone city portrait: no circuit geometry, race furniture or racing cars. */
export function createCityShowcase(key:CityKey){
 const group=new T.Group();group.name='city-showcase-'+key;const resources:any[]=[],a=new Architecture(group,resources),rand=seeded(7831+key.length*51+key.charCodeAt(0));
 const night=key==='vegas'||key==='shanghai',profile={...CITY_PROFILES[key],sky:night?'night' as const:'sunset' as const};
 const shops=profile.shops.map(t=>lettering(a,t));
 const fronts=[0,1,2].map(i=>facade(a,profile,i)),stone=a.material(0xc8bca6),white=a.material(0xe4ddd0),glass=a.material(0x4b8297,.6,.23),dark=a.material(0x283644),ground=a.material(0x626566),street=a.material(0x252f38,.1,.65),roof=a.material(key==='monaco'?0x9b634e:0x455560),warm=a.material(0xffdeb2,0,.4,0xffc988,night?2.3:.8),accent=a.material(profile.accent,0,.4,profile.accent,night?2:.5),leaf=a.material(0x365648),bark=a.material(0x70634d);
 if(night)fronts.forEach((material,index)=>{const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=c.height=e.width=e.height=256;const g=c.getContext('2d')!,lit=e.getContext('2d')!;g.fillStyle=['#243441','#343c46','#20333d'][index];g.fillRect(0,0,256,256);lit.fillStyle='#000';lit.fillRect(0,0,256,256);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const on=rand()>.55;g.fillStyle=on?'#9b927b':'#101f2a';g.fillRect(x*64+14,y*64+10,32,38);if(on){lit.fillStyle=rand()>.6?'#e9bd7c':'#92b3c9';lit.fillRect(x*64+14,y*64+10,32,38);}}for(const [canvas,field]of [[c,'map'],[e,'emissiveMap']] as const){const tex=a.keep(new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;material[field]=tex;}material.emissiveIntensity=.85;material.needsUpdate=true;});
 a.box(ground,0,-1,key==='vegas'?-100:-400,2400,2,key==='vegas'?1700:1100,false);
 if(key==='shanghai')a.at(0,0,-120,0,1,()=>{
  const pearl=a.material(0xb77499,.5,.3,0xb1246a,.55);for(let i=0;i<3;i++){const t=i*Math.PI*2/3;a.beam(stone,new T.Vector3(Math.cos(t)*27,0,Math.sin(t)*27),new T.Vector3(Math.cos(t)*6,80,Math.sin(t)*6),3);a.cylinder(stone,Math.cos(t)*5,126,Math.sin(t)*5,2,160);}a.sphere(pearl,0,80,0,22);a.sphere(pearl,0,182,0,13);a.cylinder(warm,0,228,0,.7,66,.25);
  a.at(108,0,-15,0,1,()=>{for(let i=0;i<32;i++)a.at(0,i*9+4.5,0,i*.028,1,()=>{a.cylinder(glass,0,0,0,24-i*.39,9,.99,20);a.cylinder(accent,0,4.4,0,24-i*.39,.12,1,20);});a.cylinder(glass,0,294,0,12,12,.3,20);});
  a.at(42,0,-80,0,1,()=>{for(let i=0;i<17;i++){const w=30-i*1.25;a.box(fronts[1],0,i*11+5.5,0,w,11,w);a.box(warm,0,i*11+11,0,w,.2,w);}a.cylinder(warm,0,203,0,.7,34,0);});
  a.at(156,0,-82,0,1,()=>{a.box(fronts[2],0,108,0,35,216,22);for(const side of [-1,1])a.box(glass,side*14,231,0,7,30,22);a.box(accent,0,247,0,35,2,22);});
 });else a.at(key==='vegas'?-60:0,0,-35,0,1,()=>landmark(a,key,profile));
 // Waterfront promenade; Vegas instead has an open boulevard and hotel forecourts.
 a.box(stone,0,.16,96,1700,.32,32,false);
 for(const z of [55,-125,-325])a.box(street,0,.015,z,1750,.03,20,false);
 for(const x of [-340,-190,190,340])a.box(street,x,.02,-290,18,.04,760,false);
 const reservedRadius=key==='shanghai'?230:key==='vegas'?165:95;let buildings=0;
 for(let row=0;row<7;row++)for(let col=-11;col<=11;col++){
  const x=col*62+(row%2)*10,z=-30-row*75;
  if(Math.hypot(x,z+(key==='shanghai'?120:35))<reservedRadius||[-340,-190,190,340].some(v=>Math.abs(x-v)<29))continue;
  const w=30+rand()*17,d=28+rand()*15,h=row<2?(key==='miami'?12:22)+rand()*24:35+rand()*(key==='shanghai'?145:key==='vegas'?90:65);
  if(key==='monaco'&&row>0)a.box(stone,x,row*4-1,z,w+6,row*8,d+6);
  a.at(x,key==='monaco'?row*8:0,z,0,1,()=>{
   a.box(fronts[(col+33+row)%3],0,h/2,0,w,h,d);a.box(roof,0,h+.5,0,w+1,1,d+1);
   for(let y=4;y<h;y+=key==='miami'?4:7)a.box(key==='vegas'?accent:white,0,y,d/2+.15,w,.22,.2,false);
   if(key==='miami'){a.box(white,0,h/2,0,6,h+3,d+1);a.box(accent,0,h+3,0,7,.5,d+1,false);}
   if(key==='monaco')a.put(a.shape('roof',()=>new T.ConeGeometry(1,1,4)),roof,0,h+3,0,w*.73,6,d*.73,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/4));
   if(row<2){a.box(glass,0,2,d/2+.2,w-3,3,.2);a.plane(shops[(col+33)%4],0,4.5,d/2+.3,w-2,1.4);}
   if(night)for(const dx of [-w/2,w/2])a.box(accent,dx,h/2,d/2+.2,.2,h,.2,false);
  });buildings++;
 }
 // A waterfront lined with individually modeled palms, lamps and benches.
 for(let x=-700;x<=700;x+=28){a.at(x,0,90,0,1,()=>{
  a.cylinder(dark,0,4,0,.09,8);a.sphere(warm,0,8,0,.55);a.box(stone,7,.5,0,4,.3,1.2);
  if(key==='miami'||key==='monaco'||key==='vegas'){a.beam(bark,new T.Vector3(12,0,0),new T.Vector3(13,10,0),.22);for(let i=0;i<9;i++){const t=i*Math.PI*2/9;a.beam(leaf,new T.Vector3(13,10,0),new T.Vector3(13+Math.cos(t)*4,8.7,Math.sin(t)*4),.18);}}
 });}
 let reflector:Reflector|undefined;
 if(key!=='vegas'){
  const geo=a.keep(new T.PlaneGeometry(2100,1500));reflector=new Reflector(geo,{color:night?0x506678:0x91adaf,textureWidth:768,textureHeight:768,clipBias:.005});reflector.rotation.x=-Math.PI/2;reflector.position.set(0,-.12,870);group.add(reflector);
  // Subtle moving distortion applied to the real planar reflection.
  const mat=reflector.material as T.ShaderMaterial;mat.uniforms.waveTime={value:0};mat.fragmentShader='uniform float waveTime;\n'+mat.fragmentShader;mat.fragmentShader=mat.fragmentShader.replace('texture2DProj( tDiffuse, vUv )','texture2DProj( tDiffuse, vUv + vec4(sin(vUv.y*170.0+waveTime*.5)*.0015*vUv.w, cos(vUv.x*150.0+waveTime*.4)*.0007*vUv.w,0.0,0.0) )');
  if(key==='monaco'||key==='miami')for(let j=0;j<14;j++)a.at(-280+j*42,0,140+(j%3)*28,.2,1,()=>{a.box(white,0,1.1,0,7,2.2,22);a.box(glass,0,3,0,5,2,11);a.box(white,0,4.2,0,5.5,.4,12);a.cylinder(dark,0,9,-2,.065,10);});
 }else{
  const hotel=a.material(0xba9870,.4);for(const side of [-1,1])a.at(side*250,0,-110,side*.25,1,()=>{a.box(hotel,0,58,0,130,116,36);for(let x=-60;x<=60;x+=6)a.box(glass,x,57,18.1,3,106,.15,false);for(let y=10;y<116;y+=9)a.box(warm,0,y,18.3,129,.24,.2,false);a.box(warm,0,118,0,132,2,38,false);});
  a.at(-170,0,20,0,1,()=>{a.cylinder(glass,0,28,0,48,56,0,4);for(const x of [-1,1])for(const z of [-1,1])a.beam(accent,new T.Vector3(x*34,0,z*34),new T.Vector3(0,56,0),.3);});
 }
 const stats=a.finish(),focus=new T.Vector3(key==='shanghai'?45:0,key==='shanghai'?100:key==='vegas'?68:36,-80);
 const labels={shanghai:['上海 · 璀璨滨江','东方明珠 · 陆家嘴天际线 · 滨江灯影'],vegas:['拉斯维加斯 · 霓虹之城','观景塔 · Sphere · 酒店与霓虹大道'],miami:['迈阿密 · 海岸暮色','Ocean Drive · 装饰艺术酒店 · 棕榈海岸'],monaco:['摩纳哥 · 蔚蓝海港','蒙特卡洛赌场 · 山坡街区 · 游艇港']};
 const title=labels[key as keyof typeof labels]!;
 return {group,profile,focus,title:title[0],description:title[1],buildings,...stats,
  view(camera:T.PerspectiveCamera,time:number){const span=key==='shanghai'?630:key==='vegas'?590:450,scale=1/Math.min(1,Math.max(.72,camera.aspect)),angle=Math.sin(time*.035)*.24;camera.position.set(focus.x+Math.sin(angle)*span,focus.y+(key==='shanghai'?115:80)+Math.sin(time*.025)*8,focus.z+Math.cos(angle)*span*scale);camera.lookAt(focus);camera.fov=47;camera.updateProjectionMatrix();if(reflector)(reflector.material as T.ShaderMaterial).uniforms.waveTime.value=time;},
  dispose(){reflector?.getRenderTarget().dispose();if(reflector)(reflector.material as T.Material).dispose();for(const r of resources)r.dispose();group.removeFromParent();}
 };
}
