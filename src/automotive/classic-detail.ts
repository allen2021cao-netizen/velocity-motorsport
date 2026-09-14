import * as T from 'three';
import {CarShape} from './profiles';
/** Original model-specific detailing; an artistic reconstruction, not scanned CAD. */
export function detailClassics(id:string,p:CarShape,h:any){
 const {box,tube,add,surface,ellipsoid,top,width,body,mats}=h;
 const {paint,trim,alloy,leather,carbon,lens,light}=mats;
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z),front=p.length/2,rear=-front;
 const seam=new T.MeshStandardMaterial({color:0x77736c,roughness:.95});
 // Stitching, inset door cards, speaker perforations, belts and seat upholstery.
 for(const side of [-1,1]){
  const x=side*(p.width*.39);
  box(leather,x,.56,-.24,.06,.35,.92,.055);
  tube(seam,[V(x-side*.034,.68,.16),V(x-side*.034,.66,-.55),V(x-side*.034,.46,-.62)],.0018);
  box(alloy,x-side*.04,.66,-.04,.022,.035,.17,.008);
  for(let row=0;row<7;row++)for(let col=0;col<9;col++){const hole=add(new T.CircleGeometry(.0025,6),trim,x-side*.035,.42+row*.009,.10+col*.011);hole.rotation.y=-side*Math.PI/2;}
  for(let i=0;i<7;i++){tube(seam,[V(side*.36-.15+i*.05,.511,-.58),V(side*.36-.15+i*.05,.513,-.18)],.0013);}
  box(trim,side*.61,.65,-.61,.028,.51,.036,.006);
  box(alloy,side*.61,.52,-.585,.033,.051,.015,.003);
  const dz=p.screen-.30;
  for(let j=0;j<3;j++){const knob=add(new T.CylinderGeometry(.017,.017,.014,24),alloy,(j-1)*.07,.59,dz);knob.rotation.x=Math.PI/2;}
 }
 // Recessed hood panels follow the actual curved bonnet, avoiding floating decals.
 function hoodPanel(cx:number,z:number,w:number,d:number){
  surface((u:number,v:number)=>{const zz=z+(u-.5)*d,x=cx+(v-.5)*w*(.35+.65*Math.sin(Math.PI*u));return V(x,top(x,zz)+.007,zz);},trim,24,12);
  for(let i=0;i<5;i++){const zz=z-d*.32+i*d*.16;box(carbon,cx,top(cx,zz)+.017,zz,w*.72,.012,.022,.003);}
 }
 function rearFins(count:number){for(let i=0;i<count;i++)box(carbon,(i-(count-1)/2)*.13,.235,rear+.018,.017,.13,.22,.004);}
 if(id==='diablo'){
  // Twin roof ram-air intakes and the slatted V12 engine cover distinguish the SV.
  for(const side of [-1,1]){
   box(paint,side*.35,p.height+.035,p.roofRear+.02,.22,.085,.39,.035);
   box(trim,side*.35,p.height+.037,p.roofRear+.218,.163,.047,.015,.012);
   hoodPanel(side*.30,p.screen+.18,.15,.25);
   const z=p.rear+.47,x=side*(width(z)+.018);
   const points=[V(x,.43,z-.25),V(x,.63,z-.16),V(x,.65,z+.24),V(x,.43,z+.14),V(x,.43,z-.25)];tube(paint,points,.018);
  }
  for(let i=0;i<9;i++){const z=p.backlight-.14-i*.096;box(alloy,0,top(0,z)+.017,z,.57,.008,.021,.002);}
  for(const x of [-.20,.20]){const fuel=add(new T.CylinderGeometry(.04,.04,.007,32),alloy,x,top(x,-.9)+.014,-.9);}
  rearFins(5);
 }
 if(id==='viper'){
  hoodPanel(0,1.08,.31,.49);
  for(const side of [-1,1]){
   for(let i=0;i<4;i++)hoodPanel(side*.55,.65+i*.11,.20,.055);
   // Deep side gills behind the front wheels and sculpted sill outlet.
   for(let i=0;i<4;i++){const z=.51-i*.10,x=side*(width(z)+.012);const gill=box(trim,x,.52,z,.018,.17,.045,.012);gill.rotation.x=-.2;}
   const pipe=add(new T.CylinderGeometry(.051,.051,.12,32,1,true),alloy,side*(p.width/2+.027),.245,-.77);pipe.rotation.z=Math.PI/2;
  }
  rearFins(5);
 }
 if(id==='clk'){
  // Front wheel ventilation, splitter stays and GT1 wing endplates.
  for(const side of [-1,1]){
   hoodPanel(side*.61,1.15,.22,.47);
   for(let i=0;i<3;i++)tube(alloy,[V(side*(.30+i*.14),.20,front-.07),V(side*(.30+i*.14),.32,front+.018)],.004);
   box(carbon,side*p.width*.46,p.wing-.04,rear+.26,.018,.22,.40,.012);
   const x=side*(width(p.rear+.48)+.019);tube(alloy,[V(x,.48,p.rear+.33),V(x,.63,p.rear+.58)],.006);
  }
  rearFins(9);
 }
 if(id==='c5'){
  // Flush pop-up lamp seams and a broad rear license recess between four round lamps.
  for(const side of [-1,1]){
   const cx=side*p.width*.32,z=front-.38;
   const points=[[-.17,-.15],[.17,-.15],[.17,.15],[-.17,.15],[-.17,-.15]].map(([dx,dz])=>V(cx+dx,top(cx+dx,z+dz)+.009,z+dz));tube(trim,points,.003);
   const zz=.65,x=side*(width(zz)+.009);for(let i=0;i<3;i++)box(trim,x,.51+i*.035,zz,.015,.014,.30,.004);
  }
  box(trim,0,p.tail-.14,rear-.035,.42,.15,.024,.02);
  for(let i=0;i<4;i++){const x=(i-1.5)*.14;const ring=add(new T.TorusGeometry(.056,.006,8,40),alloy,x,.285,rear-.122);}
  // Raised hood centre keeps the long front-engine silhouette distinct.
  surface((u:number,v:number)=>{const z=p.screen+.12+(front-p.screen-.30)*u,x=(v-.5)*.53;return V(x,top(x,z)+.02*Math.sin(Math.PI*u)*Math.sin(Math.PI*v),z);},paint,48,20);
 }
 return 'original-classic-detail';
}
