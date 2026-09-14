import fs from 'node:fs';
// Original boxer-six sound design. Shared engine orders avoid mismatched AI RPM anchors.
// Six-second periodic buffers contain an integer number of crank revolutions.
const rate=32000,n=rate*6,reports=[];
for(const [name,rpm] of [['p911-mid-v5',3500],['p911-high-v5',6200]]){
 const x=new Float64Array(n),crank=rpm/60;
 for(let order=1;order<=72;order++){
  const hz=crank*order;if(hz>6500)break;
  const combustion=order%3===0;
  const weight=(combustion?1:.045)/Math.pow(Math.max(1,order/3),.92)/(1+(hz/2600)**4);
  const phase=Math.sin(order*17.13)*2;
  for(let i=0;i<n;i++){
   const t=i/rate;
   // Gentle, periodic combustion texture; no baked-in acceleration or pitch sweep.
   const modulation=1+.025*Math.sin(2*Math.PI*.5*t+order)+.015*Math.sin(2*Math.PI*1.5*t+order*.7);
   x[i]+=weight*modulation*Math.sin(2*Math.PI*hz*t+phase);
  }
 }
 // Low-level diffuse mechanical texture, avoiding a dominant electric whistle.
 for(let hz=180;hz<4200;hz+=19){const phase=Math.sin(hz)*3,weight=.003/(1+(hz/1800)**2);for(let i=0;i<n;i++)x[i]+=weight*Math.sin(2*Math.PI*hz*i/rate+phase);}
 const rms=Math.sqrt(x.reduce((s,v)=>s+v*v,0)/n),gain=.145/rms;
 const b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
 let peak=0;for(let i=0;i<n;i++){peak=Math.max(peak,Math.abs(x[i]*gain));b.writeInt16LE(Math.round(x[i]*gain*32767),44+i*2);}
 fs.writeFileSync('public/audio/'+name+'.wav',b);reports.push({name,rpm,firingHz:crank*3,peak,rms:rms*gain,seconds:6,seam:Math.abs(x[0]-x[n-1])*gain});
}
fs.writeFileSync('tools/porsche-audio-audit.json',JSON.stringify(reports,null,2));console.log(reports);
