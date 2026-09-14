import * as T from 'three';
// Original, approximate cabin supplement: the distributed exterior has a simplified interior.
export function supplementPorscheCabin(body:T.Group){
 const leather=new T.MeshStandardMaterial({color:0x17191c,roughness:.82}),alloy=new T.MeshStandardMaterial({color:0x96999c,metalness:.7,roughness:.3});
 const dash=new T.Mesh(new T.BoxGeometry(1.38,.21,.36),leather);dash.position.set(0,.67,.58);body.add(dash);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;const c=canvas.getContext('2d')!;c.clearRect(0,0,1024,320);
 for(let i=0;i<5;i++){const x=112+i*200,r=i===2?113:88;c.fillStyle='#11151a';c.beginPath();c.arc(x,155,r,0,Math.PI*2);c.fill();c.strokeStyle='#c2c4c8';c.lineWidth=5;c.beginPath();c.arc(x,155,r,0,Math.PI*2);c.stroke();for(let j=0;j<=10;j++){const a=(.75+j*.15)*Math.PI;c.lineWidth=3;c.beginPath();c.moveTo(x+Math.cos(a)*r*.79,155+Math.sin(a)*r*.79);c.lineTo(x+Math.cos(a)*r*.94,155+Math.sin(a)*r*.94);c.stroke();}c.strokeStyle='#f44d36';c.beginPath();c.moveTo(x,155);c.lineTo(x-r*.6,155+r*.5);c.stroke();c.fillStyle='#eee';c.font='18px sans-serif';c.textAlign='center';c.fillText(['OIL','KM/H','RPM','FUEL','TEMP'][i],x,200);}
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
 const cluster=new T.Mesh(new T.PlaneGeometry(.55,.172),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));cluster.rotation.y=Math.PI;cluster.position.set(.35,.78,.39);body.add(cluster);
 const wheel=new T.Group();wheel.position.set(.35,.69,.12);wheel.userData.steeringAxis='z';
 wheel.add(new T.Mesh(new T.TorusGeometry(.165,.019,12,48),leather));
 for(let i=0;i<3;i++){const spoke=new T.Mesh(new T.BoxGeometry(.027,.145,.02),alloy);const a=i*2*Math.PI/3;spoke.position.set(Math.sin(a)*.07,Math.cos(a)*.07,0);spoke.rotation.z=-a;wheel.add(spoke);}
 wheel.add(new T.Mesh(new T.CylinderGeometry(.048,.048,.03,24).rotateX(Math.PI/2),leather));body.add(wheel);return wheel;
}
