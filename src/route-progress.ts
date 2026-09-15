/** Open routes clamp at their endpoints; closed circuits wrap at the seam. */
export function routeIndex(index:number,count:number,open:boolean){return open?Math.max(0,Math.min(count-1,index)):((index%count)+count)%count;}
export function routeFraction(index:number,count:number,open:boolean){return index/(open?count-1:count);}
export function stageCrossing(before:number,after:number,length:number,checkpoints:number,lateral:number,halfWidth:number,time:number,dt:number){
 if(checkpoints!==3||Math.abs(lateral)>halfWidth||before>=length||after<length||after<=before)return null;
 return time-dt+dt*(length-before)/(after-before);
}
