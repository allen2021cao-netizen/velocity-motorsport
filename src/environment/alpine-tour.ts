import {Box3,CatmullRomCurve3,PerspectiveCamera,Vector3} from 'three';

/** A continuous, level aerial journey inside the valley, below the distant peaks. */
export function createAlpineTour(points:Vector3[],snowy:boolean,region=''){
 const bounds=new Box3().setFromPoints(points),center=bounds.getCenter(new Vector3());
 const stops=[.12,.36,.68,.88,.64,.3].map((u,i)=>{
  const p=points[Math.floor(u*(points.length-1))].clone();
  p.x+=Math.sin(i*Math.PI/3)*160;p.z+=Math.cos(i*Math.PI/3)*160;
  // Keep the entire camera route above the highest road, trees and valley terrain.
  if(region==='bathurst'||region==='phillip'){
   let nearby=p.y;for(const q of points)if(Math.hypot(q.x-p.x,q.z-p.z)<350)nearby=Math.max(nearby,q.y);
   p.y=nearby+95+Math.sin(i*Math.PI/3)*18;
  }else p.y=bounds.max.y+135+Math.sin(i*Math.PI/3)*45;return p;
 });
 const path=new CatmullRomCurve3(stops,true,'centripetal'),focus=center.clone();
 return {focus,view(camera:PerspectiveCamera,time:number){
  const phase=((time%180)+180)%180/180;
  path.getPointAt(phase,camera.position);
  const angle=region==='phillip'?.35+Math.sin(phase*Math.PI*2)*.8:.65+phase*Math.PI*2;
  focus.set(camera.position.x+Math.sin(angle)*3300,camera.position.y+(region==='phillip'?-600:region==='bathurst'?-400:snowy?60:-180),camera.position.z+Math.cos(angle)*3300);
  if(region==='fuji')focus.set(center.x-4800+Math.sin(phase*Math.PI*2)*700,1100,center.z-4800);
  if(region==='suzuka')focus.copy(center).add(new Vector3(Math.sin(phase*Math.PI*2)*180,15,Math.cos(phase*Math.PI*2)*180));
  camera.up.set(0,1,0);camera.lookAt(focus);camera.fov=camera.aspect<1?64:54;camera.updateProjectionMatrix();
 }};
}
