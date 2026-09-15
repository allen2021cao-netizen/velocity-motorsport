import * as T from 'three';
import {Architecture} from './geometry';

/** World-space moving normal waves, shallow-water colour and breaking surf. */
export function coastalOcean(a:Architecture,bounds:T.Box3){
 const time={value:0},shore=bounds.max.z+170;
 const mat=a.keep(new T.MeshPhysicalMaterial({color:0xffffff,roughness:.24,metalness:.12,clearcoat:.7,clearcoatRoughness:.18}));
 mat.onBeforeCompile=s=>{
  s.uniforms.seaTime=time;s.uniforms.coastZ={value:shore};
  s.vertexShader='varying vec3 seaWorld;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nseaWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec3 seaWorld;uniform float seaTime;uniform float coastZ;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 oceanP=seaWorld.xz;float shoreLine=coastZ+sin(oceanP.x*.003)*40.+sin(oceanP.x*.008)*12.;
   float depth=max(0.,oceanP.y-shoreLine);
   vec3 shallow=vec3(.055,.40,.39),deep=vec3(.012,.10,.19);
   diffuseColor.rgb*=mix(shallow,deep,smoothstep(0.,1400.,depth));
   float waveFront=sin(depth*.17-seaTime*1.15+sin(oceanP.x*.038)*1.8);
   float broken=.55+.45*sin(oceanP.x*.17+sin(oceanP.x*.047)*4.);
   float foam=pow(max(0.,waveFront),8.)*(1.-smoothstep(15.,130.,depth))*smoothstep(0.,6.,depth)*broken;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.87,.83),foam*.85);
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   vec2 wp=seaWorld.xz;
   float nx=sin(wp.x*.043+wp.y*.021+seaTime*.7)*.17+sin(wp.x*.16-wp.y*.09+seaTime*1.6)*.07;
   float nz=cos(wp.y*.052-wp.x*.017+seaTime*.9)*.14+sin(wp.y*.19+seaTime*1.9)*.05;
   normal=normalize(mat3(viewMatrix)*vec3(nx,1.,nz));
  `);
 };
 const geo=a.keep(new T.PlaneGeometry(32000,28000));geo.rotateX(-Math.PI/2);
 const ocean=new T.Mesh(geo,mat);ocean.position.set(bounds.getCenter(new T.Vector3()).x,-12,shore+13700);ocean.name='bass-strait';a.root.add(ocean);
 return(dt:number)=>{time.value=(time.value+Math.min(dt,.05))%10000;};
}
