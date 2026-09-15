import fs from 'node:fs';
import {Vector3,CatmullRomCurve3} from 'three';
const red=JSON.parse(fs.readFileSync('public/circuits/source-redbull.geojson'));
const rawRed=red.features[0].geometry.coordinates;
const rawArosa=JSON.parse(fs.readFileSync('public/circuits/source-arosa-route.json')).routes[0].geometry.coordinates;
const result={};
for(const [key,raw,length,closed] of [['redbull',rawRed,4318,true],['arosa',rawArosa,7300,false]]){
 const [lon,lat]=raw[0],pts=raw.map(([x,y])=>new Vector3((x-lon)*111320*Math.cos(lat*Math.PI/180),0,-(y-lat)*111320));
 if(closed&&pts[0].distanceTo(pts.at(-1))<1)pts.pop();
 const clean=pts.filter((p,i)=>!i||p.distanceTo(pts[i-1])>.5);
 const c=new CatmullRomCurve3(clean,closed,'centripetal');c.arcLengthDivisions=40000;
 const n=Math.ceil(length/5),p=Array.from({length:n+Number(!closed)},(_,i)=>c.getPointAt(i/n));
 // Light map-noise smoothing; retain actual road bends. Elevation is an authored
 // profile, not survey data: Arosa includes a 1.2 km descent and net +422 m.
 const profile=key==='arosa'?[[0,0],[.164,-58],[.28,-2],[.5,137],[.73,284],[1,422]]:[[0,0],[.1,18],[.33,65],[.48,48],[.64,16],[.8,4],[1,0]];
 function height(u){let j=1;while(j<profile.length-1&&profile[j][0]<u)j++;const [x,y]=profile[j-1],[xx,yy]=profile[j];const t=(u-x)/(xx-x);return y+(yy-y)*t;}
 const sm=p.map((q,i)=>{const v=new Vector3();let w=0;for(let j=-2;j<=2;j++){const k=closed?(i+j+p.length)%p.length:Math.max(0,Math.min(p.length-1,i+j)),a=j===0?4:Math.abs(j)===1?2:1;v.addScaledVector(p[k],a);w+=a;}return v.divideScalar(w);});
 const flat=new CatmullRomCurve3(sm,closed,'centripetal');flat.arcLengthDivisions=20000;const scale=length/flat.getLength();
 const elevated=sm.map((q,i)=>new Vector3(q.x*scale,height(i/n),q.z*scale));
 const finalCurve=new CatmullRomCurve3(elevated,closed,'centripetal');finalCurve.arcLengthDivisions=16000;
 for(let j=0;j<4;j++){const k=length/finalCurve.getLength();elevated.forEach(q=>{q.x*=k;q.z*=k;});finalCurve.updateArcLengths();}
 result[key]={length,closed,points:elevated.map(q=>q.toArray())};
}
fs.writeFileSync('src/circuits/alpine-layouts.json',JSON.stringify(result));
fs.writeFileSync('public/circuits/alpine-layouts.json',JSON.stringify(result));
