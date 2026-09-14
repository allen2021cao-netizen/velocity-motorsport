import fs from 'node:fs';
// Original procedural sound design, not OEM recordings. Integer-frequency partials
// make a two-second periodic loop without repeated throttle sweeps or crossfade bumps.
const sr=32000,n=sr*2;
for(const [name,cylinders,rolloff,seed] of [['f40-high-v3',8,1.15,19],['veneno-high-v3',12,.95,71]]){
 const x=new Float64Array(n),firing=6000/120*cylinders;
 let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 for(let h=1;h*firing<6200;h++){
  const hz=h*firing,phase=random()*Math.PI*2;
  const weight=(cylinders===8?(h%2?1:.55):1)/Math.pow(h,rolloff)/(1+(hz/2700)**4);
  for(let i=0;i<n;i++)x[i]+=weight*Math.sin(2*Math.PI*hz*i/sr+phase);
 }
 // Distributed intake/exhaust texture, with no single whistle or moving rev envelope.
 for(let hz=100;hz<4800;hz+=17){const phase=random()*Math.PI*2,amp=.012/(1+(hz/2200)**2);for(let i=0;i<n;i++)x[i]+=amp*Math.sin(2*Math.PI*hz*i/sr+phase);}
 const rms=Math.sqrt(x.reduce((s,v)=>s+v*v,0)/n),gain=.17/rms;
 const b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
 let peak=0;for(let i=0;i<n;i++){peak=Math.max(peak,Math.abs(x[i]*gain));b.writeInt16LE(Math.round(x[i]*gain*32767),44+i*2);}fs.writeFileSync('public/audio/'+name+'.wav',b);console.log({name,referenceRpm:6000,firingHz:firing,rms:.17,peak});
}
