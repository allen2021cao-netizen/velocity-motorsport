import * as T from 'three';
export type CameraAnchor={x:number;y:number;z:number};
const origin=new T.Vector3(),forward=new T.Vector3(),neutralEye=new T.Vector3(),neutralTarget=new T.Vector3(),yaw=new T.Quaternion(),up=new T.Vector3(0,1,0);
export function cameraPose(body:T.Object3D,anchor:CameraAnchor,pose={eye:new T.Vector3(),target:new T.Vector3(),up:new T.Vector3()},motion=1){
 body.updateWorldMatrix(true,false);
 body.localToWorld(pose.eye.set(anchor.x,anchor.y,anchor.z));body.localToWorld(pose.target.set(anchor.x,anchor.y-.015,anchor.z+45));pose.up.set(0,1,0).transformDirection(body.matrixWorld);
 if(motion<1&&body.parent){
  body.parent.localToWorld(origin.copy(body.position));forward.set(0,0,1).transformDirection(body.parent.matrixWorld);yaw.setFromAxisAngle(up,Math.atan2(forward.x,forward.z));
  neutralEye.set(anchor.x,anchor.y,anchor.z).applyQuaternion(yaw).add(origin);neutralTarget.set(anchor.x,anchor.y-.015,anchor.z+45).applyQuaternion(yaw).add(origin);
  const amount=1-Math.max(0,motion);pose.eye.lerp(neutralEye,amount);pose.target.lerp(neutralTarget,amount);pose.up.lerp(up,amount).normalize();
 }
 return pose;
}
