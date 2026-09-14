// Map-derived route adaptations. Attribution and share-alike data licenses:
// public/circuits/CREDITS.md. Coordinates below are independently traced map anchors.
import fs from 'node:fs';
import {Vector2,Vector3,CatmullRomCurve3} from 'three';
const routes={
 tokyo:{length:2585,points:[[875,360],[875,220],[868,202],[831,197],[825,189],[825,130],[879,124],[895,114],[900,97],[896,86],[880,79],[829,83],[806,98],[798,99],[789,65],[759,65],[751,73],[789,230],[795,277],[790,292],[779,310],[532,481],[518,473],[496,487],[481,501],[482,516],[507,557],[518,590],[524,613],[524,669],[528,699],[549,738],[574,772],[581,775],[800,627],[804,613],[812,607],[829,603],[833,593],[833,513],[835,500],[845,497],[865,505],[877,498]]},
 dubai:{length:5390,points:[[645,507],[410,507],[210,508],[75,515],[43,507],[27,489],[29,461],[49,405],[45,384],[20,272],[19,242],[30,207],[69,159],[86,151],[193,126],[218,114],[254,76],[278,60],[300,60],[320,68],[344,91],[360,115],[364,139],[357,158],[339,163],[186,180],[168,188],[137,216],[126,237],[124,261],[132,286],[150,301],[176,306],[196,301],[873,21],[893,15],[909,25],[908,42],[863,110],[858,129],[865,148],[920,188],[979,211],[1066,266],[1081,282],[1075,301],[1063,309],[978,312],[937,307],[880,296],[708,246],[681,239],[650,241],[521,284],[502,294],[490,312],[492,335],[505,353],[521,357],[537,347],[590,300],[609,294],[630,296],[647,304],[810,457],[822,477],[817,497],[801,509],[781,511]]},
 london:{length:2090,points:[[948,429],[400,425],[375,438],[375,490],[363,514],[338,514],[287,498],[243,479],[192,479],[184,490],[184,585],[109,585],[111,401],[101,384],[61,377],[57,356],[91,301],[95,101],[102,80],[125,72],[690,49],[742,35],[800,35],[816,47],[821,72],[839,82],[945,84],[962,76],[967,57],[980,54],[1210,59],[1322,81],[1427,124],[1573,219],[1624,286],[1654,374],[1670,435],[1657,447],[1620,425],[1451,424],[1430,437],[1423,529],[1370,550],[1220,578],[1110,590],[1085,582],[1080,563],[1095,535],[1139,470],[1137,449],[1114,431]]},
 paris:{length:1930,points:[[580,633],[223,633],[204,623],[201,516],[153,499],[129,475],[115,449],[114,418],[124,383],[138,367],[182,392],[198,392],[201,379],[200,250],[193,235],[145,193],[137,180],[147,170],[664,170],[672,190],[770,268],[800,274],[815,284],[820,305],[822,360],[830,376],[853,380],[871,399],[877,420],[871,444],[852,460],[830,470],[817,533],[780,613],[762,632]]},
 hongkong:{length:1860,points:[[545,230],[634,195],[717,150],[731,151],[738,160],[730,170],[710,175],[594,226],[420,285],[307,316],[142,340],[122,340],[115,328],[117,303],[111,264],[99,208],[90,198],[80,195],[76,187],[80,165],[64,107],[49,85],[45,71],[55,58],[76,53],[145,32],[193,21],[205,24],[207,34],[201,43],[180,49],[122,57],[99,66],[89,79],[85,101],[90,143],[97,174],[111,185],[248,170],[268,160],[285,159],[296,169],[302,204],[316,242],[332,263],[354,273],[385,274],[425,268]]},
 newyork:{length:2320,points:[[675,515],[963,515],[980,508],[985,492],[977,477],[944,451],[940,440],[979,395],[990,391],[1002,398],[1068,461],[1077,477],[1070,494],[1048,519],[1029,529],[1004,533],[369,533],[353,540],[350,556],[345,567],[333,574],[321,570],[315,559],[267,447],[258,420],[255,390],[255,221],[272,143],[274,124],[267,111],[256,106],[153,73],[34,29],[28,20],[32,11],[43,9],[149,36],[211,46],[263,49],[332,60],[344,70],[340,93],[323,197],[316,209],[278,226],[270,237],[270,407],[278,439],[295,474],[319,497],[346,509],[389,517]]}
};
function rounded(raw,length){
 const p=raw.map(q=>new Vector2(...q)),perimeter=p.reduce((s,q,i)=>s+q.distanceTo(p[(i+1)%p.length]),0),scale=length/perimeter;
 // Round sharp map vertices at a physically drivable radius, preserving straight sections.
 const out=[];
 for(let i=0;i<p.length;i++){
  const prev=p[(i+p.length-1)%p.length],q=p[i],next=p[(i+1)%p.length],u=prev.clone().sub(q).normalize(),v=next.clone().sub(q).normalize();
  const angle=Math.acos(Math.max(-1,Math.min(1,u.dot(v)))),d=Math.min(14/scale/Math.max(.1,Math.tan(angle/2)),q.distanceTo(prev)*.38,q.distanceTo(next)*.38);
  const a=q.clone().addScaledVector(u,d),b=q.clone().addScaledVector(v,d);
  for(let j=0;j<=8;j++){const t=j/8;out.push(a.clone().multiplyScalar((1-t)**2).addScaledVector(q,2*t*(1-t)).addScaledVector(b,t*t));}
 }
 const center=p.reduce((s,q)=>s.add(q),new Vector2()).divideScalar(p.length);
 return smooth(out.map(q=>q.sub(center).multiplyScalar(scale).toArray()),length);
}
function smooth(raw,length){
 const clean=raw.filter((p,i)=>!i||Math.hypot(p[0]-raw[i-1][0],p[1]-raw[i-1][1])>.03);
 const c=new CatmullRomCurve3(clean.map(([x,z])=>new Vector3(x,0,z)),true,'centripetal');c.arcLengthDivisions=100000;
 const n=Math.ceil(length/2),p=Array.from({length:n},(_,i)=>c.getPointAt(i/n));
 // Suppress map-pixel stair steps and abrupt joins, using a 5 m Gaussian kernel.
 return p.map((_,i)=>{const q=new Vector3();let sum=0;for(let j=-8;j<=8;j++){const w=Math.exp(-.5*(j/2.5)**2);q.addScaledVector(p[(i+j+n)%n],w);sum+=w;}q.divideScalar(sum);return [+q.x.toFixed(4),+q.z.toFixed(4)];});
}
const layouts=JSON.parse(fs.readFileSync('src/circuits/layouts.json'));
for(const [key,data]of Object.entries(routes))layouts[key]={length:data.length,points:rounded(data.points,data.length)};
const geo=JSON.parse(fs.readFileSync('public/circuits/source-long-beach.geojson')).features.find(f=>f.properties.role==='outline').geometry.coordinates;
const origin=geo[0],p=geo.map(([lon,lat])=>[(lon-origin[0])*111320*Math.cos(origin[1]*Math.PI/180),-(lat-origin[1])*111320]);
if(Math.hypot(p.at(-1)[0],p.at(-1)[1])<.1)p.pop();
layouts.la={length:3167,points:smooth(p,3167)};
fs.writeFileSync('src/circuits/layouts.json',JSON.stringify(layouts));
// Public data download satisfies attribution/share-alike availability without licensing game code.
fs.writeFileSync('public/circuits/city-layouts.json',JSON.stringify(Object.fromEntries([...Object.keys(routes),'la'].map(k=>[k,layouts[k]]))));
