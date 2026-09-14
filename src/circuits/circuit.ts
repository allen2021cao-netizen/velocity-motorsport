import * as T from 'three';
import layouts from './layouts.json';
export const CIRCUITS:Record<string,{name:string;en:string;length:number;turns:number;halfWidth:number;description:string;source:string}>={
 shanghai:{name:'上海国际赛车场',en:'SHANGHAI INTERNATIONAL',length:5451,turns:16,halfWidth:8,description:'连续收紧弯 · 高速组合弯 · 长直道重刹',source:'https://www.formula1.com/en/racing/2026/china'},
 monaco:{name:'蒙特卡洛街道赛道',en:'CIRCUIT DE MONACO',length:3337,turns:19,halfWidth:4.5,description:'低速发卡弯 · 海滨隧道 · 游艇港与泳池段',source:'https://www.formula1.com/en/racing/2026/monaco'},
 vegas:{name:'拉斯维加斯大道赛道',en:'LAS VEGAS STRIP CIRCUIT',length:6201,turns:17,halfWidth:8,description:'大道长直线 · Sphere 区域 · 夜间重刹弯',source:'https://www.formula1.com/en/racing/2026/las-vegas'},
 miami:{name:'迈阿密国际赛车场',en:'MIAMI INTERNATIONAL',length:5412,turns:19,halfWidth:6.5,description:'体育场园区 · 连续变向 · 长直道与低速组合弯',source:'https://www.formula1.com/en/racing/2026/miami'}
};
export function createTrackCurve(track:{theme:string;base:number;modes:number[][]}){
 const data=layouts[track.theme as keyof typeof layouts];let points:T.Vector3[];
 if(data){points=data.points.map(([x,z])=>new T.Vector3(x,0,z));if(track.theme==='monaco'){// Move the arbitrary GeoJSON seam onto the start straight before Sainte Devote.
 let total=0;const lengths=points.map((p,i)=>{if(i)total+=p.distanceTo(points[i-1]);return total;});const start=lengths.findIndex(d=>d>=total*.76);points=[...points.slice(start),...points.slice(0,start)];}
 }else{points=Array.from({length:18},(_,i)=>{const th=i/18*Math.PI*2;let r=track.base;for(const [k,a,p]of track.modes)r+=a*Math.sin(k*th+p);return new T.Vector3(r*Math.cos(th),0,r*Math.sin(th));});}
 const curve=new T.CatmullRomCurve3(points,true,data?'centripetal':'catmullrom',.6);curve.arcLengthDivisions=12000;
 if(data){const scale=data.length/curve.getLength();points.forEach(p=>p.multiplyScalar(scale));curve.updateArcLengths();}
 return curve;
}

/** Preserve acute corners in the existing 14-segment AI curvature contract. */
export function circuitCurvature(tangents:T.Vector3[]){return tangents.map((_,i)=>{let peak=0;for(let k=0;k<14;k++)peak=Math.max(peak,tangents[(i+k)%tangents.length].angleTo(tangents[(i+k+1)%tangents.length]));return peak*14;});}
