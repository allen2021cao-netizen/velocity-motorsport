import fs from 'node:fs';
import {Vector3,CatmullRomCurve3} from 'three';
const output={};
for(const [key,length]of [['bathurst',6213],['phillip',4445]]){
 const data=JSON.parse(fs.readFileSync(`public/circuits/source-${key}.geojson`));
 const raw=data.features.find(f=>f.properties.name==='trackinner').geometry.coordinates;
 const [lon,lat]=raw[0];
 const pts=raw.map(([x,z,y])=>new Vector3((x-lon)*111320*Math.cos(lat*Math.PI/180),key==='bathurst'?y:0,-(z-lat)*111320));
 if(pts[0].distanceTo(pts.at(-1))<2)pts.pop();
 // The published inner edge preserves the actual route; shift toward road centre.
 const base=new CatmullRomCurve3(pts,true,'centripetal');base.arcLengthDivisions=24000;
 const n=Math.ceil(length/5),low=Math.min(...pts.map(p=>p.y)),high=Math.max(...pts.map(p=>p.y));
 const p=Array.from({length:n},(_,i)=>{const u=i/n,q=base.getPointAt(u),t=base.getTangentAt(u);q.x+=t.z*5;q.z-=t.x*5;
  if(key==='bathurst')q.y=(q.y-low)/(high-low)*174;
  else q.y=40+14*Math.cos(u*Math.PI*2)+5*Math.sin(u*Math.PI*4); // authored coastal undulations, not surveyed elevations
  return q;
 });
 // Smooth only elevation noise; do not flatten the mountain or erase corners.
 for(let pass=0;pass<4;pass++){const before=p.map(q=>q.clone());p.forEach((q,i)=>{q.x=0;q.z=0;for(let j=-2;j<=2;j++){const k=(i+j+n)%n,w=j===0?4:Math.abs(j)===1?2:1;q.x+=before[k].x*w/10;q.z+=before[k].z*w/10;}});}
 for(let pass=0;pass<70;pass++){const y=p.map(q=>q.y);p.forEach((q,i)=>q.y=(y[(i-1+n)%n]+2*y[i]+y[(i+1)%n])/4);}
 if(key==='bathurst'){const lo=Math.min(...p.map(q=>q.y)),hi=Math.max(...p.map(q=>q.y));p.forEach(q=>q.y=(q.y-lo)/(hi-lo)*174);}
 const curve=new CatmullRomCurve3(p,true,'centripetal');curve.arcLengthDivisions=16000;
 for(let j=0;j<5;j++){const s=length/curve.getLength();p.forEach(q=>{q.x*=s;q.z*=s;});curve.updateArcLengths();}
 output[key]={length,closed:true,points:p.map(q=>q.toArray())};
 console.log(key,{length:curve.getLength(),height:[Math.min(...p.map(q=>q.y)),Math.max(...p.map(q=>q.y))],rawHeight:[low,high]});
}
for(const path of ['src/circuits/australian-layouts.json','public/circuits/australian-layouts.json'])fs.writeFileSync(path,JSON.stringify(output));
