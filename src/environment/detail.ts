import {BufferGeometry,InstancedMesh,Object3D,Vector3} from 'three';
/** Small spatial batches allow frustum culling and distance detail without removing scenery. */
export class EnvironmentDetail {
 private meshes:{mesh:InstancedMesh;levels:BufferGeometry[];level:number}[]=[];
 private quality='balanced';
 register(root:Object3D){this.meshes=[];root.traverse(node=>{if(node.userData.environmentLods)this.meshes.push({mesh:node as InstancedMesh,levels:node.userData.environmentLods,level:0});});}
 setQuality(quality:string){this.quality=quality;}
 update(focus:Vector3,overview=false){
  for(const item of this.meshes){
   const sphere=item.mesh.boundingSphere!;
   const distance=Math.max(0,focus.distanceTo(sphere.center)-sphere.radius);
   let level=item.level;
   if(overview||this.quality==='high')level=0;
   else{
    if(distance>550)level=2;
    else if(distance<480&&level===2)level=1;
    if(level<2){if(distance>260)level=1;else if(distance<210)level=0;}
    if(this.quality==='low')level=Math.max(1,level);
   }
   if(level!==item.level){item.mesh.geometry=item.levels[level];item.level=level;}
  }
 }
 snapshot(){return{batches:this.meshes.length,levels:[0,1,2].map(level=>this.meshes.filter(m=>m.level===level).length)};}
}
