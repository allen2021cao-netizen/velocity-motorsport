import * as T from 'three';
import {Architecture} from '../environment/geometry';
export function constrainRoadEdge(pos:{x:number;z:number},center:{x:number;z:number},normal:{x:number;z:number},limit:number){
 const lateral=(pos.x-center.x)*normal.x+(pos.z-center.z)*normal.z;
 const correction=lateral-T.MathUtils.clamp(lateral,-limit,limit);
 pos.x-=normal.x*correction;pos.z-=normal.z*correction;return correction;
}
/** Swept cross sections give every face real thickness and follow road elevation. */
export function barrierSection(points:T.Vector3[],normals:T.Vector3[],width:number,section:number[][],closed=true){
 const p:number[]=[],uv:number[]=[],indices:number[]=[];
 for(const side of [-1,1]){
  const base=p.length/3;
  const segments=closed?points.length:points.length-1;
  for(let i=0;i<=segments;i++){const q=points[i%points.length],n=normals[i%points.length];
   for(const [off,h]of section){p.push(q.x+n.x*side*(width+off),q.y+h,q.z+n.z*side*(width+off));uv.push(i/3,h);}
   const count=section.length;
   if(i<segments)for(let k=0;k<count-1;k++){const j=base+i*count+k;indices.push(j,j+count,j+1,j+1,j+count,j+count+1);}
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export const CONCRETE_SECTION=[[.15,-.3],[.15,.12],[.30,.32],[.43,.54],[.77,.54],[.90,.12],[.90,-.3]];
export function raisedRoadEdges(points:T.Vector3[],normals:T.Vector3[],width:number,closed=true){return barrierSection(points,normals,width,CONCRETE_SECTION,closed);}

export function detailedRoadProtection(a:Architecture,points:T.Vector3[],normals:T.Vector3[],width:number,closed=true){
 const concrete=a.material(0x949c98,0,.94),steel=a.material(0x9caeb7,.7,.36),posts=a.material(0x687c87,.65,.48),dark=a.material(0x414b4d,.25,.8),reflector=a.material(0xd5ddc9,.1,.35),amber=a.material(0xdb963c,.2,.4);
 const add=(name:string,geometry:T.BufferGeometry,material:T.MeshStandardMaterial)=>{material.side=T.DoubleSide;const mesh=new T.Mesh(a.keep(geometry),material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;a.root.add(mesh);};
 add('raised-road-protection',raisedRoadEdges(points,normals,width,closed),concrete);
 // Two folded steel beams: ridges, recessed web and a closed rear face.
 for(const h of [.73,1.07]){
  const section=[[.40,h-.14],[.24,h-.10],[.34,h],[.24,h+.10],[.40,h+.14],[.46,h+.14],[.46,h-.14],[.40,h-.14]];
  add('corrugated-steel-guardrail',barrierSection(points,normals,width,section,closed),steel);
 }
 let distance=0,next=0,count=0;
 for(let i=0;i<points.length;i++){
  if(i)distance+=points[i].distanceTo(points[i-1]);if(distance<next)continue;next=distance+3.5;
  const p=points[i],n=normals[i];
  for(const side of [-1,1])a.at(p.x+n.x*side*(width+.62),p.y,p.z+n.z*side*(width+.62),Math.atan2(n.x*side,n.z*side),1,()=>{
   // Local z points away from the racing surface.
   a.box(posts,0,.77,0,.12,1.02,.13);a.box(posts,0,.77,.065,.22,1.02,.045);
   a.box(steel,0,.57,0,.38,.07,.28);
   for(const x of [-.12,.12])a.box(dark,x,.615,.03,.045,.035,.045,false);
   for(const y of [.73,1.07]){a.box(steel,0,y,-.12,.32,.25,.04);a.box(dark,0,y,-.39,.065,.065,.035,false);}
   a.box(dark,0,.24,-.32,.018,.42,.012,false);
   if(count%3===0){a.box(posts,0,1.25,0,.16,.28,.06);a.box(side<0?reflector:amber,0,1.28,-.04,.11,.13,.025,false);}
  });count++;
 }
 return{barrierSupports:count*2};
}
