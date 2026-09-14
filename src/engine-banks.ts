import type {EngineFamily} from './audio-dynamics';
export const ENGINE_BANKS:Record<EngineFamily,{file:string;rpm:number;cutoff:number;designed?:boolean}>={
 muscle:{file:'muscle',rpm:2500,cutoff:9000},six:{file:'six',rpm:3500,cutoff:9000},
 ferrari458:{file:'ferrari458-v2',rpm:3500,cutoff:4200,designed:true},
 ferrariF40:{file:'ferrari-f40-v2',rpm:4000,cutoff:3300,designed:true},
 audiV10:{file:'audi-v10-v2',rpm:4000,cutoff:3800,designed:true},
 lamboV12:{file:'lambo-v12-v2',rpm:4500,cutoff:3900,designed:true},
 mclarenV12:{file:'mclaren-v12-v2',rpm:3500,cutoff:3500,designed:true}
};
export const AUDIO_ASSETS=[...Object.values(ENGINE_BANKS).map(b=>b.file),'mclaren-idle-v2','tire','road','impact','shift'];
/** Middle-RPM recordings fade out below their useful range, instead of being stretched into idle. */
export function engineBlend(rpm:number,anchor:number){return {sample:Math.max(0,Math.min(1,(rpm-1500)/1400)),rate:Math.max(.65,Math.min(1.8,rpm/anchor))};}
