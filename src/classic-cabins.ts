import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Original cabin supplements. Layouts are approximations, not scanned interiors. */
function dial(radius:number,max:number,label:string){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#0b1015';c.beginPath();c.arc(256,256,248,0,Math.PI*2);c.fill();c.strokeStyle='#879097';c.lineWidth=8;c.stroke();
 for(let i=0;i<=40;i++){const a=(135+i*6.75)*Math.PI/180;c.strokeStyle=i>33?'#ec5747':'#d8dfdf';c.lineWidth=i%5===0?5:2;c.beginPath();c.moveTo(256+Math.cos(a)*207,256+Math.sin(a)*207);c.lineTo(256+Math.cos(a)*(i%5===0?176:190),256+Math.sin(a)*(i%5===0?176:190));c.stroke();if(i%5===0){c.fillStyle='#e4e9e9';c.font='26px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(Math.round(i/40*max)),256+Math.cos(a)*144,256+Math.sin(a)*144);}}
 c.fillStyle='#c9cfd1';c.font='22px Arial';c.textAlign='center';c.fillText(label,256,332);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const g=new T.Group();
 const face=new T.Mesh(new T.CircleGeometry(radius,64),new T.MeshBasicMaterial({map:texture}));face.rotation.y=Math.PI;g.add(face);
 const needle=new T.Group();const hand=new T.Mesh(new T.BoxGeometry(radius*.025,radius*.7,.002),new T.MeshBasicMaterial({color:0xff6038}));hand.position.y=radius*.33;needle.add(hand);needle.position.z=-.003;g.add(needle);
 return {group:g,set(value:number){needle.rotation.z=(135+T.MathUtils.clamp(value/max,0,1)*270+90)*Math.PI/180;}};
}
export function makeR34Cabin(body:T.Group,variant='r34'){
 const cabin=new T.Group();cabin.name='original-'+variant+'-cabin';body.add(cabin);
 const leather=new T.MeshStandardMaterial({color:0x202329,roughness:.84}),trim=new T.MeshStandardMaterial({color:0x080b10,roughness:.65}),metal=new T.MeshStandardMaterial({color:0x788087,metalness:.65,roughness:.32});
 function box(x:number,y:number,z:number,w:number,h:number,d:number,mat=leather,r=.025,parent:T.Object3D=cabin){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat);m.position.set(x,y,z);parent.add(m);return m;}
 box(0,.79,.59,1.46,.27,.43);box(-.36,.925,.49,.56,.17,.22,trim,.06);
 box(0,.26,-.2,1.39,.07,1.7,trim);box(0,.46,-.03,.27,.38,.82,trim);
 for(const side of [-1,1]){box(side*.74,.63,-.2,.045,.48,1.3);box(side*.7,.55,-.18,.075,.095,.55,trim);box(side*.69,.7,-.2,.012,.026,.16,metal);box(side*.36,.39,-.57,.48,.16,.56);const seat=box(side*.36,.7,-.82,.46,.58,.14);seat.rotation.x=-.14;box(side*.36,1.03,-.87,.24,.21,.12);}
 box(0,1.235,-.28,1.21,.025,1.1); // dark headlining inside the source roof
 const speed=dial(.083,320,'km/h'),rpm=dial(.083,10,'x1000 RPM'),fuel=dial(.05,100,'FUEL');
 for(const [d,x] of [[speed,-.26],[rpm,-.46],[fuel,-.095]] as const){d.group.position.set(x,.91,.368);cabin.add(d.group);}fuel.set(85);if(variant==='r8')for(const d of [speed,rpm,fuel])d.group.scale.x=-1;
 for(const x of [-.65,.12,.3,.63]){box(x,.79,.355,.13,.058,.027,trim,.006);for(let i=0;i<4;i++)box(x,.772+i*.011,.336,.11,.003,.003,metal,.001);}
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const ctx=cv.getContext('2d')!;const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 const displayCase=box(.18,.97,.58,.31,.16,.10,trim,.018);if(variant==='r8')displayCase.visible=false;const screen=new T.Mesh(new T.PlaneGeometry(.278,.13),new T.MeshBasicMaterial({map:tex}));screen.rotation.y=Math.PI;screen.position.set(.18,.97,.526);cabin.add(screen);if(variant==='r8')screen.visible=false;
 box(.15,.625,.32,.22,.18,.06,trim);for(const x of [.075,.15,.225]){const knob=new T.Mesh(new T.CylinderGeometry(.02,.02,.015,24),metal);knob.rotation.x=Math.PI/2;knob.position.set(x,.615,.279);cabin.add(knob);}
 box(.05,.60,-.06,.018,.16,.018,metal);box(.05,.689,-.06,.05,.04,.05,trim);
 const steering=new T.Group();steering.position.set(-.36,.79,.055);steering.userData.steeringAxis='z';cabin.add(steering);
 steering.add(new T.Mesh(new T.TorusGeometry(.17,.021,16,64),leather));
 for(const a of [Math.PI/2,-Math.PI/2,Math.PI]){const spoke=box(Math.sin(a)*.085,Math.cos(a)*.085,0,.052,.17,.027,trim,.01,steering);spoke.rotation.z=-a;}
 box(0,0,-.015,.145,.095,.06,leather,.025,steering);
 let last=-1;return {steering,update(kph:number,rev:number){speed.set(kph);rpm.set(rev);const bucket=Math.floor(kph/3);if(bucket===last)return;last=bucket;ctx.fillStyle='#0a1b23';ctx.fillRect(0,0,512,256);ctx.fillStyle='#9bc8ca';ctx.font='25px monospace';ctx.fillText('MULTI FUNCTION DISPLAY',18,34);ctx.font='19px monospace';ctx.fillText('BOOST   '+(Math.min(1.2,kph/160)).toFixed(2)+' bar',20,86);ctx.fillText('WATER   86 C',20,132);ctx.fillText('OIL     94 C',20,176);ctx.fillStyle='#77bfab';ctx.fillRect(24,203,Math.min(445,kph/320*445),14);tex.needsUpdate=true;}};
}
export function makeF40Instruments(body:T.Group){
 const group=new T.Group();group.name='original-f40-instruments';body.add(group);
 const speed=dial(.039,360,'km/h'),rpm=dial(.039,10,'RPM');
 speed.group.position.set(.27236,.76089,.604);rpm.group.position.set(.37092,.76089,.604);group.add(speed.group,rpm.group);
 return (kph:number,rev:number)=>{speed.set(kph);rpm.set(rev);};
}
