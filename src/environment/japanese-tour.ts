import {Box3,CatmullRomCurve3,PerspectiveCamera,Vector3} from 'three';
/** An oblique aerial circuit survey with continuous, independently tracked targets. */
export function japaneseTour(points:Vector3[],key:string){
 const bounds=new Box3().setFromPoints(points),center=bounds.getCenter(new Vector3()),fuji=key==='fuji';
 const fractions=[.02,.18,.34,.46,.63,.82,.96,.6],eyes:Vector3[]=[],targets:Vector3[]=[];
 fractions.forEach((u,i)=>{
  const p=points[Math.floor(u*(points.length-1))],angle=i/8*Math.PI*2;
  eyes.push(new Vector3(p.x+Math.sin(angle)*330,bounds.max.y+230+(i%3)*75,p.z+Math.cos(angle)*330));
  targets.push(p.clone().lerp(center,.25));
 });
 if(fuji){
  for(let i=0;i<8;i++){const angle=i/8*Math.PI*2;
   eyes[i]=new Vector3(center.x+700+Math.cos(angle)*800,bounds.max.y+530+Math.sin(angle)*100,center.z+800+Math.sin(angle)*650);
   // The mountain and circuit share the frame through most of the aerial orbit.
   targets[i]=new Vector3(center.x-1500,390,center.z-1500);
  }
  targets[2]=new Vector3(center.x-500,90,center.z-400);
  targets[6]=new Vector3(center.x-3100,700,center.z-3100);
 }

 const path=new CatmullRomCurve3(eyes,true,'centripetal'),look=new CatmullRomCurve3(targets,true,'centripetal'),focus=center.clone();
 return{focus,view(camera:PerspectiveCamera,time:number){const u=((time%220)+220)%220/220;path.getPoint(u,camera.position);look.getPoint(u,focus);camera.up.set(0,1,0);camera.lookAt(focus);camera.fov=camera.aspect<1?65:fuji?58:53;camera.updateProjectionMatrix();}};
}
