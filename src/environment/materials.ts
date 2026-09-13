import * as T from 'three';
import {Architecture} from './geometry';
import {seeded,type CityProfile} from './profiles';
export function lettering(a:Architecture,text:string,bg='#192e33',fg='#eee6cc',width=512){
 const c=document.createElement('canvas');c.width=width;c.height=128;const g=c.getContext('2d')!;
 g.fillStyle=bg;g.fillRect(0,0,width,128);g.strokeStyle=fg;g.lineWidth=3;g.strokeRect(6,6,width-12,116);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='600 '+Math.min(52,width/(text.length*.67))+'px "Segoe UI","Microsoft YaHei",sans-serif';g.fillText(text,width/2,64);
 const map=a.keep(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;
 return a.keep(new T.MeshStandardMaterial({map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:.35,roughness:.75}));
}
export function facade(a:Architecture,p:CityProfile,index:number){
 const rand=seeded(830+index*99+p.label.charCodeAt(0)),c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d')!;
 const night=p.sky==='night';const color=new T.Color(p.palette[index%p.palette.length]);
 g.fillStyle='#'+color.getHexString();g.fillRect(0,0,512,512);
 if(p.style==='brick')for(let row=0;row<64;row++){for(let col=0;col<22;col++){g.fillStyle=rand()>.5?'rgba(0,0,0,.11)':'rgba(255,240,210,.08)';g.fillRect(col*25+(row%2)*12,row*8,23,6);}}
 for(let floor=0;floor<4;floor++)for(let bay=0;bay<4;bay++){
  const x=bay*128,y=floor*128;g.fillStyle='rgba(0,0,0,.13)';g.fillRect(x,y+120,128,8);
  const glass=p.style==='glass',wx=x+(glass?5:28),wy=y+12,ww=glass?118:70,wh=glass?109:87;
  g.fillStyle='#1d262c';g.fillRect(wx-3,wy-3,ww+6,wh+6);
  const gradient=g.createLinearGradient(wx,wy,wx+ww,wy+wh);const lit=night&&rand()>.37;
  gradient.addColorStop(0,lit?'#e4c88f':'#607b89');gradient.addColorStop(.35,lit?'#c7af7d':'#394f5a');gradient.addColorStop(1,lit?'#82785e':'#182c36');g.fillStyle=gradient;g.fillRect(wx,wy,ww,wh);
  if(rand()>.4){g.fillStyle=lit?'#c2b18c':'#7b8583';g.globalAlpha=.65;g.fillRect(wx+1,wy+1,ww*.3,wh);g.globalAlpha=1;}
  g.fillStyle=glass?'#81918f':'#bbb7a6';g.fillRect(wx+ww/2-1,wy,2,wh);if(!glass)g.fillRect(wx,wy+wh*.52,ww,3);
  g.fillStyle='rgba(231,226,205,.4)';g.fillRect(wx-5,wy+wh,ww+10,4);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(wx-5,wy+wh+4,ww+10,4);
 }
 const map=a.keep(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
 const mat=a.keep(new T.MeshStandardMaterial({map,roughness:p.style==='glass'?.34:.84,metalness:p.style==='glass'?.5:.04,emissive:night?0xffffff:0x000000,emissiveMap:night?map:null,emissiveIntensity:night?.34:0}));
 // Four bays/floors per tile; instance scale determines metre-based repetition.
 mat.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
 #ifdef USE_INSTANCING
 vMapUv *= vec2(length(instanceMatrix[0].xyz)/12.0,length(instanceMatrix[1].xyz)/13.6);
 #ifdef USE_EMISSIVEMAP
 vEmissiveMapUv = vMapUv;
 #endif
 #endif`);};
 mat.customProgramCacheKey=()=> 'city-facade-metres-v1';return mat;
}
export class RoadSurfaces {
 private maps:T.Texture[];status='loading';
 constructor(){let failed=false;
  const manager=new T.LoadingManager(()=>{this.status=failed?'fallback':'ready';});manager.onError=()=>{failed=true;this.status='fallback';};const monitored=new T.TextureLoader(manager);
  this.maps=['Diffuse','nor_gl','Rough'].map(key=>monitored.load('/environment/asphalt-'+key+'.jpg',undefined,undefined,()=>{failed=true;this.status='fallback';}));this.maps.forEach(map=>{map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,1.35);map.anisotropy=8;});this.maps[0].colorSpace=T.SRGBColorSpace;
 }
 material(wet:boolean){return new T.MeshStandardMaterial({polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:this.maps[0],normalMap:this.maps[1],roughnessMap:this.maps[2],normalScale:new T.Vector2(.22,.22),color:wet?0x888e94:0xaaaaaa,roughness:wet?.28:.96,metalness:wet?.1:.02,envMapIntensity:wet?.65:.3});}
}
