import type {EngineFamily} from './audio-dynamics';
export const ENGINE_BANKS:Record<EngineFamily,{file:string;rpm:number;cutoff:number;designed?:boolean;high?:{file:string;rpm:number;start:number;end:number}}>={
 muscle:{file:'muscle',rpm:2500,cutoff:9000},six:{file:'six',rpm:3500,cutoff:9000},
 ferrari458:{file:'ferrari458-v2',rpm:3500,cutoff:4200,designed:true},
 ferrariF40:{file:'ferrari-f40-v2',rpm:4000,cutoff:3300,designed:true,high:{file:'f40-high-v3',rpm:6000,start:3900,end:5500}},
 audiV10:{file:'audi-v10-v2',rpm:4000,cutoff:3800,designed:true},
 lamboV12:{file:'lambo-v12-v2',rpm:4500,cutoff:3900,designed:true,high:{file:'veneno-high-v3',rpm:6000,start:4200,end:5700}},
 mclarenV12:{file:'mclaren-v12-v2',rpm:3500,cutoff:3500,designed:true}
};
export const AUDIO_ASSETS=[...Object.values(ENGINE_BANKS).flatMap(b=>b.high?[b.file,b.high.file]:[b.file]),'mclaren-idle-v2','tire','road','impact','shift'];
/** Smooth transition to a steady firing-order loop before the midrange clip is over-pitched. */
export function highBlend(rpm:number,high?:{rpm:number;start:number;end:number}){const x=high?Math.max(0,Math.min(1,(rpm-high.start)/(high.end-high.start))):0;return {mix:x*x*(3-2*x),rate:high?Math.max(.5,Math.min(1.5,rpm/high.rpm)):1};}
/** Middle-RPM recordings fade out below their useful range, instead of being stretched into idle. */
export function engineBlend(rpm:number,anchor:number){return {sample:Math.max(0,Math.min(1,(rpm-1500)/1400)),rate:Math.max(.65,Math.min(1.8,rpm/anchor))};}
