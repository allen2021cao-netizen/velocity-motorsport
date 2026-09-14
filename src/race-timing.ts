export interface TimingEntry {id:string;name:string;distance:number;finishTime:number|null;me?:boolean}
export function raceOrder(entries:TimingEntry[]){return [...entries].sort((a,b)=>{
 if(a.finishTime!==null&&b.finishTime!==null)return a.finishTime-b.finishTime||a.id.localeCompare(b.id);
 if(a.finishTime!==null)return -1;if(b.finishTime!==null)return 1;
 return b.distance-a.distance||Number(!!b.me)-Number(!!a.me)||a.id.localeCompare(b.id);
});}
export function mountRaceTiming(body:HTMLElement){
 const rows=new Map<string,{row:HTMLTableRowElement;rank:HTMLTableCellElement;name:HTMLTableCellElement;time:HTMLTableCellElement}>();
 return(entries:TimingEntry[],elapsed:number,format:(t:number)=>string)=>{
  const sorted=raceOrder(entries),active=new Set(sorted.map(e=>e.id));
  for(const [id,item]of rows)if(!active.has(id)){item.row.remove();rows.delete(id);}
  sorted.forEach((entry,i)=>{
   let item=rows.get(entry.id);
   if(!item){const row=document.createElement('tr');item={row,rank:row.insertCell(),name:row.insertCell(),time:row.insertCell()};rows.set(entry.id,item);}
   item.rank.textContent=String(i+1);item.name.textContent=entry.name+(entry.me?' · 你':'');item.name.title=item.name.textContent;
   item.time.textContent=format(entry.finishTime??elapsed);item.time.title=entry.finishTime!==null?'已完赛：最终用时':'实时比赛用时';
   item.row.classList.toggle('is-player',!!entry.me);item.row.classList.toggle('is-finished',entry.finishTime!==null);
   if(body.children[i]!==item.row)body.insertBefore(item.row,body.children[i]??null);
  });
  return sorted.findIndex(e=>e.me)+1;
 };
}
