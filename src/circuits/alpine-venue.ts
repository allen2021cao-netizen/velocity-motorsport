import {australianDestination} from '../environment/australian-destination';
import {japaneseLandscape} from '../environment/japanese-landscape';
import {japaneseTour} from '../environment/japanese-tour';
import {japaneseLandmarks} from '../environment/japanese-landmarks';
import {alpineMassif,natureMaterials,addAlpineForest,landNoise} from '../environment/alpine-nature';
import * as T from 'three';
import {createAlpineTour} from '../environment/alpine-tour';
import {australianNature,coastOffset} from '../environment/australian-nature';
import {naturalMeadow} from '../environment/australian-materials';
import {detailedRoadProtection} from './road-protection';
import {Architecture} from '../environment/geometry';
import {lettering} from '../environment/materials';
import {seeded} from '../environment/profiles';
/** Original scenery around map-derived roads; elevations are an artistic approximation. */
export function buildAlpineVenue(world:T.Group,points:T.Vector3[],normals:T.Vector3[],key:string,resources:any[],length:number,width:number){
 const a=new Architecture(world,resources),open=key==='arosa',coastal=key==='phillip',australian=coastal||key==='bathurst',rand=seeded(open?8203:4318);
 const japanese=key==='suzuka'||key==='fuji';
 const materials=natureMaterials(a,open);
 const grass=materials.terrain,white=a.material(0xc6c3b7),red=a.material(0xb73d32),steel=a.material(0x747f85,.4),wood=a.material(0x78533b),glass=a.material(0x7194a0,.2),dark=a.material(0x323e42);
 if(australian||japanese)naturalMeadow(grass,coastal,materials.rock.map);
 if(japanese)grass.color.setHex(0xa2b58b);
 const bounds=new T.Box3().setFromPoints(points),focus=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 if(key==='bathurst'||japanese){const g=a.keep(new T.PlaneGeometry(30000,30000));g.rotateX(-Math.PI/2);const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/80,p.getZ(i)/80);const colors=new Float32Array(p.count*3).fill(.85);g.setAttribute('color',new T.BufferAttribute(colors,3));const apron=new T.Mesh(g,grass);apron.position.set(focus.x,-130,focus.z);world.add(apron);}
 const at=(i:number,offset:number,fn:()=>void)=>{const p=points[i],n=normals[i];a.at(p.x+n.x*offset,p.y,p.z+n.z*offset,Math.atan2(n.x,n.z),1,fn);};
 // Continuous terrain, carved below nearby road branches. Unlike wide offset
 // ribbons, this grid cannot fold across hairpins or leave holes between bends.
 const vertices:number[]=[],indices:number[]=[],roadClearance:number[]=[],nx=japanese?190:150,nz=japanese?220:190,pad=japanese?1700:1000;
 for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){
  const px=bounds.min.x-pad+x/nx*(size.x+pad*2),pz=bounds.min.z-pad+z/nz*(size.z+pad*2);
  let d=Infinity,y=0;
  for(let i=0;i<points.length-1;i+=2){const p=points[i],q=points[Math.min(points.length-1,i+2)],dx=q.x-p.x,dz=q.z-p.z,t=T.MathUtils.clamp(((px-p.x)*dx+(pz-p.z)*dz)/(dx*dx+dz*dz),0,1),dist=Math.hypot(px-p.x-t*dx,pz-p.z-t*dz);if(dist<d){d=dist;y=T.MathUtils.lerp(p.y,q.y,t);}}
  let h=y-5-Math.max(0,d-width)*.12+Math.max(0,Math.min(1,(d-70)/200))*(Math.sin(px*.003)*Math.cos(pz*.003)*28);
  if(japanese){const blend=T.MathUtils.smoothstep(d,25,450),hill=(key==='fuji'?48:18)*(landNoise(px*.0012,pz*.0012)-.4);h=y-1.1+blend*hill;}
  if(coastal&&d>width+45){h=Math.max(3,h);const shore=bounds.max.z+70+coastOffset(px);if(pz>shore)h=Math.min(h,3-(pz-shore)*.15);}
  vertices.push(px,h,pz);
  roadClearance.push(d<width+35?h:Infinity);
 }
 // Blend nearest-road height transitions into hills, retaining the carved road
 // clearance. This removes artificial terrace cliffs between adjacent branches.
 for(let pass=0;pass<7;pass++){const before=vertices.slice();for(let z=1;z<nz;z++)for(let x=1;x<nx;x++){const i=z*(nx+1)+x;vertices[i*3+1]=Math.min(roadClearance[i],before[i*3+1]*.4+(before[(i-1)*3+1]+before[(i+1)*3+1]+before[(i-nx-1)*3+1]+before[(i+nx+1)*3+1])*.15);}}
 // Carve every vertex of cells crossed by the driving corridor. Carving only
 // grid sample positions allows a large triangle to cover the road between them.
 const cellX=(size.x+pad*2)/nx,cellZ=(size.z+pad*2)/nz,margin=width+6;
 for(const p of points){const x0=Math.max(0,Math.floor((p.x-margin-bounds.min.x+pad)/cellX)),x1=Math.min(nx,Math.ceil((p.x+margin-bounds.min.x+pad)/cellX)),z0=Math.max(0,Math.floor((p.z-margin-bounds.min.z+pad)/cellZ)),z1=Math.min(nz,Math.ceil((p.z+margin-bounds.min.z+pad)/cellZ));for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const i=(z*(nx+1)+x)*3+1;vertices[i]=Math.min(vertices[i],p.y-1);}}
 for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const q=z*(nx+1)+x,r=q+nx+1;indices.push(q,r,q+1,q+1,r,r+1);}
 const geo=a.keep(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
 const terrainUv:number[]=[],colors:number[]=[];for(let i=0;i<vertices.length;i+=3){const x=vertices[i],z=vertices[i+2],shade=.72+landNoise(x*.015,z*.015)*.28;terrainUv.push(x/24,z/24);const forestTint=japanese?T.MathUtils.smoothstep(landNoise(x*.003,z*.003),.38,.62)*.48:0;colors.push(shade*(.86-forestTint),shade*(1-forestTint*.75),shade*(.82-forestTint));}geo.setAttribute('uv',new T.Float32BufferAttribute(terrainUv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));grass.side=T.DoubleSide;const terrain=new T.Mesh(geo,grass);terrain.name='alpine-terrain';terrain.receiveShadow=true;world.add(terrain);
 
 if(!coastal&&!japanese){const mountains=new T.Mesh(a.keep(alpineMassif(bounds,open)),materials.mountain);if(australian||japanese){mountains.scale.y=.24;mountains.position.y=10;}mountains.name='alpine-massif';world.add(mountains);}
 const height=(x:number,z:number)=>{const fx=(x-bounds.min.x+pad)/cellX,fz=(z-bounds.min.z+pad)/cellZ,ix=Math.floor(fx),iz=Math.floor(fz);if(ix<0||iz<0||ix>=nx||iz>=nz)return null;const tx=fx-ix,tz=fz-iz,q=iz*(nx+1)+ix,h00=vertices[q*3+1],h10=vertices[(q+1)*3+1],h01=vertices[(q+nx+1)*3+1],h11=vertices[(q+nx+2)*3+1];return tx+tz<=1?h00+(h10-h00)*tx+(h01-h00)*tz:h11+(h01-h11)*(1-tx)+(h10-h11)*(1-tz);};
 if(japanese)japaneseLandmarks(a,bounds,key,height,materials.rock);
 const forest=japanese?japaneseLandscape(a,bounds,points,width,height,key,materials.leaf):australian?australianNature(a,bounds,points,width,height,coastal):addAlpineForest(a,bounds,points,width,height,materials.leaf,open);
 detailedRoadProtection(a,points,normals,width,!open);
 if(coastal){const stone=a.shape('coastal-rock',()=>new T.IcosahedronGeometry(1,1));for(let i=0;i<170;i++){const x=bounds.min.x-700+rand()*(size.x+1400),z=bounds.max.z+145+coastOffset(x)+rand()*75,h=height(x,z);if(h===null)continue;const r=2+rand()*7;a.put(stone,materials.rock,x,Math.max(-14,h),z,r,r*.55,r*.75,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rand()*6),true);}}
 const nearest=(x:number,z:number,skip:number)=>{for(let j=0;j<points.length;j+=4){if(Math.abs(j-skip)<5)continue;if(Math.hypot(points[j].x-x,points[j].z-z)<width+9)return false;}return true;};
 let buildings=0;
 for(let m=0;m<length;m+=18){const i=Math.min(points.length-1,Math.floor(m/length*(points.length-Number(open)))),p=points[i],n=normals[i];
  for(const side of [-1,1]){
   // Reflector posts and visible guard rails on the mountain route.
   // Reflectors are integrated with the detailed steel barrier supports.
   const off=side*(width+8+rand()*35),x=p.x+n.x*off,z=p.z+n.z*off,h=height(x,z);
   if(h!==null&&nearest(x,z,i)&&m%36===0){const r=1+rand()*2.5;a.put(a.shape('natural-boulder',()=>{const g=new T.IcosahedronGeometry(1,1);const v=g.attributes.position;for(let i=0;i<v.count;i++){const k=.8+landNoise(v.getX(i)*7,v.getZ(i)*7)*.4;v.setXYZ(i,v.getX(i)*k,v.getY(i)*k,v.getZ(i)*k);}g.computeVertexNormals();return g;}),materials.rock,x,h+r*.35,z,r,r*.65,r,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rand()*6),true);}

  }
 }
 for(const u of japanese?[]:open?[.015,.18,.32,.79,.9,.95,.98]:[.01,.04,.07,.92,.95,.98]){const i=Math.floor(u*(points.length-1));at(i,-width-24,()=>{a.box(materials.rock,0,-1.5,0,18,7,13);a.box(open?white:dark,0,5,0,18,10,13);a.box(open?wood:white,0,10.5,0,20,1,15);for(const x of [-6,-2,2,6]){a.box(wood,x,6.5,6.58,2.5,3.1,.15,false);a.box(glass,x,6.5,6.69,2.1,2.7,.12,false);a.box(white,x,6.5,6.77,.08,2.7,.05,false);a.box(white,x,6.5,6.78,2.1,.09,.05,false);}if(open){a.box(wood,0,4.7,7.4,19,.3,2.7);for(let x=-9;x<=9;x+=.65)a.box(wood,x,5.3,8.7,.1,1.15,.1,false);a.box(wood,0,5.85,8.7,19,.1,.15);for(const x of [-8,8])a.box(wood,x,1,7.8,.23,7,.23);}if(open){const roof=a.shape('gable-roof',()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-10,0,-8,10,0,-8,-10,4,0,10,4,0,-10,0,8,10,0,8],3));g.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,0,4,2,1,3,5]);g.computeVertexNormals();return g;});a.put(roof,materials.rock,0,11,0);}buildings++;});}
 // Finish gantry, with a separate start/finish on a closed circuit.
 const finish=open?points.length-1:0;
 at(finish,0,()=>{for(const s of [-1,1])a.box(steel,0,3.5,s*(width+1),.4,7,.4);a.box(dark,0,7,0,.5,1.8,width*2+3);const mat=lettering(a,key==='suzuka'?'SUZUKA':key==='fuji'?'FUJI SPEEDWAY':open?'AROSA · FINISH':coastal?'PHILLIP ISLAND':australian?'MOUNT PANORAMA':'RED BULL RING','#1d333d','#ffffff',512);a.at(0,0,0,Math.PI/2,1,()=>a.plane(mat,0,7,.3,width*2+2,1.6));for(let j=0;j<Math.floor(width*2);j++)a.box(j%2?dark:white,0,.025,j-width+.5,2,.04,1,false);});
 const destination=australian?australianDestination(world,resources,key,materials.rock,grass):null;
 const stats=a.finish();return{key,focus,destination,natureTour:destination||(japanese?japaneseTour(points,key):createAlpineTour(points,open,key)),previewRadius:Math.max(size.x,size.z)*.8,buildings,landmark:destination?destination.landmark:key==='fuji'?'富士山 · 雪冠、森林与长直道':key==='suzuka'?'铃鹿 · 八字立交、林地与摩天轮':coastal?'巴斯海峡 · 海岸草坡与高速弯':australian?'全景山 · 桉树林、山顶弯与金色原野':open?'阿罗萨 · 雪峰、针叶林与高山白云':'施皮尔贝格 · 翠绿山谷、森林与阿尔卑斯天际线',...stats,...forest,natureVersion:japanese?3:2};
}
