import * as T from 'three';
import {Architecture} from './geometry';
import {seeded} from './profiles';
import {foliageBatches} from './australian-foliage';
import {firGeometry,landNoise} from './alpine-nature';
type Height=(x:number,z:number)=>number|null;
/** Map-informed land-use regions. Coordinates stay aligned with the north-up road. */
export function japaneseLandscape(a:Architecture,bounds:T.Box3,road:T.Vector3[],width:number,height:Height,key:string,leaf:T.Material){
 const fuji=key==='fuji',rand=seeded(fuji?4563:5807),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 const asphalt=a.material(0x343a3c),concrete=a.material(0xb9bab0),glass=a.material(0x547583,.25),wall=a.material(0xd5d2c6),roof=a.material(0x4c5759),bark=a.material(0x5a5145),mark=a.material(0xd9d8c1);
 const clear=(x:number,z:number,r:number)=>!road.some((p,i)=>i%2===0&&Math.hypot(p.x-x,p.z-z)<width+r);
 const reserved:{x:number;z:number;r:number}[]=[];
 const patch=(x:number,z:number,w:number,d:number,mat:T.Material)=>{
  const y=height(x,z);if(y===null||!clear(x,z,Math.hypot(w,d)/2+8)||reserved.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+Math.hypot(w,d)/2))return false;
  const g=a.keep(new T.PlaneGeometry(w,d,6,6));g.rotateX(-Math.PI/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,(height(x+p.getX(i),z+p.getZ(i))??y)+.09);
  g.computeVertexNormals();const mesh=new T.Mesh(g,mat);mesh.position.set(x,0,z);mesh.receiveShadow=true;a.root.add(mesh);reserved.push({x,z,r:Math.hypot(w,d)/2+5});return true;
 };
 // Paddock garages parallel to the main straight, kept clear of every branch.
 let buildings=0;
 // Run-off aprons follow selected corners and the existing terrain triangles.
 const gravel=a.material(0x9d9b83),apronPositions:number[]=[],apronIndices:number[]=[];
 for(const side of [-1,1])for(let i=1;i<road.length-2;i++){
  const u=i/road.length;if(!((u>.10&&u<.22)||(u>.48&&u<.56)||(u>.69&&u<.78)))continue;
  const p=road[i],q=road[i+1],positions=[];let valid=true;
  for(const j of [i,i+1])for(const d of [width+3,width+27]){const v=road[j],t=road[j+1].clone().sub(road[j-1]).normalize(),n=new T.Vector3(-t.z,0,t.x),x=v.x+n.x*d*side,z=v.z+n.z*d*side,y=height(x,z);if(y===null||!clear(x,z,1))valid=false;positions.push(x,(y??0)+.65,z);}
  if(valid){const b=apronPositions.length/3;apronPositions.push(...positions);apronIndices.push(b,b+2,b+1,b+1,b+2,b+3);}
 }
 const apron=a.keep(new T.BufferGeometry());apron.setAttribute('position',new T.Float32BufferAttribute(apronPositions,3));apron.setIndex(apronIndices);apron.computeVertexNormals();gravel.side=T.DoubleSide;const apronMesh=new T.Mesh(apron,gravel);apronMesh.receiveShadow=true;a.root.add(apronMesh);
 for(let k=0;k<12;k++){
  const i=Math.floor((.975+k*.003)%1*road.length),p=road[i],q=road[(i+1)%road.length],t=q.clone().sub(p).normalize(),nx=-t.z,nz=t.x,x=p.x+nx*55,z=p.z+nz*55,y=height(x,z);
  if(y===null||!clear(x,z,24))continue;
  reserved.push({x,z,r:35});a.at(x,y,z,Math.atan2(t.x,t.z),1,()=>{
   a.box(concrete,0,1,0,28,2,17);a.box(wall,0,4,0,26,6,15);a.box(roof,0,7.4,0,29,.7,18);
   for(let j=-9;j<=9;j+=6){a.box(glass,j,5,-7.55,4.8,2.2,.13);a.box(roof,j,2,-7.6,4.5,3,.15);}
  });buildings++;
 }
 // Paved service areas and parking beside, rather than across, the racing surface.
 for(let k=0;k<18;k++){
  const p=road[Math.floor(k/18*road.length)],x=p.x+(k%2?1:-1)*150,z=p.z+90;
  if(!patch(x,z,90,65,asphalt))continue;
  for(let j=-3;j<=3;j++)for(let row=-1;row<=1;row++){const px=x+j*10,pz=z+row*18,h=height(px,pz)!;a.box(mark,px,h+.14,pz,.18,.04,10,false);if(rand()>.35){a.box(j%2?roof:wall,px+3,h+1,pz,2,1.6,4,false);a.box(glass,px+3,h+1.8,pz,1.8,.5,2,false);}}
 }
 // Suzuka's park plaza and low pavilion roofs sit north of the finish straight.
 if(!fuji){
  for(const [x,z,w,d]of [[90,-220,75,65],[180,-270,70,60],[-35,-210,50,45]]){
   if(!patch(x,z,w,d,concrete))continue;
   const y=height(x,z)!;a.box(wall,x,y+3,z,24,6,16);a.box(roof,x,y+6.5,z,28,1,19);
   for(let j=-2;j<=2;j++)a.box(glass,x+j*4,y+3.8,z+8.1,2.6,2.6,.12,false);buildings++;
  }
 }
 // Suzuka's agricultural/residential mosaic is mainly outside the wooded west loop.
 const fieldMats=[0x829866,0xa3a17a,0x627f54,0xaeb28a].map(c=>a.material(c));
 let fields=0;
 for(let k=0;k<(fuji?24:100);k++){
  const x=center.x+(rand()-.35)*(size.x+1700),z=bounds.max.z-100+rand()*1150,w=65+rand()*90,d=45+rand()*100;
  if(!patch(x,z,w,d,fieldMats[k%4]))continue;fields++;
  for(let j=-3;j<=3;j++){const xx=x+j*w/8;for(let n=-3;n<=3;n++){const zz=z+n*d/8,h=height(xx,zz);if(h!==null)a.box(fieldMats[(k+1)%4],xx,h+.15,zz,.35,.15,d/8,false);}}
 }
 for(let k=0;k<(fuji?50:170);k++){
  const x=bounds.max.x+100+rand()*900,z=bounds.min.z+rand()*(size.z+900),y=height(x,z);if(y===null||!clear(x,z,30)||reserved.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+15))continue;
  reserved.push({x,z,r:18});const w=7+rand()*7,d=7+rand()*9,h=4+rand()*4;
  a.box(wall,x,y+h/2,z,w,h,d);a.box(roof,x,y+h+.35,z,w+1,.7,d+1);
  for(let j=-1;j<=1;j++)a.box(glass,x+j*w*.28,y+h*.65,z+d*.5+.03,w*.18,1.3,.1,false);buildings++;
 }
 const broadleaf=foliageBatches(a,false),levels=[a.keep(firGeometry(10,6)),a.keep(firGeometry(7,4)),a.keep(firGeometry(5,3))],cells=new Map<string,T.Matrix4[]>();let trees=0;
 // Dark cedar-like silhouettes intermingle with broadleaf crowns and open turf.
 for(let i=0;i<(fuji?20000:18000);i++){
  const pad=i%3===0?1100:250,x=bounds.min.x-pad+rand()*(size.x+pad*2),z=bounds.min.z-pad+rand()*(size.z+pad*2),y=height(x,z);
  if(y===null||!clear(x,z,24)||reserved.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+7))continue;
  const noise=landNoise(x*.003,z*.003);if(noise<(fuji?.22:.40)||!fuji&&x>center.x+400&&rand()<.8)continue;
  const h=10+rand()*13,r=5+rand()*5;
  a.cylinder(bark,x,y+h*.4,z,.16+rand()*.14,h*.8,.5,6);
  if(rand()<(fuji?.72:.50)){const cell=Math.floor(x/200)+':'+Math.floor(z/200),list=cells.get(cell)||[];list.push(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rand()*6.28),new T.Vector3(r/3.5,h/17,r/3.5)));cells.set(cell,list);}
  else broadleaf.add(x,y+h*.76,z,r,rand()*6.28);trees++;
 }
 for(const matrices of cells.values()){const m=new T.InstancedMesh(levels[0],leaf,matrices.length);matrices.forEach((v,i)=>m.setMatrixAt(i,v));m.computeBoundingSphere();m.castShadow=true;m.receiveShadow=true;m.userData.environmentLods=levels;a.root.add(m);a.resources.push(m);}
 return{trees,forestCells:cells.size+broadleaf.finish(),localBuildings:buildings,fields,update:()=>{}};
}
