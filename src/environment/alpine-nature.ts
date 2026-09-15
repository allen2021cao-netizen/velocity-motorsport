import * as T from 'three';
import {Architecture} from './geometry';
import {seeded} from './profiles';

function hash(x:number,z:number){const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v);}
export function landNoise(x:number,z:number){const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b,s=u*u*(3-2*u),t=v*v*(3-2*v);return T.MathUtils.lerp(T.MathUtils.lerp(hash(a,b),hash(a+1,b),s),T.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),s),t);}
function fbm(x:number,z:number){let v=0,w=.5;for(let k=0;k<5;k++){v+=landNoise(x,z)*w;x=x*2.07+11;z=z*2.07-3;w*=.5;}return v;}

/** Continuous ridged annulus outside the full road bounds, with real 3D relief. */
export function alpineMassif(bounds:T.Box3,snowy:boolean){
 const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),vertices:number[]=[],uv:number[]=[],idx:number[]=[],angular=384,radial=56;
 for(let r=0;r<=radial;r++)for(let j=0;j<=angular;j++){
  const theta=j/angular*Math.PI*2,t=r/radial,rx=size.x*.83+850+t*6100,rz=size.z*.83+850+t*6100,x=center.x+Math.cos(theta)*rx,z=center.z+Math.sin(theta)*rz;
  const crest=.5+.2*Math.sin(theta*5+1.2)+.14*Math.sin(theta*11)+.12*Math.cos(theta*17+.7),profile=Math.pow(Math.sin(Math.PI*t),1.35);
  const ridge=1-Math.abs(fbm(x*.0018,z*.0018)*2-1),erosion=fbm(x*.007,z*.007)-.5;
  const h=-260+profile*((snowy?2500:1150)*crest+(snowy?1050:470)*ridge)+erosion*profile*(snowy?390:160);
  vertices.push(x,h,z);uv.push(x/30,z/30);
 }
 for(let r=0;r<radial;r++)for(let j=0;j<angular;j++){const a=r*(angular+1)+j,b=a+angular+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}

