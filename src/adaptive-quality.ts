/** Frame-time windows ignore hidden/loading gaps; recovery is intentionally much slower. */
export class AdaptiveQuality {
 private samples:number[]=[];private seconds=0;private good=0;
 reset(){this.samples=[];this.seconds=0;this.good=0;}
 update(dt:number,level:number,minimum:number,active:boolean){
  if(!active||dt<=0||dt>.25){this.reset();return level;}
  this.samples.push(dt);this.seconds+=dt;if(this.seconds<2)return level;
  const sorted=this.samples.sort((a,b)=>a-b),p90=sorted[Math.floor((sorted.length-1)*.9)],median=sorted[Math.floor(sorted.length/2)];
  const seconds=this.seconds;this.samples=[];this.seconds=0;
  if(p90>1/40&&median>1/48&&level<3){this.good=0;return level+1;}
  this.good=median<1/55&&p90<1/48?this.good+seconds:0;
  if(this.good>=12&&level>minimum){this.good=0;return level-1;}return level;
 }
}
