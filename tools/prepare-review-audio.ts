import fs from 'node:fs';
import crypto from 'node:crypto';
import {REVIEW_PROFILES} from '../src/audio-review/profiles';
const root='artifacts/audio-review/sources',out='public/audio/review-v1';fs.mkdirSync(out,{recursive:true});
function read(path:string){const b=fs.readFileSync(path);let fmt:{format:number;channels:number;rate:number;bits:number}|undefined,raw:Buffer|undefined;for(let i=12;i+8<=b.length;){const size=b.readUInt32LE(i+4),id=b.toString('ascii',i,i+4);if(id==='fmt ')fmt={format:b.readUInt16LE(i+8),channels:b.readUInt16LE(i+10),rate:b.readUInt32LE(i+12),bits:b.readUInt16LE(i+22)};if(id==='data')raw=b.subarray(i+8,i+8+size);i+=8+size+(size%2);}if(!fmt||!raw||fmt.format!==1||fmt.bits!==16||fmt.rate!==48000)throw Error('Expected 48kHz PCM16 '+path);const x=new Float64Array(raw.length/2/fmt.channels);for(let i=0;i<x.length;i++)for(let c=0;c<fmt.channels;c++)x[i]+=raw.readInt16LE((i*fmt.channels+c)*2)/32768/fmt.channels;return x;}
function filter(x:Float64Array,hz:number,type:'hp'|'lp'|'peak',db=0){const w=2*Math.PI*hz/48000,c=Math.cos(w),alpha=Math.sin(w)/(2*.707),A=10**(db/40);let a0=1+alpha,a1=-2*c,a2=1-alpha,b0=(1-c)/2,b1=1-c,b2=b0;if(type==='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;}if(type==='peak'){a0=1+alpha/A;a1=-2*c;a2=1-alpha/A;b0=1+alpha*A;b1=-2*c;b2=1-alpha*A;}let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=x[i],y=(b0*v+b1*x1+b2*x2-a1*y1-a2*y2)/a0;x[i]=y;x2=x1;x1=v;y2=y1;y1=y;}}
const reports=[];
for(const p of REVIEW_PROFILES)for(const layer of ['mid','high']){
 const name=`${p.id}-${layer}`,path=`${root}/${name}.wav`;if(!fs.existsSync(path)){if(process.argv.includes('--partial'))continue;throw Error('Missing '+path);}
 const x=read(path);filter(x,42,'hp');filter(x,2800,'peak',-5);filter(x,p.cutoff+700,'lp');filter(x,p.cutoff+700,'lp');
 // Select a stable 3-second section. Avoid attacks and fading tails in generated candidates.
 const window=144000,fade=5760;let start=4800,best=Infinity;
 for(let at=4800;at+window+fade<x.length-1000;at+=2400){const rms=[];for(let j=at;j<at+window;j+=2400){let s=0;for(let k=j;k<j+2400;k++)s+=x[k]**2;rms.push(Math.sqrt(s/2400));}const avg=rms.reduce((s,v)=>s+v,0)/rms.length;const variance=Math.sqrt(rms.reduce((s,v)=>s+(v-avg)**2,0)/rms.length)/Math.max(avg,1e-9);if(variance<best){best=variance;start=at;}}
 const y=x.slice(start,start+window);for(let i=0;i<fade;i++){const t=i/fade,w=.5-.5*Math.cos(Math.PI*t);y[i]=x[start+window+i]*(1-w)+y[i]*w;}
 const rms=Math.sqrt(y.reduce((s,v)=>s+v*v,0)/y.length),peak=y.reduce((s,v)=>Math.max(s,Math.abs(v)),0);if(rms<.003)throw Error('Silent source '+name);
 const gain=Math.min(.21/rms,.78/peak),b=Buffer.alloc(44+y.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(48000,24);b.writeUInt32LE(96000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(y.length*2,40);for(let i=0;i<y.length;i++)b.writeInt16LE(Math.round(y[i]*gain*32767),44+i*2);fs.writeFileSync(`${out}/${name}.wav`,b);
 reports.push({name,rate:48000,duration:y.length/48000,rms:rms*gain,peak:peak*gain,seam:Math.abs(y[0]-y.at(-1)!)*gain,envelopeVariation:best,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha256:crypto.createHash('sha256').update(b).digest('hex')});
}
fs.writeFileSync(`${out}/audit.json`,JSON.stringify(reports,null,2));console.log(`Prepared ${reports.length} review-only loops`);
