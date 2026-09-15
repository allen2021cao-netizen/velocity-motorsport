import {addWinterFuji} from './fuji-mountain';
import * as T from 'three';
import {Architecture} from './geometry';
/** Authored landmark silhouettes, surrounding the map-derived racing layouts. */
export function japaneseLandmarks(a:Architecture,bounds:T.Box3,key:string,height:(x:number,z:number)=>number|null,rock:T.MeshStandardMaterial){
 const center=bounds.getCenter(new T.Vector3());
 if(key==='fuji'){addWinterFuji(a,center,rock);
 }else{
  // Suzuka's mountains lie to the west; the eastern horizon remains open.
  const ridge=a.keep(new T.PlaneGeometry(5000,16000,40,110));ridge.rotateX(-Math.PI/2);const rp=ridge.attributes.position;
  for(let i=0;i<rp.count;i++){const x=rp.getX(i),z=rp.getZ(i),profile=Math.max(0,1-Math.abs(x)/2500);rp.setY(i,-100+profile*(430+120*Math.sin(z*.0017)+75*Math.sin(z*.004)));}
  ridge.computeVertexNormals();const hills=new T.Mesh(ridge,a.material(0x6a827e));hills.position.set(bounds.min.x-4200,0,center.z);hills.name='suzuka-western-hills';a.root.add(hills);
  const x=42,z=-101,y=(height(x,z)??bounds.min.y)+27,steel=a.material(0xe1e6e8,.35),red=a.material(0xc94339),glass=a.material(0x466779,.4);
  const ring=a.shape('suzuka-wheel',()=>new T.TorusGeometry(24,.45,8,80));a.put(ring,steel,x,y,z);
  for(const side of [-1,1])a.beam(steel,new T.Vector3(x+side*14,y-26,z),new T.Vector3(x,y,z),.7);
  for(let i=0;i<24;i++){const t=i/24*Math.PI*2,px=x+Math.cos(t)*24,py=y+Math.sin(t)*24;a.beam(steel,new T.Vector3(x,y,z),new T.Vector3(px,py,z),.16);a.box(i%2?red:glass,px,py-1.2,z,2.4,2.6,2.3);}
 }
}