export function natureMaterials(a:Architecture,snowy:boolean){
 const loader=new T.TextureLoader(),load=(name:string,color=false)=>{const t=a.keep(loader.load('/environment/alpine/'+name));t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;return t;};
 const rock=load('rock-diff.jpg',true),grass=load('grass-diff.jpg',true),snow=load('snow-diff.jpg',true),rockNormal=load('rock-nor_gl.jpg'),grassNormal=load('grass-nor_gl.jpg');
 const terrain=a.keep(new T.MeshStandardMaterial({map:grass,normalMap:grassNormal,normalScale:new T.Vector2(.7,.7),roughness:.96,color:0xa4ae82,vertexColors:true}));
 const mountain=a.keep(new T.MeshStandardMaterial({map:rock,normalMap:rockNormal,normalScale:new T.Vector2(.85,.85),roughness:.95,side:T.DoubleSide}));
 mountain.onBeforeCompile=shader=>{
  shader.uniforms.alpineGrass={value:grass};shader.uniforms.alpineSnow={value:snow};shader.uniforms.snowLine={value:snowy?1030:2500};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 naturePosition;varying vec3 natureNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nnaturePosition=position;natureNormal=normal;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 naturePosition;varying vec3 natureNormal;uniform sampler2D alpineGrass;uniform sampler2D alpineSnow;uniform float snowLine;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 weights=pow(abs(normalize(natureNormal)),vec3(4.));weights/=max(.001,weights.x+weights.y+weights.z);
   vec3 p=naturePosition;vec3 cliff=texture2D(map,p.zy/42.).rgb*weights.x+texture2D(map,p.xz/42.).rgb*weights.y+texture2D(map,p.xy/42.).rgb*weights.z;
   float macro=.76+.24*sin(p.x*.008+sin(p.z*.003))*sin(p.z*.007);
   float slope=abs(normalize(natureNormal).y);
   vec2 rotated=mat2(.8,-.6,.6,.8)*p.xz;
   vec3 meadow=mix(texture2D(alpineGrass,p.xz/115.).rgb,texture2D(alpineGrass,rotated/237.+.37).rgb,.55)*vec3(.50,.67,.43);
   float grassMix=(1.-smoothstep(450.,1050.,p.y))*smoothstep(.48,.88,slope);
   vec3 base=mix(cliff*vec3(.72,.76,.79)*macro,meadow,grassMix);
   float snowHeight=p.y+90.*sin(p.x*.014)+55.*sin(p.z*.022)+35.*sin((p.x+p.z)*.05);
   float snowMix=smoothstep(snowLine-150.,snowLine+160.,snowHeight)*smoothstep(.28,.67,slope);
   vec3 powder=texture2D(alpineSnow,p.xz/55.).rgb*vec3(.95,.98,1.);
   diffuseColor.rgb*=mix(base,powder,snowMix);
  `);
 };
 mountain.customProgramCacheKey=()=>snowy?'arosa-massif-v1':'styrian-massif-v1';
 const leaf=a.keep(new T.MeshStandardMaterial({map:load('fir-diff.png',true),alphaMap:load('fir-alpha.png'),alphaTest:.14,alphaToCoverage:true,side:T.DoubleSide,roughness:.95,color:0xb1bf98}));
 return{terrain,mountain,leaf,rock:a.keep(new T.MeshStandardMaterial({map:rock,normalMap:rockNormal,normalScale:new T.Vector2(.6,.6),roughness:.98,color:0xa6aaa8}))};
}

/** Layered twig cards form branches in 3D; atlas uses the upper-right fir sprig. */
export function firGeometry(tiers:number,branches:number){
 const p:number[]=[],uv:number[]=[],ids:number[]=[];
 for(let tier=0;tier<tiers;tier++){const t=tier/(tiers-1),y=2+t*14,r=(1-t)*3.3+.25;for(let j=0;j<branches;j++){
  const th=j/branches*Math.PI*2+tier*2.399,c=Math.cos(th),s=Math.sin(th),cx=c*r*.34,cz=s*r*.34,w=r*.85,h=r*1.8,b=p.length/3;
  for(const [dx,dy]of [[-w,0],[w,0],[-w,h],[w,h]])p.push(cx+dx*s,y+dy,cz-dx*c);
  uv.push(.66,.64,.995,.64,.66,.995,.995,.995);ids.push(b,b+1,b+2,b+2,b+1,b+3);
 }}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;
}

export function addAlpineForest(a:Architecture,bounds:T.Box3,road:T.Vector3[],width:number,height:(x:number,z:number)=>number|null,leaf:T.Material,snowy:boolean){
 const random=seeded(snowy?7718:6712),size=bounds.getSize(new T.Vector3()),bark=a.material(0x665344),trunk=a.shape('nature-trunk',()=>new T.CylinderGeometry(.10,.29,16,6));trunk.translate(0,8,0);
 const levels=[a.keep(firGeometry(14,8)),a.keep(firGeometry(10,6)),a.keep(firGeometry(7,4))];
 const cells=new Map<string,T.Matrix4[]>();let trees=0;
 const candidates:{x:number;z:number;near:boolean}[]=[];
 for(let k=0;k<(snowy?11000:9000);k++)candidates.push({x:bounds.min.x-550+random()*(size.x+1100),z:bounds.min.z-550+random()*(size.z+1100),near:false});
 for(let i=1;i<road.length-1;i+=2){const p=road[i],t=road[i+1].clone().sub(road[i-1]);t.y=0;t.normalize();for(const side of [-1,1]){if(random()<(snowy?.12:.48))continue;const off=side*(width+20+random()*65);candidates.push({x:p.x-t.z*off,z:p.z+t.x*off,near:true});}}
 for(const {x,z,near}of candidates){const h=height(x,z);if(h===null)continue;
  const density=landNoise(x*.002,z*.002);if(!near&&density<(snowy?.26:.43))continue;
  let clear=true;for(let j=0;j<road.length;j+=3)if(Math.hypot(x-road[j].x,z-road[j].z)<width+16){clear=false;break;}if(!clear)continue;
  const scale=.7+random()*.9,angle=random()*Math.PI*2,m=new T.Matrix4().compose(new T.Vector3(x,h-.1,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),angle),new T.Vector3(scale,scale,scale));
  const key=Math.floor(x/240)+':'+Math.floor(z/240),list=cells.get(key)||[];list.push(m);cells.set(key,list);trees++;
 }
 for(const matrices of cells.values())for(const [geo,mat,foliage]of [[levels[0],leaf,true],[trunk,bark,false]] as const){const mesh=new T.InstancedMesh(geo,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;if(foliage)mesh.userData.environmentLods=levels;a.root.add(mesh);a.resources.push(mesh);}
 return{trees,forestCells:cells.size};
}


