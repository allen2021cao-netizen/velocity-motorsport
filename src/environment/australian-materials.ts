import * as T from 'three';
/** Blend differently scaled, rotated samples to suppress obvious field-sized tiling. */
export function naturalMeadow(material:T.MeshStandardMaterial,coastal:boolean,rock:T.Texture|null){
 material.color.setHex(coastal?0x9fae75:0xb2a276);
 material.onBeforeCompile=s=>{
  s.uniforms.coastRock={value:rock||material.map};
  s.vertexShader='varying vec3 meadowWorld;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nmeadowWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec3 meadowWorld;uniform sampler2D coastRock;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 p=meadowWorld.xz;vec2 rotated=mat2(.8,-.6,.6,.8)*p;
   float meadowVariation=.5+.25*sin(p.x*.007+sin(p.y*.003)*3.)+.25*sin(p.y*.011+p.x*.002);
   vec3 small=texture2D(map,p/19.).rgb;
   vec3 broad=mix(texture2D(map,rotated/73.+.31).rgb,texture2D(map,p/157.+.67).rgb,.5);
   vec3 turf=mix(small,broad,.65)*mix(vec3(.76,.82,.62),vec3(1.06,1.,.84),meadowVariation);
   vec3 shoreRock=texture2D(coastRock,rotated/28.).rgb*vec3(1.12,1.02,.8);
   turf=mix(turf,shoreRock,${coastal?'1.':'0.'}*(1.-smoothstep(-4.,15.,meadowWorld.y)));
   diffuseColor.rgb*=turf;
  `);
 };
 material.customProgramCacheKey=()=>coastal?'coastal-meadow-v2':'bathurst-meadow-v2';
}
