import * as T from 'three';
import {Architecture} from './geometry';
import {seeded} from './profiles';
/** Individual photographed leaves replace opaque ellipsoid canopies. */
function crown(count:number){
 const random=seeded(793),p:number[]=[],uv:number[]=[],index:number[]=[];
 for(let i=0;i<count;i++){
  const angle=random()*6.28,r=Math.sqrt(random()),x=Math.cos(angle)*r,z=Math.sin(angle)*r,y=(random()-.5)*1.3*Math.sqrt(1-r*r)+Math.sin(angle*3)*.12,yaw=random()*6.28,tilt=random()*.9-.45,w=.13+random()*.05,h=.25+random()*.13,b=p.length/3;
  for(const [dx,dy]of [[-w,0],[w,0],[-w,h],[w,h]])p.push(x+Math.cos(yaw)*dx,y+dy*Math.cos(tilt),z+Math.sin(yaw)*dx+dy*Math.sin(tilt));
  uv.push(.01,.5,.145,.5,.01,.995,.145,.995);index.push(b,b+1,b+2,b+2,b+1,b+3);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
export function foliageBatches(a:Architecture,coastal:boolean){
 const loader=new T.TextureLoader(),map=a.keep(loader.load('/environment/alpine/coastal-leaves.png'));map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const alpha=a.keep(loader.load('/environment/alpine/coastal-leaves-alpha.png'));
 const leaf=a.keep(new T.MeshStandardMaterial({map,alphaMap:alpha,alphaTest:.3,alphaToCoverage:true,side:T.DoubleSide,roughness:.9,color:coastal?0x9fae91:0xa3a887}));
 const levels=[a.keep(crown(480)),a.keep(crown(240)),a.keep(crown(120))],cells=new Map<string,T.Matrix4[]>();
 return{add(x:number,y:number,z:number,r:number,yaw:number){const key=Math.floor(x/180)+':'+Math.floor(z/180),list=cells.get(key)||[];list.push(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw),new T.Vector3(r*1.45,r,r*1.2)));cells.set(key,list);},finish(){for(const matrices of cells.values()){const mesh=new T.InstancedMesh(levels[0],leaf,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.environmentLods=levels;a.root.add(mesh);a.resources.push(mesh);}return cells.size;}};
}

