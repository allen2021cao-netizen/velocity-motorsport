import {ENGINE_BANKS,AUDIO_ASSETS,engineBlend,highBlend} from './engine-banks';
import {ENGINE_PROFILES,advancePowertrain,type Powertrain,type EngineProfile} from './audio-dynamics';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
interface Frame {active:boolean;type:string;top:number;speed:number;throttle:number;brake:number;slip:number;wet:number;camera:number;countdown:boolean;fuel:number;opponents:{x:number;z:number;speed:number;type:string}[];}
interface Voice {waveKey?:string;osc:OscillatorNode;sub:OscillatorNode;filter:BiquadFilterNode;gain:GainNode;pan:StereoPannerNode;}
/** Layered designed engine audio. Source library clips are AI SFX, not exact car recordings. */
export class RaceAudio {
 private bus:GainNode;private engineBus:GainNode;private filter:BiquadFilterNode;private synth:Voice;private rivals:Voice[]=[];
 private noise:AudioBuffer;private wind:GainNode;private road:GainNode;private scrub:GainNode;private pads:GainNode;
 private samples=new Map<string,{source:AudioBufferSourceNode;gain:GainNode}>();private buffers=new Map<string,AudioBuffer>();
 private train:Powertrain={gear:1,rpm:850,shift:0,cooldown:0};private type='';private lastThrottle=0;private lastHit=-10;private running=false;private wasCountdown=false;
 private loaded:string[]=[];private failed:string[]=[];private effects:GainNode;private current:Frame|null=null;
 constructor(private ac:AudioContext,master:AudioNode){
  this.bus=ac.createGain();this.bus.gain.value=0;const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=12;limiter.ratio.value=6;limiter.attack.value=.004;limiter.release.value=.16;this.bus.connect(limiter);limiter.connect(master);
  this.filter=ac.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=12000;this.filter.connect(this.bus);
  this.engineBus=ac.createGain();this.engineBus.connect(this.filter);this.effects=ac.createGain();this.effects.connect(this.filter);
  this.noise=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const data=this.noise.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)*.995;data[i]=brown;}
  this.synth=this.voice(this.engineBus);for(let i=0;i<3;i++)this.rivals.push(this.voice(this.bus));
  this.wind=this.noiseLoop('highpass',650,.5);this.road=this.noiseLoop('lowpass',380,.6);this.scrub=this.noiseLoop('bandpass',1800,2);this.pads=this.noiseLoop('bandpass',2600,.6);
  for(const name of AUDIO_ASSETS)void this.load(name);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.silence();});
 }
 private smooth(param:AudioParam,value:number,time=.055){param.setTargetAtTime(value,this.ac.currentTime,time);}
 private voice(destination:AudioNode):Voice{const a=this.ac,o=a.createOscillator(),sub=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),pan=a.createStereoPanner();const real=new Float32Array(24),imag=new Float32Array(24);for(let i=1;i<24;i++)imag[i]=1/Math.pow(i,1.3)*(i%2?.9:.55);o.setPeriodicWave(a.createPeriodicWave(real,imag));sub.type='sine';f.type='lowpass';f.Q.value=.55;g.gain.value=0;o.connect(f);sub.connect(f);f.connect(g);g.connect(pan);pan.connect(destination);o.start();sub.start();return {osc:o,sub,filter:f,gain:g,pan};}
 private noiseLoop(type:BiquadFilterType,hz:number,q:number){const s=this.ac.createBufferSource(),f=this.ac.createBiquadFilter(),g=this.ac.createGain();s.buffer=this.noise;s.loop=true;f.type=type;f.frequency.value=hz;f.Q.value=q;g.gain.value=0;s.connect(f);f.connect(g);g.connect(this.effects);s.start();return g;}
 private async load(name:string){try{const r=await fetch('/audio/'+name+'.wav');if(!r.ok)throw Error(String(r.status));const buffer=await this.ac.decodeAudioData(await r.arrayBuffer());this.buffers.set(name,buffer);if(name!=='impact'&&name!=='shift'){const source=this.ac.createBufferSource(),gain=this.ac.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);if(name==='tire'||name==='road'){const filter=this.ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=name==='tire'?4200:1800;gain.connect(filter);filter.connect(this.effects);}else{const filter=this.ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=Object.values(ENGINE_BANKS).find(b=>b.file===name||b.high?.file===name)?.cutoff||2200;filter.Q.value=.55;gain.connect(filter);filter.connect(this.engineBus);}source.start();this.samples.set(name,{source,gain});}this.loaded.push(name);}catch{this.failed.push(name);}}
 silence(){this.running=false;this.smooth(this.bus.gain,0,.018);}
 impact(amount:number){if(!this.running||this.ac.currentTime-this.lastHit<.16)return;this.lastHit=this.ac.currentTime;this.oneShot('impact',clamp(amount,.03,.8)*.85,.93+Math.random()*.12,.65);}
 private oneShot(name:string,gain:number,rate=1,duration=1){const a=this.ac,s=a.createBufferSource(),g=a.createGain();s.buffer=this.buffers.get(name)||this.noise;s.playbackRate.value=rate;g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);s.connect(g);g.connect(this.effects);s.start();s.stop(a.currentTime+duration+.02);s.onended=()=>{s.disconnect();g.disconnect();};}
 update(frame:Frame,dt:number){const newRace=frame.countdown&&!this.wasCountdown;this.wasCountdown=frame.countdown;this.current=frame;if(!frame.active||document.hidden){this.silence();return;}const a=this.ac,p=ENGINE_PROFILES[frame.type]||ENGINE_PROFILES['458'];
  if(this.type!==frame.type||newRace){this.type=frame.type;this.train={gear:1,rpm:p.idle,shift:0,cooldown:.2};this.lastThrottle=frame.throttle;}
  this.running=true;this.smooth(this.bus.gain,1,.05);const change=advancePowertrain(this.train,frame.speed,frame.throttle,frame.top,p,dt,frame.countdown);
  if(change)this.oneShot('shift',change>0?.22:.15,change>0?1:.9,.16);
  if(this.lastThrottle>.65&&frame.throttle<.2&&this.train.rpm>p.redline*.5&&p.turbo){const release=frame.type==='r34'?[.12,1.9,.18]:frame.type==='supra'?[.15,1.35,.27]:frame.type==='m3'?[.06,1.65,.12]:[.10*p.turbo,1.7,.24];this.oneShot('air',release[0],release[1],release[2]);}this.lastThrottle=frame.throttle;
  const n=clamp((this.train.rpm-p.idle)/(p.redline-p.idle),0,1),speed=Math.abs(frame.speed),load=clamp(frame.throttle,0,1),alive=frame.fuel>0?1:0;
  this.smooth(this.filter.frequency,frame.camera===1?3600:frame.camera===2?8200:14000,.16);
  const bank=ENGINE_BANKS[p.family],blend=engineBlend(this.train.rpm,bank.rpm),high=highBlend(this.train.rpm,bank.high),highMix=bank.high&&this.samples.has(bank.high.file)?high.mix:0,available=this.samples.has(bank.file),shiftDip=this.train.shift>0?.45:1;
  this.smooth(this.engineBus.gain,alive*(frame.camera===1?.82:1)*shiftDip,.025);
  const sampleMix=bank.designed?blend.sample:1;
  this.tune(this.synth,p,this.train.rpm,(available?(bank.designed?(p.family==='porscheBoxer'?.015:.045)*(1-highMix*.75)+(1-sampleMix)*.055:.025):.15)*(.4+load*.6),0);
  for(const [name,v]of this.samples){if(name==='tire'||name==='road')continue;
   const isHigh=name===bank.high?.file;
   const idle=name==='mclaren-idle-v2'&&p.family==='mclarenV12';
   this.smooth(v.source.playbackRate,isHigh?high.rate:idle?clamp(this.train.rpm/1100,.75,1.7):bank.designed?blend.rate:(.58+n*1.24)*p.pitch,.07);
   this.smooth(v.gain.gain,idle?(1-sampleMix)*.28:(isHigh||name===bank.file)?(.10+load*.19+n*.035)*p.body*sampleMix*(isHigh?highMix:1-highMix):0,.10);
  }
  this.smooth(this.synth.filter.frequency,bank.designed?450+n*1800+load*650:350+n*3000+load*1600);
  const slip=clamp((frame.slip-.7)/8,0,1)*clamp(speed/6,0,1);
  const tire=this.samples.get('tire');if(tire){this.smooth(tire.gain.gain,slip*.20*(1-frame.wet*.35));this.smooth(tire.source.playbackRate,.88+slip*.23,.1);}
  this.smooth(this.scrub.gain,slip*(tire?.08:.5));this.smooth(this.pads.gain,frame.brake*.04*clamp(speed/15,0,1));this.smooth(this.wind.gain,clamp(speed/80,0,1)**2*(frame.camera===1?.24:.7));const rolling=this.samples.get('road');if(rolling){this.smooth(rolling.gain.gain,clamp(speed/65,0,1)*.10);this.smooth(rolling.source.playbackRate,.7+clamp(speed/90,0,1)*.7);}this.smooth(this.road.gain,clamp(speed/50,0,1)*(.04+frame.wet*.2));
  const near=frame.opponents.filter(o=>Math.hypot(o.x,o.z)<100).sort((x,y)=>Math.hypot(x.x,x.z)-Math.hypot(y.x,y.z)).slice(0,3);
  this.rivals.forEach((v,i)=>{const other=near[i];if(!other){this.smooth(v.gain.gain,0);return;}const profile=ENGINE_PROFILES[other.type]||p,d=Math.hypot(other.x,other.z);const closing=(other.speed-frame.speed)*(-other.z/Math.max(d,1));const doppler=clamp(343/(343-closing),.8,1.25);this.tune(v,profile,(profile.idle+(profile.redline-profile.idle)*clamp(Math.abs(other.speed)/80,.15,.9))*doppler,.075/(1+(d/12)**2),clamp(other.x/14,-.9,.9));});
 }
 private tune(v:Voice,p:EngineProfile,rpm:number,gain:number,pan:number){
 if(v.waveKey!==p.family){const real=new Float32Array(24),imag=new Float32Array(24);for(let i=1;i<24;i++){const shape=p.family==='porscheBoxer'?(i%2?1:.65):p.family==='nissanRB26'?(i<4?.85:.5):p.family==='toyota2JZ'?(i%2?1:.38):p.family==='bmwS58'?(i<3?.8:.6):p.family==='ferrari458'?(i%2?.85:.7):p.family==='ferrariF40'?(i%2?1:.32):p.family==='audiV10'?(i%3===0?.8:.48):p.family==='lamboV12'?(i%2?.7:.55):p.family==='mclarenV12'?(i<5?.9:.30):(i%2?.9:.55);imag[i]=shape/Math.pow(i,ENGINE_BANKS[p.family].designed?1.65:1.3);}v.osc.setPeriodicWave(this.ac.createPeriodicWave(real,imag));v.waveKey=p.family;}
 const f=rpm/60*p.cylinders/2;this.smooth(v.osc.frequency,f,.06);this.smooth(v.sub.frequency,f*.5,.06);this.smooth(v.filter.frequency,800+rpm*.32);this.smooth(v.gain.gain,gain,.08);this.smooth(v.pan.pan,pan,.1);}
 snapshot(){return {loaded:[...this.loaded],failed:[...this.failed],active:this.running,gear:this.train.gear,rpm:this.train.rpm,shift:this.train.shift,family:ENGINE_PROFILES[this.type]?.family,camera:this.current?.camera};}
}
