import * as T from 'three';
import layouts from './layouts.json';
import alpineLayouts from './alpine-layouts.json';
import japaneseLayouts from './japanese-layouts.json';
import australianLayouts from './australian-layouts.json';
export const CIRCUITS:Record<string,{name:string;en:string;length:number;turns:number;halfWidth:number;description:string;source:string;pointToPoint?:boolean;mountain?:boolean}>={
 suzuka:{name:'铃鹿国际赛车场',en:'SUZUKA · JAPAN',length:5807,turns:18,halfWidth:6,mountain:true,description:'八字立交 · 连续 S 弯 · 130R 高速弯',source:'https://www.suzukacircuit.jp/eng/course_s/'},
 fuji:{name:'富士国际赛车场',en:'FUJI SPEEDWAY · JAPAN',length:4563,turns:16,halfWidth:7.5,mountain:true,description:'富士山背景 · 超长直道 · 重刹技术弯',source:'https://www.fsw.tv/'},
 bathurst:{name:'巴瑟斯特 · 全景山',en:'MOUNT PANORAMA · BATHURST',length:6213,turns:23,halfWidth:4.5,mountain:true,description:'174 m 高差 · 山顶连续弯 · Conrod 长直道',source:'https://www.bathurst.nsw.gov.au/Services/Facilities/Mount-Panorama/About-the-Mount/Track-Facts'},
 phillip:{name:'菲利普岛大奖赛赛道',en:'PHILLIP ISLAND GRAND PRIX CIRCUIT',length:4445,turns:12,halfWidth:6,mountain:true,description:'海岸草坡 · 高速长弯 · 起伏闭环',source:'https://www.phillipislandcircuit.com.au/circuit-info/circuit-map/'},
 redbull:{name:'红牛环',en:'RED BULL RING · AUSTRIA',length:4318,turns:10,halfWidth:7.5,mountain:true,description:'绕圈竞速 · 山坡起伏 · 长直道重刹',source:'https://www.redbullring.com/en/track/red-bull-ring-f1-motogp-track/'},
 arosa:{name:'阿罗萨山地赛',en:'LANGWIES → AROSA · SWITZERLAND',length:7300,turns:76,halfWidth:4.5,mountain:true,pointToPoint:true,description:'点到点 · 7.3 km / 净爬升 422 m · 山林与山镇',source:'https://www.arosaclassiccar.ch/de/rennen-und-event/situationsplan'},
 tokyo:{name:'东京湾岸街道赛道',en:'TOKYO BIG SIGHT · 2024',length:2585,turns:20,halfWidth:4.5,description:'东京国际展示场 · 湾岸街道 · 连续低速变向',source:'https://www.fiaformulae.com/en/news/493595/what-does-the-tokyo-formula-e-street-circuit-look-like'},
 dubai:{name:'迪拜赛车场 · 大奖赛布局',en:'DUBAI AUTODROME · GP',length:5390,turns:16,halfWidth:7,description:'Motor City · 高速长直道 · 沙漠与摩天楼',source:'https://dubaiautodrome.ae/about-us/'},
 la:{name:'长滩街道赛道',en:'LONG BEACH · LOS ANGELES METRO',length:3167,turns:11,halfWidth:5,description:'洛杉矶都会区 · 长滩 · 海岸大道与发卡弯',source:'https://www.indycar.com/Schedule/2025/Long-Beach'},
 london:{name:'伦敦 ExCeL 街道赛道',en:'LONDON EXCEL · 2023–24',length:2090,turns:20,halfWidth:4,description:'皇家码头 · 展馆街道 · 紧凑技术组合弯',source:'https://www.fia.com/news/seven-cup-destiny-season-10-crown-be-decided-london'},
 newyork:{name:'纽约布鲁克林街道赛道',en:'BROOKLYN RED HOOK · 2021–22',length:2320,turns:14,halfWidth:4,description:'红钩码头 · 港湾直道 · 曼哈顿天际线',source:'https://www.fiaformulae.com/en/championship/race-calendar/2021-2022/new-york-city'},
 paris:{name:'巴黎荣军院街道赛道',en:'PARIS LES INVALIDES · 2016–19',length:1930,turns:14,halfWidth:4.5,description:'荣军院街区 · 连续直角弯 · 塞纳河风貌',source:'https://new.abb.com/formula-e/2018-19/paris'},
 hongkong:{name:'香港中环海滨赛道',en:'HONG KONG CENTRAL · 2016–19',length:1860,turns:10,halfWidth:4,description:'中环海滨 · 维港长直道 · 紧凑发卡弯',source:'https://hkformulae.com/race-info/hk-circuit/'},
 shanghai:{name:'上海国际赛车场',en:'SHANGHAI INTERNATIONAL',length:5451,turns:16,halfWidth:8,description:'连续收紧弯 · 高速组合弯 · 长直道重刹',source:'https://www.formula1.com/en/racing/2026/china'},
 monaco:{name:'蒙特卡洛街道赛道',en:'CIRCUIT DE MONACO',length:3337,turns:19,halfWidth:4.5,description:'低速发卡弯 · 海滨隧道 · 游艇港与泳池段',source:'https://www.formula1.com/en/racing/2026/monaco'},
 vegas:{name:'拉斯维加斯大道赛道',en:'LAS VEGAS STRIP CIRCUIT',length:6201,turns:17,halfWidth:8,description:'大道长直线 · Sphere 区域 · 夜间重刹弯',source:'https://www.formula1.com/en/racing/2026/las-vegas'},
 miami:{name:'迈阿密国际赛车场',en:'MIAMI INTERNATIONAL',length:5412,turns:19,halfWidth:6.5,description:'体育场园区 · 连续变向 · 长直道与低速组合弯',source:'https://www.formula1.com/en/racing/2026/miami'}
};
export function createTrackCurve(track:{theme:string;base:number;modes:number[][]}){
 const alpine=japaneseLayouts[track.theme as keyof typeof japaneseLayouts]||alpineLayouts[track.theme as keyof typeof alpineLayouts]||australianLayouts[track.theme as keyof typeof australianLayouts];
 if(alpine){const p=alpine.points.map(([x,y,z])=>new T.Vector3(x,y,z));const c=new T.CatmullRomCurve3(p,alpine.closed,'centripetal');c.arcLengthDivisions=16000;return c;}
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
