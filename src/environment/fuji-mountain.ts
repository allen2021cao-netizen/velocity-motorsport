import * as T from 'three';
import {Architecture} from './geometry';
/** Art-directed winter Fuji: radial sampling preserves the summit and erosion fans. */
export function fujiHeight(radius:number,angle:number){
 const flank=Math.max(0,1-radius/5900);
 const base=2960*Math.pow(flank,1.65);
 const ravines=(Math.sin(angle*23+Math.sin(angle*5)*1.7+radius*.0007)*.55+Math.sin(angle*41-radius*.001)*.25+Math.sin(angle*67)*.2);
 const relief=ravines*58*Math.sin(Math.min(1,radius/5900)*Math.PI)*T.MathUtils.smoothstep(radius,180,800);
 const crater=radius<245?170*Math.pow(1-radius/245,1.3):0;
 return base+relief-crater-160;
}
export function fujiGeometry(){
 const p:number[]=[],uv:number[]=[],indices:number[]=[],rings=144,sectors=256;
 for(let j=0;j<=rings;j++)for(let i=0;i<=sectors;i++){
  const r=5900*Math.pow(j/rings,1.25),a=i/sectors*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;
  p.push(x,fujiHeight(r,a),z);uv.push(x/260,z/260);
  if(j<rings&&i<sectors){const k=j*(sectors+1)+i;indices.push(k,k+1,k+sectors+1,k+1,k+sectors+2,k+sectors+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function addWinterFuji(a:Architecture,center:T.Vector3,rock:T.MeshStandardMaterial){
 const loader=new T.TextureLoader(),snow=a.keep(loader.load('/environment/alpine/snow-diff.jpg')),normal=a.keep(loader.load('/environment/alpine/snow-nor_gl.jpg'));
 snow.colorSpace=T.SRGBColorSpace;for(const t of [snow,normal]){t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;}
 const mat=a.keep(new T.MeshStandardMaterial({color:0xffffff,map:rock.map,normalMap:normal,normalScale:new T.Vector2(.3,.3),roughness:.87,side:T.DoubleSide}));
 mat.onBeforeCompile=s=>{
  s.uniforms.fujiSnow={value:snow};
  s.vertexShader='varying vec3 fujiLocal;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfujiLocal=position;');
  s.fragmentShader='varying vec3 fujiLocal;uniform sampler2D fujiSnow;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   float radius=length(fujiLocal.xz),angle=atan(fujiLocal.z,fujiLocal.x);
   float channels=.5+.26*sin(angle*23.+sin(angle*5.)*1.7+radius*.0007)+.16*sin(angle*41.-radius*.001)+.08*sin(angle*67.);
   float smallGullies=sin(angle*11.+sin(radius*.003))*75.+sin(fujiLocal.x*.014)*sin(fujiLocal.z*.012)*38.;
   float snowElevation=fujiLocal.y+channels*350.+smallGullies;
   float cover=smoothstep(760.,1250.,snowElevation);
   vec3 snowGrain=texture2D(fujiSnow,fujiLocal.xz/135.).rgb;
   vec3 ice=mix(vec3(.72,.80,.89),vec3(.98,.985,1.),.65+.35*snowGrain.r);
   vec3 stone=texture2D(map,fujiLocal.xz/230.).rgb*vec3(.48,.52,.55);
   // Exposed ribs taper out toward the broad, wind-packed summit snowfield.
   float rib=(1.-smoothstep(.05,.22,channels))*(1.-smoothstep(1750.,2380.,fujiLocal.y))*.5;
   diffuseColor.rgb*=mix(stone,ice,cover*(1.-rib));
  `);
 };mat.customProgramCacheKey=()=>'fuji-winter-ravines-v2';
 const mesh=new T.Mesh(a.keep(fujiGeometry()),mat);mesh.name='mount-fuji';mesh.position.set(center.x-4800,0,center.z-4800);mesh.receiveShadow=true;a.root.add(mesh);
}
