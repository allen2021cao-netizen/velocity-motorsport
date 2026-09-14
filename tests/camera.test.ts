import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {cameraPose} from '../src/camera-rig';
test('cockpit camera follows car translation, heading and body movement',()=>{
 const car=new T.Group(),body=new T.Group();car.add(body);car.position.set(20,0,30);car.rotation.y=Math.PI/2;body.rotation.z=.025;const anchor={x:-.34,y:1.1,z:-.4},pose=cameraPose(body,anchor);
 const expected=new T.Vector3(anchor.x,anchor.y,anchor.z).applyMatrix4(body.matrixWorld);assert.ok(pose.eye.distanceTo(expected)<1e-8);assert.ok(pose.target.x>pose.eye.x+44);assert.ok(Math.abs(pose.up.length()-1)<1e-8);
});
