import {BufferGeometry,InstancedMesh,Object3D,Vector3} from 'three';
/** Small spatial batches allow frustum culling and distance detail without removing scenery. */
export class EnvironmentDetail {
 private meshes:{mesh:InstancedMesh;levels:BufferGeometry[];level:number;center:Vector3;radius:number}[]=[];
 private quality='balanced';
 register(root:Object3D){this.meshes=[];root.updateWorldMatrix(true,true);root.traverse(node=>{if(node.userData.environmentLods)this.meshes.push({mesh:node as InstancedMesh,levels:node.userData.environmentLods,level:0,center:(node as InstancedMesh).boundingSphere!.center.clone().applyMatrix4(node.matrixWorld),radius:(node as InstancedMesh).boundingSphere!.radius*node.matrixWorld.getMaxScaleOnAxis()});});}
 setQuality(quality:string){this.quality=quality;}
 update(focus:Vector3,overview=false){
  for(const item of this.meshes){
   const distance=Math.max(0,focus.distanceTo(item.center)-item.radius);
   let level=item.level;
   if(overview)level=0;
   else if(this.quality==='high'){
    // Highest quality still reduces invisible leaf detail in distant forests.
    if(distance>1000)level=2;
    else if(distance<880&&level===2)level=1;
    if(level<2){if(distance>500)level=1;else if(distance<430)level=0;}
   }
   else{
    if(distance>350)level=2;
    else if(distance<290&&level===2)level=1;
    if(level<2){if(distance>180)level=1;else if(distance<140)level=0;}
    if(this.quality==='low')level=Math.max(1,level);
   }
   if(level!==item.level){item.mesh.geometry=item.levels[level];item.level=level;}
  }
 }
 snapshot(){return{batches:this.meshes.length,levels:[0,1,2].map(level=>this.meshes.filter(m=>m.level===level).length)};}
}
