export interface Finisher {finished:boolean;finishTime:number|null}
export function allFinished(player:Finisher,opponents:Finisher[]){return [player,...opponents].every(c=>c.finished&&c.finishTime!==null&&Number.isFinite(c.finishTime));}
/** Interpolate the actual finish-line crossing within a physics step. */
export function crossingTime(before:number,after:number,line:number,time:number,dt:number):number|null{
 if(before>=line||after<line||after<=before)return null;
 return time-dt+dt*(line-before)/(after-before);
}
