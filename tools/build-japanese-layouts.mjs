import fs from 'node:fs';
import {Vector3,CatmullRomCurve3} from 'three';
const output={};
for(const [key,length]of [['suzuka',5807],['fuji',4563]]){
 const data=JSON.parse(fs.readFileSync(`public/circuits/source-${key}.geojson`));
 const raw=data.features.find(f=>f.properties.name==='trackinner').geometry.coordinates;
 const [lon,lat]=raw[0],project=([x,z])=>new Vector3((x-lon)*111320*Math.cos(lat*Math.PI/180),0,-(z-lat)*111320);
 let pts=raw.map(project);if(pts[0].distanceTo(pts.at(-1))<2)pts.pop();
 // Both published inner rings run opposite to the race direction.
 pts.reverse();
 const start=data.features.find(f=>f.properties.name==='start').geometry.coordinates.map(project),mid=start[0].clone().add(start[1]).multiplyScalar(.5);
 let seam=0;pts.forEach((p,i)=>{if(p.distanceTo(mid)<pts[seam].distanceTo(mid))seam=i;});pts=[...pts.slice(seam),...pts.slice(0,seam)];
 const base=new CatmullRomCurve3(pts,true,'centripetal');base.arcLengthDivisions=24000;
 const n=Math.ceil(length/5),p=Array.from({length:n},(_,i)=>base.getPointAt(i/n));
 for(let pass=0;pass<(key==='fuji'?32:8);pass++){const old=p.map(q=>q.clone());p.forEach((q,i)=>q.copy(old[(i+n-1)%n]).addScaledVector(old[i],2).add(old[(i+1)%n]).multiplyScalar(.25));}
 // Public maps have no altitude. Smooth game-authored profiles, not survey data.
 p.forEach((q,i)=>q.y=key==='fuji'?35+20*Math.cos(i/n*Math.PI*2)+8*Math.sin(i/n*Math.PI*4):25+13*Math.sin(i/n*Math.PI*2));
 let crossing;
 if(key==='suzuka')for(let i=0;i<n;i++)for(let j=i+50;j<n;j++){
  if(n-j+i<50)continue;const a=p[i],b=p[(i+1)%n],c=p[j],d=p[(j+1)%n],rx=b.x-a.x,rz=b.z-a.z,sx=d.x-c.x,sz=d.z-c.z,det=rx*sz-rz*sx;if(Math.abs(det)<1e-6)continue;
  const t=((c.x-a.x)*sz-(c.z-a.z)*sx)/det,u=((c.x-a.x)*rz-(c.z-a.z)*rx)/det;if(t<0||t>1||u<0||u>1)continue;
  const lower=i,upper=j,low=p[lower].y,delta=low+9-p[upper].y;
  p.forEach((q,k)=>{const distance=Math.min(Math.abs(k-upper),n-Math.abs(k-upper))*5;if(distance<250)q.y+=delta*(1+Math.cos(Math.PI*distance/250))*.5;});
  crossing={lower:lower/n,upper:upper/n};
 }
 const curve=new CatmullRomCurve3(p,true,'centripetal');curve.arcLengthDivisions=16000;
 for(let k=0;k<6;k++){const scale=length/curve.getLength();p.forEach(q=>{q.x*=scale;q.z*=scale;});curve.updateArcLengths();}
 output[key]={length,closed:true,points:p.map(q=>q.toArray()),...(crossing?{crossing}:{})};console.log(key,curve.getLength(),crossing);
}
for(const path of ['src/circuits/japanese-layouts.json','public/circuits/japanese-layouts.json'])fs.writeFileSync(path,JSON.stringify(output));


