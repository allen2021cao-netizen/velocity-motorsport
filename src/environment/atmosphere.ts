import * as T from 'three';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import type {CityProfile} from './profiles';
export class Atmosphere {
 private cache=new Map<string,Promise<{sky:T.DataTexture;environment:T.Texture}>>();private version=0;private current='';
 status='loading';
 constructor(private renderer:T.WebGLRenderer,private scene:T.Scene,private sun:T.DirectionalLight,private ambient:T.AmbientLight,private hemi:T.HemisphereLight){}
 async set(profile:CityProfile,raining:boolean){
  const version=++this.version;const night=profile.sky==='night';const key=raining?'overcast':night?'sunset':profile.sky;this.current=key;this.status='loading';
  this.scene.background=new T.Color(night?0x17263b:profile.fog);this.scene.fog=new T.Fog(profile.fog,night?220:320,night?1450:1850);
  this.ambient.color.set(night?0x829abc:0xcbd9e1);this.ambient.intensity=night?.5:.28;
  this.hemi.color.set(night?0x849ed0:0xc0d8eb);this.hemi.groundColor.set(night?0x26212b:0x80776a);this.hemi.intensity=night?.65:1.05;
  this.sun.color.set(profile.sky==='sunset'?0xffd1a2:night?0x9dbbdf:0xfff3dc);this.sun.intensity=night?.55:raining?.7:profile.sky==='overcast'?1:2.6;
  const angle=profile.rotation;this.sun.userData.offset=new T.Vector3(Math.sin(angle)*45,profile.sky==='sunset'?26:60,Math.cos(angle)*45);
  if(!this.cache.has(key))this.cache.set(key,new RGBELoader().loadAsync('/environment/'+key+'.hdr').then(sky=>{
   sky.mapping=T.EquirectangularReflectionMapping;const pmrem=new T.PMREMGenerator(this.renderer);const environment=pmrem.fromEquirectangular(sky).texture;pmrem.dispose();return{sky,environment};
  }).catch(error=>{this.cache.delete(key);throw error;}));
  try{const loaded=await this.cache.get(key)!;if(version!==this.version)return;
   this.scene.background=loaded.sky;this.scene.backgroundIntensity=night?.025:raining?.55:profile.sky==='sunset'?.65:.85;
   this.scene.backgroundBlurriness=0;this.scene.backgroundRotation.y=profile.rotation;
   this.scene.environment=loaded.environment;this.scene.environmentIntensity=night?.15:raining?.65:.85;this.scene.environmentRotation.y=profile.rotation;
   this.status='ready';
  }catch(error){if(version===this.version){this.status='fallback';console.warn('Sky asset unavailable; retaining procedural atmosphere',error);}}
 }
 snapshot(){return{asset:this.current,status:this.status,cached:this.cache.size};}
}
