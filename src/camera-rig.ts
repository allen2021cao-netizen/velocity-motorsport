import * as T from 'three';
export type CameraAnchor={x:number;y:number;z:number};
export function cameraPose(body:T.Object3D,anchor:CameraAnchor){
 body.updateWorldMatrix(true,false);
 return{eye:body.localToWorld(new T.Vector3(anchor.x,anchor.y,anchor.z)),target:body.localToWorld(new T.Vector3(anchor.x,anchor.y-.015,anchor.z+45)),up:new T.Vector3(0,1,0).transformDirection(body.matrixWorld)};
}
