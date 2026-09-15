import {Euler, Object3D, Quaternion, Vector3} from 'three';

/** Presentation only. Always restore simulation transforms before another physics step. */
export class RenderMotion {
 private poses:{node:Object3D;previous:Vector3;current:Vector3;before:Quaternion;after:Quaternion;rotation:Euler}[]=[];
 setTargets(nodes:Object3D[]){
  this.poses=[...new Set(nodes)].map(node=>({node,previous:node.position.clone(),current:node.position.clone(),before:node.quaternion.clone(),after:node.quaternion.clone(),rotation:node.rotation.clone()}));
 }
 beforeStep(){for(const p of this.poses){p.previous.copy(p.current);p.before.copy(p.after);}}
 afterStep(){for(const p of this.poses){p.current.copy(p.node.position);p.after.copy(p.node.quaternion);p.rotation.copy(p.node.rotation);}}
 reset(){this.afterStep();this.beforeStep();}
 apply(alpha:number){
  const a=Math.max(0,Math.min(1,alpha));
  for(const p of this.poses){p.node.position.lerpVectors(p.previous,p.current,a);p.node.quaternion.slerpQuaternions(p.before,p.after,a);}
 }
 restore(){for(const p of this.poses){p.node.position.copy(p.current);p.node.rotation.copy(p.rotation);}}
}
