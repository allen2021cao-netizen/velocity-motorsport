export interface TimingEntry {id:string;name:string;distance:number;finishTime:number|null;me?:boolean}
export function raceOrder(entries:TimingEntry[]){return [...entries].sort((a,b)=>{
 if(a.finishTime!==null&&b.finishTime!==null)return a.finishTime-b.finishTime||a.id.localeCompare(b.id);
 if(a.finishTime!==null)return -1;if(b.finishTime!==null)return 1;
 return b.distance-a.distance||Number(!!b.me)-Number(!!a.me)||a.id.localeCompare(b.id);
});}
export function mountRaceTiming(body:HTMLElement){
 const rows=new Map<string,{row:HTMLTableRowElement;rank:HTMLTableCellElement;name:HTMLTableCellElement;time:HTMLTableCellElement}>();
 return(entries:TimingEntry[],elapsed:number,format:(t:number)=>string,timing?:CheckpointTiming)=>{
  const sorted=raceOrder(entries),active=new Set(sorted.map(e=>e.id));
  for(const [id,item]of rows)if(!active.has(id)){item.row.remove();rows.delete(id);}
  sorted.forEach((entry,i)=>{
   let item=rows.get(entry.id);
   if(!item){const row=document.createElement('tr');item={row,rank:row.insertCell(),name:row.insertCell(),time:row.insertCell()};rows.set(entry.id,item);}
   item.rank.textContent=String(i+1);item.name.textContent=entry.name+(entry.me?' · 你':'');item.name.title=item.name.textContent;
   const leader=sorted[0];
   const gap=entry.finishTime!==null&&leader.finishTime!==null?entry.finishTime-leader.finishTime:timing?.gap(entry.id,leader.id)??null;
   item.time.textContent=i===0?format(entry.finishTime??elapsed):gap!==null?'+'+gap.toFixed(3):'—';
   item.time.title=i===0?'领先者比赛用时':gap!==null?(entry.finishTime!==null?'最终落后冠军秒数':'最近共同计时点：落后领先者秒数'):'等待共同计时点';
   item.row.classList.toggle('is-player',!!entry.me);item.row.classList.toggle('is-finished',entry.finishTime!==null);
   if(body.children[i]!==item.row)body.insertBefore(item.row,body.children[i]??null);
  });
  return sorted.findIndex(e=>e.me)+1;
 };
}
export class CheckpointTiming {
 readonly count:number;readonly spacing:number;
 private cars=new Map<string,{distance:number;time:number;high:number;times:Map<number,number>}>();
 constructor(length:number){this.count=Math.max(1,Math.ceil(length/50));this.spacing=length/this.count;}
 sample(id:string,distance:number,time:number){
  const previous=this.cars.get(id);
  if(!previous){this.cars.set(id,{distance,time,high:Math.floor(distance/this.spacing),times:new Map()});return;}
  const delta=distance-previous.distance,dt=time-previous.time;
  // Ignore reverse crossings, resets and implausible jumps; never fabricate skipped splits.
  if(dt>0&&delta>0&&delta<=140*dt+12){
   const last=Math.floor(distance/this.spacing);
   for(let point=Math.max(previous.high+1,Math.floor(previous.distance/this.spacing)+1);point<=last;point++){
    const fraction=(point*this.spacing-previous.distance)/delta;
    previous.times.set(point,previous.time+fraction*dt);
   }
  }
  previous.high=Math.max(previous.high,Math.floor(distance/this.spacing));previous.distance=distance;previous.time=time;
 }
 gap(id:string,leader:string):number|null{
  const car=this.cars.get(id),front=this.cars.get(leader);if(!car||!front)return null;
  // Use the trailing car's latest split only; old splits can misrepresent a recent overtake.
  const mine=car.times.get(car.high),theirs=front.times.get(car.high);
  return mine!==undefined&&theirs!==undefined&&mine>=theirs?mine-theirs:null;
 }
}
