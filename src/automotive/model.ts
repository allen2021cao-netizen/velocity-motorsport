import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {detailClassics} from './classic-detail';
import {SHAPES} from './profiles';
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
/** Continuous coachwork patches, cut wheel arches, glazed cabin and independent wheel assemblies. */
export function buildAutomobile(cfg:any){
 const p=SHAPES[cfg.type]||SHAPES.f40,id=cfg.type,classic=['diablo','viper','clk','c5'].includes(id),g=new T.Group(),body=new T.Group();g.add(body);
 const paint=new T.MeshPhysicalMaterial({color:cfg.color,metalness:.72,roughness:.24,clearcoat:1,clearcoatRoughness:.12});
 const rubber=new T.MeshStandardMaterial({color:0x101113,roughness:.94,side:T.DoubleSide}),carbon=new T.MeshStandardMaterial({color:0x222629,roughness:.62,metalness:.2}),trim=new T.MeshStandardMaterial({color:0x111619,roughness:.5}),alloy=new T.MeshStandardMaterial({color:0xb5bec4,roughness:.24,metalness:1});
 const glass=new T.MeshPhysicalMaterial({color:0xa6bfc6,roughness:.09,metalness:.12,transparent:true,opacity:.29,depthWrite:false,side:T.DoubleSide});
 const leather=new T.MeshStandardMaterial({color:id==='mcf1'?0x624b38:0x242427,roughness:.92}),red=new T.MeshStandardMaterial({color:0x960b10,emissive:0xff1911,emissiveIntensity:.4,roughness:.22}),lens=new T.MeshPhysicalMaterial({color:0xdce5de,metalness:.28,roughness:.15,clearcoat:1});
 const light=new T.MeshStandardMaterial({color:0xdbe7ee,emissive:0xcce7ff,emissiveIntensity:.7}),amber=new T.MeshStandardMaterial({color:0xde7511,emissive:0xc85b04,emissiveIntensity:.15});
 const mats={paint,rubber,carbon,trim,alloy,glass,leather,red,lens,light,amber};
 const add=(geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0,parent:T.Object3D=body)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);return m;};
 const box=(mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number,r=.025,parent:T.Object3D=body)=>add(r<.008?new T.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),mat,x,y,z,parent);
 const tube=(mat:T.Material,points:T.Vector3[],r=.006,parent:T.Object3D=body)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(12,points.length*8),r,6,false),mat,0,0,0,parent);
 const ellipsoid=(mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number,parent:T.Object3D=body)=>{const m=add(new T.SphereGeometry(1,32,20),mat,x,y,z,parent);m.scale.set(w,h,d);return m;};
 const surface=(fn:(u:number,v:number)=>T.Vector3,mat:T.Material,nu=64,nv=20)=>{const pos:number[]=[],uv:number[]=[],ix:number[]=[];for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const q=fn(i/nu,j/nv);q.z-=Math.sign(q.z)*.13*Math.pow(Math.min(1,Math.abs(q.z)/(p.length/2)),12)*Math.pow(Math.min(1,Math.abs(q.x)/(p.width/2)),4);pos.push(q.x,q.y,q.z);uv.push(i/nu,j/nv);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const k=i*(nv+1)+j;ix.push(k,k+nv+1,k+1,k+1,k+nv+1,k+nv+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();const m=add(geo,mat);m.material.side=T.DoubleSide;return m;};
 const front=p.length/2,rear=-front;
 function width(z:number){const t=Math.abs(z)/front;const taper=(p.round?.22:.14)*Math.pow(t,5);const hips=.025*Math.exp(-Math.pow((z-p.rear)/.5,2));return p.width/2*(1-taper)+hips;}
 function crown(z:number){const t=(z+front)/p.length;const baseline=p.tail+(p.nose-p.tail)*t;const cabin=p.waist+.035;const blend=Math.exp(-Math.pow((z-(p.screen+p.backlight)/2)/(p.length*.29),4));return T.MathUtils.lerp(baseline+.045*Math.sin(Math.PI*t),cabin,blend);}
 const fender=(z:number)=>p.bulge*Math.max(Math.exp(-Math.pow((z-p.front)/.43,2)),Math.exp(-Math.pow((z-p.rear)/.45,2)));
 function top(x:number,z:number){const t=Math.abs(x)/width(z),base=crown(z)+fender(z)*Math.pow(t,2.6)-.055*Math.pow(t,8);if(classic){const blend=T.MathUtils.smoothstep(t,.25,1);return T.MathUtils.lerp(base,Math.max(base,lower(z)+.035),blend);}return Math.max(base,lower(z)+.04-Math.max(0,.73-t)*1.8);}
 const lower=(z:number)=>{let y=.19;for(const axle of [p.front,p.rear]){const d=z-axle;if(Math.abs(d)<p.wheel+.055)y=Math.max(y,p.wheel+Math.sqrt((p.wheel+.055)**2-d*d));}return y;};
 // Hood and rear deck are separate patches: the passenger compartment is hollow.
 for(const [z0,z1] of [[rear,p.backlight],[p.screen,front]])surface((u,v)=>{const z=z0+(z1-z0)*u,x=(v*2-1)*width(z);return V(x,top(x,z),z);},paint);
 for(const side of [-1,1]){
  surface((u,v)=>{const z=rear+p.length*u,up=Math.max(top(width(z),z),lower(z)+.014),down=lower(z),x=side*width(z)*(1-.055*Math.pow(1-v,3));return V(x,down+(up-down)*v,z);},paint,180,16);
  // Rounded shoulder between the cabin sill and the outer fender.
  surface((u,v)=>{const z=p.backlight+(p.screen-p.backlight)*u,x=side*width(z)*(.77+.23*v);return V(x,top(x,z),z);},paint,64,12);
  for(const axle of [p.front,p.rear]){
   const path=[];for(let i=0;i<=40;i++){const th=Math.PI*i/40,z=axle+(p.wheel+.057)*Math.cos(th);path.push(V(side*(width(z)+.004),p.wheel+(p.wheel+.057)*Math.sin(th),z));}tube(paint,path,.018);
   // Recessed wheelhouse prevents seeing through the opposite side of the vehicle.
   const arch=add(new T.CircleGeometry(p.wheel+.025,48),trim,side*(p.width/2-.26),p.wheel,axle);arch.rotation.y=side*Math.PI/2;
  }
  box(carbon,side*(p.width/2-.06),.19,0,.12,.1,Math.max(.7,p.wheelbase-2*p.wheel-.16));
 }
 for(const [z,back] of [[front,0],[rear,1]]){
  surface((u,v)=>{const x=(u*2-1)*width(z);return V(x,.2+(top(x,z)-.2)*v,z+(back?-.012:.012)*Math.sin(u*Math.PI));},paint,36,12);
  box(carbon,0,.185,z+(back?.035:-.035),width(z)*1.9,.045,.23);
 }
 // Glazing uses four separate surfaces with painted roof and true A/B/C pillars.
 const roofWidth=p.width*.345;
 const roofPoint=(u:number,v:number)=>{const z=p.roofRear+(p.roofFront-p.roofRear)*u,x=(v*2-1)*roofWidth;return V(x,p.height-.045*Math.pow(v*2-1,2)+.035*Math.sin(u*Math.PI),z);};
 surface(roofPoint,id==='m3'?carbon:paint,32,28);
 function screenPoint(back:boolean,u:number,v:number){const lo=back?p.backlight:p.screen,hi=back?p.roofRear:p.roofFront,z=T.MathUtils.lerp(lo,hi,u),half=T.MathUtils.lerp(width(lo)*.77,roofWidth,u),x=(v*2-1)*half,y=T.MathUtils.lerp(top(x,lo),p.height-.045*Math.pow(v*2-1,2),u);return V(x,y+.014*Math.sin(v*Math.PI)*Math.sin(u*Math.PI),z);}
 for(const back of [false,true]){
  surface((u,v)=>screenPoint(back,u,v),glass,24,32);
  for(const side of [0,1])tube(paint,Array.from({length:12},(_,i)=>screenPoint(back,i/11,side)),.024);
  for(const u of [0,1])tube(trim,Array.from({length:16},(_,i)=>screenPoint(back,u,i/15)),.012);
 }
 for(const side of [-1,1]){
  const af=screenPoint(false,1,side===1?1:0),ar=screenPoint(true,1,side===1?1:0),bf=screenPoint(false,0,side===1?1:0),br=screenPoint(true,0,side===1?1:0);
  surface((u,v)=>br.clone().lerp(bf,u).lerp(ar.clone().lerp(af,u),v),glass,24,12);
  tube(trim,[br,bf],.014);tube(paint,[ar,af],.022);
  // Broad rear quarter panels give the cabin a solid C-pillar instead of an exposed tube cage.
  surface((u,v)=>{const outer=br.clone().lerp(ar,u),inner=br.clone().lerp(bf,.16*(1-u)).lerp(ar.clone().lerp(af,.2),u);return outer.lerp(inner,v);},paint,16,10);
  if(['r34','m3','p911'].includes(id))tube(trim,[br.clone().lerp(bf,.3),ar.clone().lerp(af,.3)],.022);
  const seamZ=p.backlight+.25,sideX=side*(width(0)+.007);
  tube(trim,[V(side*width(p.screen),top(width(p.screen),p.screen),p.screen),V(sideX,.35,p.screen-.13),V(sideX,.3,seamZ),V(side*width(seamZ),top(width(seamZ),seamZ),seamZ)],.0045);
  box(alloy,side*(width(seamZ+.12)+.012),p.waist-.06,seamZ+.12,.018,.032,.145,.009);
  const mirrorZ=p.screen-.13,my=p.waist+.13;box(trim,side*(p.width/2+.025),my,mirrorZ,.19,.035,.06);
  ellipsoid(paint,side*(p.width/2+.13),my+.035,mirrorZ,.115,.055,.115);ellipsoid(alloy,side*(p.width/2+.13),my+.035,mirrorZ-.092,.086,.038,.012);
 }
 // Seats, console, instrument binnacle, pedals and an animated steering assembly.
 box(carbon,0,.26,-.1,p.width*.75,.09,p.screen-p.backlight);
 const seats=id==='mcf1'?[[-.51,-.59],[0,-.23],[.51,-.59]]:[[-.36,-.38],[.36,-.38]];
 for(const [x,z] of seats){box(leather,x,.42,z,.44,.16,.52,.07);const back=box(leather,x,.69,z-.24,.42,.58,.13,.065);back.rotation.x=-.15;box(leather,x,.95,z-.27,.25,.19,.12,.045);for(const side of [-1,1])box(leather,x+side*.205,.57,z-.03,.075,.27,.43,.032);}
 const dashZ=p.screen-.15;box(leather,0,p.waist+.04,dashZ,p.width*.75,.19,.29,.055);box(carbon,0,.48,.0,.19,.32,.74);
 const gauges=new T.Group();gauges.position.set(p.cockpit,p.waist+.14,dashZ-.16);body.add(gauges);
 for(let i=-1;i<=1;i++){const ring=add(new T.TorusGeometry(i===0?.063:.044,.004,8,32),alloy,i*.103,0,0,gauges);ring.rotation.y=Math.PI;const dial=add(new T.CircleGeometry(i===0?.06:.041,32),trim,i*.103,0,-.003,gauges);dial.rotation.y=Math.PI;tube(light,[V(i*.103,0,-.008),V(i*.103+.017,.035,-.008)],.002,gauges);}
 const steeringWheel=new T.Group();steeringWheel.position.set(p.cockpit,p.waist+.1,dashZ-.37);steeringWheel.rotation.x=-.22;body.add(steeringWheel);
 add(new T.TorusGeometry(.145,.017,12,48),leather,0,0,0,steeringWheel);for(let i=0;i<3;i++){const th=i*Math.PI*2/3;tube(alloy,[V(0,0,0),V(Math.sin(th)*.13,Math.cos(th)*.13,0)],.012,steeringWheel);}box(trim,0,0,0,.08,.07,.045,.015,steeringWheel);
 box(alloy,.06,.7,.07,.025,.18,.025);ellipsoid(leather,.06,.8,.07,.033,.035,.033);
 // Optical housings with internal projectors and lens ribs, rather than emissive squares.
 const roundFront=id==='p911',popups=['f40','diablo','c5'].includes(id),headZ=front+.02,headY=p.nose-.03;
 for(const side of [-1,1]){
  const hx=side*p.width*.32;
  if(roundFront){ellipsoid(paint,hx,headY+.035,headZ-.18,.17,.085,.15);const m=ellipsoid(trim,hx,headY+.045,headZ-.09,.139,.116,.026);m.rotation.x=-.65;const l=ellipsoid(lens,hx,headY+.05,headZ-.07,.124,.103,.019);l.rotation.x=-.65;}
  else if(classic){
   if(id==='clk'||id==='viper'){
    const zz=front-.23,yy=top(hx,zz)+.023;
    const housing=ellipsoid(trim,hx,yy,zz,id==='clk'?.20:.23,.035,.17);housing.rotation.z=side*.10;
    for(let j=0;j<2;j++){
     const x=hx+(j-.5)*.13;ellipsoid(alloy,x,yy+.015,zz+.035,.057,.018,.085);
     ellipsoid(light,x,yy+.028,zz+.055,.041,.012,.054);
    }
    ellipsoid(glass,hx,yy+.034,zz,.205,.008,.145);
   }else{
    box(trim,hx,.30,headZ-.026,.29,.065,.028,.012);
    box(lens,hx,.30,headZ-.007,.255,.045,.011,.009);
   }
  }
  else{
   const housing=box(trim,hx,headY,headZ-.01,p.width*.23,.105,.065,.035);housing.rotation.z=side*(p.round?.09:0);
   for(let j=-1;j<=1;j++){ellipsoid(alloy,hx+j*.092,headY,headZ+.027,.036,.035,.016);ellipsoid(light,hx+j*.092,headY,headZ+.039,.024,.025,.013);}
   box(glass,hx,headY,headZ+.047,p.width*.22,.089,.008,.012);
   if(id==='r8')tube(light,[V(hx-.18,headY-.037,headZ+.048),V(hx+.16,headY-.037,headZ+.048),V(hx+.19,headY+.025,headZ+.048)],.005);
   if(popups){const z=front-.38;surface((u,v)=>{const x=hx+(v-.5)*.33,zz=z+(u-.5)*.30;return V(x,top(x,zz)+.006,zz);},paint,6,6);tube(trim,[V(hx-.17,top(hx,z)+.009,z-.15),V(hx+.17,top(hx,z)+.009,z-.15)],.004);}
  }
  if(['f40','r34','supra','diablo','mcf1','gt40','c5'].includes(id))for(let i=0;i<2;i++){
   const x=side*(p.width*.25+i*.19),y=p.tail-.08,z=rear-.025,r=id==='r34'&&i===0?.09:.074;
   const bezel=add(new T.CylinderGeometry(r+.012,r+.012,.03,32),trim,x,y,z);bezel.rotation.x=Math.PI/2;
   const l=add(new T.CylinderGeometry(r,r,.035,32),i===1&&id==='f40'?amber:red,x,y,z-.018);l.rotation.x=Math.PI/2;
   const circle=add(new T.TorusGeometry(r*.75,.003,6,32),lens,x,y,z-.039);circle.rotation.y=Math.PI;
  }else{box(trim,side*p.width*.29,p.tail-.08,rear-.02,.46,.13,.035);box(red,side*p.width*.29,p.tail-.08,rear-.044,.425,.094,.025);for(let j=0;j<5;j++)box(lens,side*p.width*.29,p.tail-.115+j*.015,rear-.06,.39,.002,.006,.001);}
  box(amber,side*p.width*.40,p.nose-.065,front-.035,.11,.042,.03,.012);
 }
 if(id==='p911')box(red,0,p.tail-.08,rear-.024,p.width*.63,.075,.035);
 // Recessed intakes, visible slats and model-specific aero.
 function grille(x:number,y:number,z:number,w:number,h:number){box(trim,x,y,z,w,h,.034,.015);for(let i=1;i<Math.ceil(w/.035);i++)box(carbon,x-w/2+i*.035,y,z+.02,.008,h-.015,.009,.002);}
 if(id==='m3'){for(const side of [-1,1]){box(alloy,side*.135,p.nose-.015,front+.026,.22,.16,.024,.035);grille(side*.135,p.nose-.015,front+.041,.19,.13);}grille(0,.34,front+.025,.74,.16);}
 else grille(0,.31,front+.022,id==='r8'?.75:.66,.16);
 for(const side of [-1,1])grille(side*p.width*.32,.31,front+.01,.30,.13);
 if(['diablo','r8','mcf1','clk','f40','gt40'].includes(id))for(const side of [-1,1]){
  const z=p.rear+.53;box(trim,side*(width(z)+.01),.53,z,.016,.25,.44,.035);
  for(let i=0;i<4;i++)box(carbon,side*(width(z)+.023),.45+i*.05,z,.021,.012,.39,.003);
  if(id==='r8')box(carbon,side*(width(z)+.016),.69,z-.07,.025,.57,.31,.014);
 }
 if(p.wing){const wingZ=rear+.26;for(const side of [-1,1])box(id==='f40'?paint:alloy,side*p.width*.35,(p.tail+p.wing)/2,wingZ,.055,p.wing-p.tail,.22,.016);box(id==='f40'||id==='p911'?paint:carbon,0,p.wing,wingZ,p.width*.91,.055,id==='p911'?.5:.34,.026);}
 if(['f40','diablo','mcf1','clk','gt40'].includes(id))for(let i=0;i<7;i++){const z=p.backlight-.12-i*.105;box(trim,0,top(0,z)+.008,z,p.width*.45,.012,.042,.004);}
 if(id==='m3')for(const side of [-1,1])for(let i=0;i<5;i++){const z=p.screen+.14+i*.1;box(trim,side*.32,top(side*.32,z)+.014,z,.25,.013,.038,.003);}
 if(['mcf1','clk'].includes(id)){box(paint,0,p.height+.045,p.roofRear+.02,.22,.09,.35,.035);box(trim,0,p.height+.047,p.roofRear+.20,.155,.045,.012,.009);}
 if(['viper','gt40','m3'].includes(id))for(const side of [-1,1])for(const [z0,z1] of [[rear,p.backlight],[p.screen,front]])surface((u,v)=>{const z=z0+(z1-z0)*u,x=side*.17+(v-.5)*.15;return V(x,top(x,z)+.003,z);},new T.MeshStandardMaterial({color:id==='gt40'?0xe77928:id==='m3'?0x224aa0:0xe9e7df,roughness:.28,metalness:.45}),48,4);
 const exhausts=id==='f40'?[-.14,0,.14]:id==='c5'?[-.21,-.07,.07,.21]:id==='r34'?[-.55]:id==='supra'?[.52]:[-.48,.48];
 for(const x of exhausts){const pipe=add(new T.CylinderGeometry(.062,.062,.16,24,1,true),alloy,x,.285,rear-.035);pipe.rotation.x=Math.PI/2;const hole=add(new T.CircleGeometry(.05,24),trim,x,.285,rear-.12);hole.rotation.y=Math.PI;}
 for(const side of [-1,1])if(id==='viper'){const pipe=add(new T.CylinderGeometry(.045,.045,1.15,24),alloy,side*(p.width/2+.015),.235,0);pipe.rotation.x=Math.PI/2;}
 // Metre-scaled wheels with rounded tire shoulder, tread, drilled discs and fixed calipers.
 const wheels:T.Group[]=[],frontPivots:T.Group[]=[];const caliper=new T.MeshStandardMaterial({color:id==='p911'?0xcfb821:0xb71915,roughness:.42,metalness:.4});
 for(const [z,isFront] of [[p.front,true],[p.rear,false]] as const)for(const side of [-1,1]){
  const pivot=new T.Group();pivot.position.set(side*(width(z)-.105),p.wheel,z);g.add(pivot);if(isFront)frontPivots.push(pivot);const spin=new T.Group();pivot.add(spin);wheels.push(spin);
  const section=[V(0,.19,0),V(.095,.19,0),V(.14,.235,0),V(.145,p.wheel-.045,0),V(.12,p.wheel,0),V(-.12,p.wheel,0),V(-.145,p.wheel-.045,0),V(-.14,.235,0),V(-.095,.19,0),V(0,.19,0)];
  const tireGeo=new T.LatheGeometry(section.map(q=>new T.Vector2(q.y,q.x)),80);tireGeo.rotateZ(Math.PI/2);add(tireGeo,rubber,0,0,0,spin);
  const rimR=p.wheel*.70;const barrel=add(new T.CylinderGeometry(rimR,rimR,.245,64,1,true),alloy,0,0,0,spin);barrel.rotation.z=Math.PI/2;
  for(const x of [-.126,.126]){const lip=add(new T.TorusGeometry(rimR,.008,8,64),alloy,x,0,0,spin);lip.rotation.y=Math.PI/2;}
  const rotor=add(new T.CylinderGeometry(rimR*.84,rimR*.84,.012,64),alloy,side*.095,0,0,spin);rotor.rotation.z=Math.PI/2;
  for(let i=0;i<30;i++){const th=i*Math.PI*2/30;const hole=add(new T.CircleGeometry(.006,6),trim,side*.103,Math.sin(th)*rimR*.72,Math.cos(th)*rimR*.72,spin);hole.rotation.y=side*Math.PI/2;}
  for(let i=0;i<p.spokes;i++){const th=i*Math.PI*2/p.spokes;const spoke=box(alloy,side*.127,Math.sin(th)*rimR*.50,Math.cos(th)*rimR*.50,.03,.031,rimR*.91,.011,spin);spoke.rotation.x=-th;}
  const cap=add(new T.CylinderGeometry(.043,.043,.027,24),alloy,side*.145,0,0,spin);cap.rotation.z=Math.PI/2;
  for(let i=0;i<5;i++){const th=i*Math.PI*2/5;ellipsoid(trim,side*.16,Math.sin(th)*.030,Math.cos(th)*.030,.006,.006,.006,spin);}
  box(caliper,side*.09,0, rimR*.75,.055,.18,.07,.02,pivot);
  for(let j=0;j<3;j++){const line=add(new T.TorusGeometry(p.wheel+.0006,.0025,4,80),trim,(j-1)*.064,0,0,spin);line.rotation.y=Math.PI/2;}
  for(let i=0;i<64;i++){const th=i*Math.PI*2/64;for(const band of [-1,1]){const tread=box(trim,band*.09,Math.sin(th)*(p.wheel+.001),Math.cos(th)*(p.wheel+.001),.055,.003,.013,.001,spin);tread.rotation.x=-th;}}
 }
 const crafted=['diablo','viper','clk','c5'].includes(id);
 if(crafted)detailClassics(id,p,{box,tube,add,surface,ellipsoid,top,width,body,mats});
 // Merge only rigid opaque assemblies. Preserve glass and articulated steering/brakes.
 function batch(root:T.Group){root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),bins=new Map<T.Material,T.Mesh[]>();root.traverse(o=>{const m=o as T.Mesh;if(m.isMesh&&!Array.isArray(m.material)&&!m.material.transparent){const list=bins.get(m.material)||[];list.push(m);bins.set(m.material,list);}});for(const [mat,list]of bins){if(list.length<2)continue;const source=list.map(m=>(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(inverse.clone().multiply(m.matrixWorld)));const geo=mergeGeometries(source);source.forEach(x=>x.dispose());if(geo){const mesh=add(geo,mat,0,0,0,root);mesh.name='batched-'+mat.uuid;list.forEach(m=>{m.removeFromParent();m.geometry.dispose();});}}}
 steeringWheel.removeFromParent();batch(body);body.add(steeringWheel);for(const w of wheels)batch(w);
 g.name=cfg.nameEn;g.userData.modelKind=crafted?'original-classic-detail':'procedural-coachwork';g.userData.dimensions={length:p.length,width:p.width,height:p.height,wheelbase:p.wheelbase};
 return{group:g,bodyParts:body,wheels,frontPivots,flames:[],glowPlane:new T.Group(),cfg,brakeLight:red,steeringWheel,detailed:true,cockpit:{x:p.cockpit,y:p.height-.12,z:p.screen-.95},bonnet:{x:0,y:top(0,p.screen+.25)+.19,z:p.screen+.25},wheelRadius:p.wheel,modelKind:crafted?'original-classic-detail':'procedural-coachwork',materials:mats};
}
