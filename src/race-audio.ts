import {ReviewEngine} from './audio-review/engine';
import {reviewProfile,type ReviewProfile} from './audio-review/profiles';
import {clamp,type ReviewFrame} from './audio-review/model';
import {ENGINE_PROFILES,advancePowertrain,type Powertrain} from './audio-dynamics';
import {rivalFeedback,type surfaceFeedback} from './driving-feedback';
interface Frame {surface?:ReturnType<typeof surfaceFeedback>;grip?:number;active:boolean;type:string;top:number;speed:number;throttle:number;brake:number;slip:number;wet:number;camera:number;countdown:boolean;fuel:number;opponents:{x:number;z:number;speed:number;type:string}[];}
interface Slot {engine:ReviewEngine;gain:GainNode;pan:StereoPannerNode;type:string;ready:boolean;loading:boolean;retry:number;train:Powertrain;}
const train=(rpm=850):Powertrain=>({gear:1,rpm,shift:0,cooldown:.2});
/** Approved engine/mixing implementation shared by racing and the audition page. */
export class RaceAudio {
 private bus:GainNode;private perspective:BiquadFilterNode;private player:Slot;private rivals:Slot[]=[];
 private loaded=new Set<string>();private failed=new Set<string>();private clips=new Map<string,AudioBuffer>();
 private running=false;private current?:Frame;private countdown=false;private lastThrottle=0;private release=0;private phase=0;private lastHit=-10;
 constructor(private ac:AudioContext,master:AudioNode){
  this.bus=ac.createGain();this.bus.gain.value=0;this.perspective=ac.createBiquadFilter();this.perspective.type='lowpass';this.perspective.frequency.value=22000;this.perspective.Q.value=.5;
  const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-2;limiter.knee.value=3;limiter.ratio.value=12;limiter.attack.value=.002;limiter.release.value=.15;this.bus.connect(this.perspective);this.perspective.connect(limiter);limiter.connect(master);
  this.player=this.slot();for(const name of ['impact','shift'])void this.loadClip(name);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.silence();});
 }
 private slot():Slot {const gain=this.ac.createGain(),pan=this.ac.createStereoPanner();gain.gain.value=0;gain.connect(pan);pan.connect(this.bus);return {engine:new ReviewEngine(this.ac,gain),gain,pan,type:'',ready:false,loading:false,retry:0,train:train()};}
 private async loadClip(name:string){try{const r=await fetch('/audio/'+name+'.wav');if(!r.ok)throw Error();this.clips.set(name,await this.ac.decodeAudioData(await r.arrayBuffer()));this.loaded.add(name);}catch{this.failed.add(name);}}
 private ensure(s:Slot,p:ReviewProfile){if(s.type!==p.id){s.type=p.id;s.ready=false;s.loading=false;s.retry=0;s.train=train(p.idle);s.engine.stop();s.gain.gain.setTargetAtTime(0,this.ac.currentTime,.012);}if(s.ready||s.loading||this.ac.currentTime<s.retry)return;
  s.loading=true;const id=p.id;void s.engine.select(p).then(ok=>{if(s.type!==id)return;s.loading=false;s.ready=ok;if(ok)for(const layer of ['mid','high']){const key='review-v1/'+id+'-'+layer;this.loaded.add(key);this.failed.delete(key);}}).catch(()=>{if(s.type!==id)return;s.loading=false;s.retry=this.ac.currentTime+3;for(const layer of ['mid','high'])this.failed.add('review-v1/'+id+'-'+layer);});
 }
 private shot(name:string,volume:number,duration:number){const buffer=this.clips.get(name);if(!buffer||!this.running)return;const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=buffer;g.gain.setValueAtTime(volume,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,this.ac.currentTime+duration);s.connect(g);g.connect(this.bus);s.start();s.stop(this.ac.currentTime+duration);s.onended=()=>{s.disconnect();g.disconnect();};}
 silence(){this.running=false;this.bus.gain.setTargetAtTime(0,this.ac.currentTime,.012);}
 impact(amount:number){if(this.ac.currentTime-this.lastHit<.16)return;this.lastHit=this.ac.currentTime;this.shot('impact',clamp(amount,.03,.8)*.65,.6);}
 update(f:Frame,dt:number){this.current=f;if(!f.active||document.hidden){this.silence();return;}dt=clamp(dt,0,.1);this.running=true;this.bus.gain.setTargetAtTime(1,this.ac.currentTime,.04);
  const p=reviewProfile(f.type)||reviewProfile('458');this.ensure(this.player,p);
  if(f.countdown&&!this.countdown){this.player.train=train(p.idle);this.release=0;this.phase=0;this.lastThrottle=0;}this.countdown=f.countdown;
  const profile={...ENGINE_PROFILES[p.id],idle:p.idle,redline:p.redline,cylinders:p.cylinders};
  const shift=advancePowertrain(this.player.train,f.speed,f.throttle,f.top,profile,dt,f.countdown);if(shift)this.shot('shift',shift>0?.22:.15,.16);
  if(this.lastThrottle>.65&&f.throttle<.2&&this.player.train.rpm>p.mid&&p.induction==='turbo')this.release=1;else this.release*=Math.exp(-dt*11);this.lastThrottle=f.throttle;
  const speed=Math.abs(f.speed),moving=clamp(speed/12);this.phase=(this.phase+speed*dt*Math.PI*2/1.2)%(Math.PI*2);
  const frame:ReviewFrame={rpm:this.player.train.rpm,load:clamp(f.throttle),speed,gear:this.player.train.gear,shift:this.player.train.shift>0?.45:1,wind:clamp(speed/85)**2*.1,curb:(f.surface?.curb||0)*moving*(.6+.4*Math.sin(this.phase)**2),grass:(f.surface?.grass||0)*moving,wet:(f.surface?.wet??f.wet)*moving,grip:Math.max(f.grip||0,clamp((f.slip-.7)/8)*moving),tunnel:f.surface?.tunnel||0,rival:0,pan:0,release:this.release};
  if(this.player.ready)this.player.engine.update(frame);this.player.gain.gain.setTargetAtTime(this.player.ready&&f.fuel>0?1:0,this.ac.currentTime,.025);this.perspective.frequency.setTargetAtTime(f.camera===1?3300:22000,this.ac.currentTime,.15);
  for(let i=0;i<3;i++){const other=f.opponents[i];if(!other||Math.hypot(other.x,other.z)>=100){this.rivals[i]?.gain.gain.setTargetAtTime(0,this.ac.currentTime,.07);continue;}const s=this.rivals[i]??(this.rivals[i]=this.slot()),rp=reviewProfile(other.type)||p;this.ensure(s,rp);const direction=rivalFeedback(other.x,other.z),distance=Math.hypot(other.x,other.z);
   advancePowertrain(s.train,other.speed,.7,325,{...ENGINE_PROFILES[rp.id],idle:rp.idle,redline:rp.redline},dt,f.countdown);
   const closing=(other.speed-f.speed)*(-other.z/Math.max(distance,1)),doppler=clamp(343/(343-closing),.85,1.15);
   if(s.ready)s.engine.update({...frame,rpm:clamp(s.train.rpm*doppler,rp.idle,rp.redline),load:.7,speed:0,wind:0,curb:0,grass:0,wet:0,grip:0,tunnel:0,rival:0,release:0,shift:s.train.shift>0?.45:1});
   s.gain.gain.setTargetAtTime(s.ready?direction.gain*direction.rear*2:0,this.ac.currentTime,.07);s.pan.pan.setTargetAtTime(direction.pan,this.ac.currentTime,.06);
  }
 }
 snapshot(){return {loaded:[...this.loaded],failed:[...this.failed],active:this.running,gear:this.player.train.gear,rpm:this.player.train.rpm,shift:this.player.train.shift,family:reviewProfile(this.player.type)?.layout,version:'approved-v1',camera:this.current?.camera,surface:this.current?.surface,grip:this.current?.grip,rivals:this.current?.opponents.map(o=>rivalFeedback(o.x,o.z))};}
}
