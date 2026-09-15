import * as T from 'three';
import {Architecture} from './geometry';
import {seeded} from './profiles';
import {landNoise} from './alpine-nature';
import {foliageBatches} from './australian-foliage';
import {coastalOcean} from './coastal-ocean';
export const coastOffset=(x:number)=>Math.sin(x*.003)*40+Math.sin(x*.008)*12;

export function australianNature(a:Architecture,bounds:T.Box3,points:T.Vector3[],width:number,height:(x:number,z:number)=>number|null,coastal:boolean){
 const rand=seeded(coastal?4445:6213),bark=a.material(0xaaa18c),leaves=[a.material(0x657955),a.material(0x7c885e),a.material(0x526e5a)];
 const foliage=foliageBatches(a,coastal);let trees=0;const size=bounds.getSize(new T.Vector3());
 for(let i=0;i<(coastal?2400:5800);i++){
  const x=bounds.min.x-400+rand()*(size.x+800),z=bounds.min.z-400+rand()*(size.z+800),y=height(x,z);
  if(y===null||y<0||coastal&&z>bounds.max.z+40||landNoise(x*.006,z*.006)<.35)continue;
  if(points.some((p,j)=>j%3===0&&Math.hypot(p.x-x,p.z-z)<width+22))continue;
  const h=(coastal?5:8)+rand()*9,r=h*.3,leaf=leaves[i%3];
  a.cylinder(bark,x,y+h*.45,z,.22,h*.9,.55,6);
  for(let k=0;k<3;k++){const angle=k*2.1+rand(),dx=Math.sin(angle)*r*.65,dz=Math.cos(angle)*r*.65;
   a.beam(bark,new T.Vector3(x,y+h*.5,z),new T.Vector3(x+dx,y+h*.88,z+dz),.09);
   
  }foliage.add(x,y+h*.85,z,r,rand()*6.28);trees++;
 }
 const forestCells=foliage.finish();const update=coastal?coastalOcean(a,bounds):()=>{};
 return{trees,forestCells,update};
}