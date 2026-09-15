import {blend,clamp,type ReviewFrame} from './model';
import type {ReviewProfile} from './profiles';
type Layer={source:AudioBufferSourceNode;gain:GainNode};
/** Approved shared engine used by racing and the audition page. */
export class ReviewEngine {
 private out:GainNode;private tone:BiquadFilterNode;private body:GainNode;private osc:OscillatorNode;
 private mid?:Layer;private high?:Layer;private pending=0;private current?:ReviewProfile;
 private noise:AudioBuffer;private effects:Record<string,GainNode>={};private room:GainNode;private rival:GainNode;private pan:StereoPannerNode;private induction:GainNode;
 private buffers=new Map<string,Promise<AudioBuffer>>();private running=false;
 constructor(private ac:AudioContext,master:AudioNode){
  this.out=ac.createGain();this.out.gain.value=0;
  const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-5;limiter.knee.value=4;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.12;
  this.out.connect(limiter);limiter.connect(master);
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=38;hp.Q.value=.7;hp.connect(this.out);
  this.tone=ac.createBiquadFilter();this.tone.type='lowpass';this.tone.frequency.value=3600;this.tone.Q.value=.55;
  const harsh=ac.createBiquadFilter();harsh.type='peaking';harsh.frequency.value=2800;harsh.Q.value=.8;harsh.gain.value=-4;
  const warmth=ac.createBiquadFilter();warmth.type='lowshelf';warmth.frequency.value=260;warmth.gain.value=2;
  this.tone.connect(harsh);harsh.connect(warmth);warmth.connect(hp);
  this.body=ac.createGain();this.body.gain.value=0;this.osc=ac.createOscillator();this.osc.connect(this.body);this.body.connect(this.tone);this.osc.start();
  // Fixed-rate seeded noise assets: no mobile/desktop branches, no Math.random().
  this.noise=ac.createBuffer(1,96000,48000);const data=this.noise.getChannelData(0);let seed=19371,low=0;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;low=.94*low+.06*(seed/2147483648-1);data[i]=low*2;}
  // A short periodic seam correction prevents a repeated noise-loop tick.
  const seam=data[data.length-1]-data[0];for(let i=0;i<2400;i++)data[i]+=seam*(.5+.5*Math.cos(Math.PI*i/2400));
  const fx=(name:string,type:BiquadFilterType,hz:number,q=.7)=>{const s=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();s.buffer=this.noise;s.loop=true;filter.type=type;filter.frequency.value=hz;filter.Q.value=q;g.gain.value=0;s.connect(filter);filter.connect(g);g.connect(this.out);s.start();this.effects[name]=g;return g;};
  fx('wind','lowpass',900);fx('road','bandpass',260);fx('curb','bandpass',140,1.5);fx('grass','lowpass',750);fx('wet','bandpass',1700);fx('grip','bandpass',950,2.5);this.induction=fx('induction','bandpass',1250);
  this.room=ac.createGain();this.room.gain.value=0;this.room.connect(this.out);
  for(const [time,level] of [[.047,.42],[.083,.26],[.139,.13]]){const d=ac.createDelay(.2),f=ac.createBiquadFilter(),g=ac.createGain();d.delayTime.value=time;f.type='lowpass';f.frequency.value=2100;g.gain.value=level;this.tone.connect(d);d.connect(f);f.connect(g);g.connect(this.room);}
  this.rival=ac.createGain();this.rival.gain.value=0;this.pan=ac.createStereoPanner();this.tone.connect(this.rival);this.rival.connect(this.pan);this.pan.connect(this.out);
 }
 private smooth(p:AudioParam,value:number,time=.045){p.setTargetAtTime(value,this.ac.currentTime,time);}
 private buffer(path:string){let result=this.buffers.get(path);if(!result){result=fetch(path).then(async r=>{if(!r.ok)throw Error('音源加载失败，请重试');return this.ac.decodeAudioData(await r.arrayBuffer());}).catch(e=>{this.buffers.delete(path);throw e;});this.buffers.set(path,result);}return result;}
 async select(p:ReviewProfile){
  const token=++this.pending;this.running=false;this.smooth(this.out.gain,0,.012);
  const [mid,high]=await Promise.all(['mid','high'].map(layer=>this.buffer(`/audio/review-v1/${p.id}-${layer}.wav`)));
  if(token!==this.pending)return false;
  for(const g of [...Object.values(this.effects),this.room,this.rival,this.body]){g.gain.cancelScheduledValues(this.ac.currentTime);g.gain.setValueAtTime(0,this.ac.currentTime);}
  for(const layer of [this.mid,this.high]){layer?.source.stop();layer?.source.disconnect();layer?.gain.disconnect();}
  const make=(buffer:AudioBuffer):Layer=>{const source=this.ac.createBufferSource(),gain=this.ac.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.tone);source.start();return {source,gain};};
  this.mid=make(mid);this.high=make(high);this.current=p;
  const real=new Float32Array(65),imag=new Float32Array(65);
  // Four-stroke cycle; layout affects exhaust pulse balance, not just pitch.
  for(let h=1;h<65;h++){
   let sum=0;for(let c=0;c<p.cylinders;c++){const weight=p.layout==='crossV8'?[1,.64,.92,.72,1,.72,.86,.62][c]:p.layout==='boxer'?(c%2?.82:1):1;sum+=weight*Math.cos(2*Math.PI*h*c/p.cylinders);}
   const resonance=(h===p.cylinders?1.3:1);imag[h]=(sum/p.cylinders+.07*Math.sin(h*1.7))*Math.exp(-h/18)*resonance;
  }
  this.osc.frequency.cancelScheduledValues(this.ac.currentTime);this.osc.frequency.setValueAtTime(p.idle/120,this.ac.currentTime);this.osc.setPeriodicWave(this.ac.createPeriodicWave(real,imag));return true;
 }
 update(frame:ReviewFrame,windEnabled=true){
  const p=this.current;if(!p||!this.mid||!this.high)return;this.running=true;const mix=blend(p,frame.rpm);
  this.smooth(this.out.gain,.9);this.smooth(this.tone.frequency,p.cutoff-frame.load*250);
  this.smooth(this.mid.source.playbackRate,mix.midRate);this.smooth(this.high.source.playbackRate,mix.highRate);
  const loud=(.40+frame.load*.46)*p.body*frame.shift;
  this.smooth(this.mid.gain.gain,loud*mix.mid);this.smooth(this.high.gain.gain,loud*mix.high);
  this.smooth(this.osc.frequency,frame.rpm/120);
  this.smooth(this.body.gain,(.028+mix.idle*.085)*p.body*(.5+frame.load*.5)*frame.shift);
  this.smooth(this.effects.wind.gain,windEnabled?frame.wind:0);this.smooth(this.effects.road.gain,clamp(frame.speed/80)*.055);
  this.smooth(this.effects.curb.gain,frame.curb*.21);this.smooth(this.effects.grass.gain,frame.grass*.18);this.smooth(this.effects.wet.gain,frame.wet*.15);this.smooth(this.effects.grip.gain,frame.grip*.14);
  this.smooth(this.induction.gain,p.induction==='turbo'?(frame.load*.025+frame.release*.12):p.induction==='supercharger'?frame.load*.035:0);
  this.smooth(this.room.gain,frame.tunnel*.28);this.smooth(this.rival.gain,frame.rival*.35);this.smooth(this.pan.pan,frame.pan);
 }
 stop(){this.running=false;++this.pending;this.smooth(this.out.gain,0,.012);}
 get active(){return this.running;}
}

