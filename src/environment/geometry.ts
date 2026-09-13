import * as T from 'three';
/** Collect matrices, then issue instanced draws. No per-window scene objects survive construction. */
export class Architecture {
 private base=new T.Matrix4();
 private bins=new Map<string,{geometry:T.BufferGeometry;material:T.Material;matrices:T.Matrix4[];shadow:boolean}>();
 private shapes=new Map<string,T.BufferGeometry>();
 constructor(public root:T.Group,public resources:{dispose:()=>void}[]){}
 keep<A extends {dispose:()=>void}>(asset:A){this.resources.push(asset);return asset;}
 material(color:number,metalness=0,roughness=.8,emissive=0,intensity=0){return this.keep(new T.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:intensity}));}
 shape(key:string,make:()=>T.BufferGeometry){if(!this.shapes.has(key))this.shapes.set(key,this.keep(make()));return this.shapes.get(key)!;}
 at(x:number,y:number,z:number,yaw:number,scale:number,fn:()=>void){const old=this.base;this.base=old.clone().multiply(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw),new T.Vector3(scale,scale,scale)));fn();this.base=old;}
 put(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1,q=new T.Quaternion(),shadow=true){
  const key=geometry.uuid+material.uuid+shadow;let bin=this.bins.get(key);if(!bin){bin={geometry,material,matrices:[],shadow};this.bins.set(key,bin);}
  bin.matrices.push(this.base.clone().multiply(new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(sx,sy,sz))));
 }
 box(mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number,shadow=true){this.put(this.shape('box',()=>new T.BoxGeometry(1,1,1)),mat,x,y,z,w,h,d,undefined,shadow);}
 cylinder(mat:T.Material,x:number,y:number,z:number,r:number,h:number,top=1,sides=16){this.put(this.shape('cyl'+top+':'+sides,()=>new T.CylinderGeometry(top,1,1,sides)),mat,x,y,z,r,h,r);}
 sphere(mat:T.Material,x:number,y:number,z:number,r:number,sy=1){this.put(this.shape('sphere',()=>new T.SphereGeometry(1,24,16)),mat,x,y,z,r,r*sy,r);}
 beam(mat:T.Material,a:T.Vector3,b:T.Vector3,r:number){const v=b.clone().sub(a),p=a.clone().add(b).multiplyScalar(.5);this.put(this.shape('beam',()=>new T.CylinderGeometry(1,1,1,6)),mat,p.x,p.y,p.z,r,v.length(),r,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()));}
 plane(mat:T.Material,x:number,y:number,z:number,w:number,h:number,rotation=0){this.put(this.shape('plane',()=>new T.PlaneGeometry(1,1)),mat,x,y,z,w,h,1,new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),rotation),false);}
 finish(){let count=0;for(const bin of this.bins.values()){
   const mesh=new T.InstancedMesh(bin.geometry,bin.material,bin.matrices.length);bin.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=bin.shadow;mesh.receiveShadow=true;mesh.computeBoundingSphere();this.root.add(mesh);this.resources.push(mesh);count+=bin.matrices.length;
  }return{instances:count,batches:this.bins.size};}
}
