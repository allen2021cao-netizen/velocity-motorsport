import * as T from 'three';

/** Orbit the actual scene geometry; pointer capture keeps drags inside the selected viewer. */
export function createVehicleOrbit(){
 const initial={yaw:.62,pitch:.18,zoom:1};
 const pose={...initial};let yaw=pose.yaw,pitch=pose.pitch,zoom=1,automatic=true;
 const pointers=new Map<number,{x:number;y:number}>();
 function reset(){Object.assign(pose,initial);yaw=pose.yaw;pitch=pose.pitch;zoom=1;automatic=true;}
 function scale(factor:number){pose.zoom=T.MathUtils.clamp(pose.zoom*factor,.42,2.2);}
 function bind(el:HTMLElement,enabled:()=>boolean){
  el.addEventListener('pointerdown',e=>{if(!enabled()||e.button>0)return;e.preventDefault();el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});automatic=false;});
  el.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const before=[...pointers.values()];const distance=(p:{x:number;y:number}[])=>p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;const gap=distance(before);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1){pose.yaw-=(e.clientX-old.x)*.009;pose.pitch=T.MathUtils.clamp(pose.pitch+(e.clientY-old.y)*.007,.025,1.25);}else{const next=distance([...pointers.values()]);if(gap>5&&next>5)scale(gap/next);}
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>pointers.delete((e as PointerEvent).pointerId));
  el.addEventListener('wheel',e=>{if(!enabled())return;e.preventDefault();scale(Math.exp(T.MathUtils.clamp(e.deltaY,-150,150)*.002));},{passive:false});
  el.addEventListener('keydown',e=>{if(!enabled())return;const actions:Record<string,()=>void>={ArrowLeft:()=>pose.yaw-=.2,ArrowRight:()=>pose.yaw+=.2,ArrowUp:()=>pose.pitch=Math.min(1.25,pose.pitch+.1),ArrowDown:()=>pose.pitch=Math.max(.025,pose.pitch-.1),Equal:()=>scale(.85),Minus:()=>scale(1.15),Home:reset};if(actions[e.code]){e.preventDefault();e.stopPropagation();automatic=false;actions[e.code]();}});
 }
 function view(camera:T.PerspectiveCamera,dt:number,target=new T.Vector3(0,.92,0),radius=2.65){
  if(automatic&&!pointers.size)pose.yaw+=dt*.13;
  const blend=1-Math.exp(-14*dt);yaw+=(pose.yaw-yaw)*blend;pitch+=(pose.pitch-pitch)*blend;zoom+=(pose.zoom-zoom)*blend;
  camera.fov=42;const fit=radius/Math.sin(Math.atan(Math.tan(21*Math.PI/180)*Math.min(1,camera.aspect)));
  camera.position.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(fit*zoom).add(target);camera.lookAt(target);camera.updateProjectionMatrix();
 }
 return{bind,view,reset,scale,preset(name:string){automatic=false;pose.zoom=name==='wheel'?.65:1;pose.yaw=({front:.62,rear:3.75,side:Math.PI/2,wheel:.75} as Record<string,number>)[name]??.62;pose.pitch=.18;},toggle(){automatic=!automatic;return automatic;},snapshot:()=>({...pose,automatic})};
}
