/** Equal-mass oriented boxes. Position correction never adds kinetic energy. */
export type ContactBody={x:number;z:number;heading:number;vx:number;vz:number;length:number;width:number};
export function overlap(a:ContactBody,b:ContactBody){
 const axes=[a.heading,b.heading].flatMap(h=>[{x:Math.sin(h),z:Math.cos(h)},{x:Math.cos(h),z:-Math.sin(h)}]);
 let depth=Infinity,nx=0,nz=0;
 const radius=(c:ContactBody,n:{x:number;z:number})=>Math.abs(Math.sin(c.heading)*n.x+Math.cos(c.heading)*n.z)*c.length/2+Math.abs(Math.cos(c.heading)*n.x-Math.sin(c.heading)*n.z)*c.width/2;
 for(const n of axes){const d=(b.x-a.x)*n.x+(b.z-a.z)*n.z,p=radius(a,n)+radius(b,n)-Math.abs(d);if(p<=0)return null;if(p<depth){depth=p;nx=n.x*(d>=0?1:-1);nz=n.z*(d>=0?1:-1);}}
 return{depth,nx,nz};
}
export function resolveContacts(bodies:ContactBody[]){
 const impacts=new Map<number,number>();
 for(let iteration=0;iteration<8;iteration++)for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const a=bodies[i],b=bodies[j],hit=overlap(a,b);if(!hit)continue;
  const {nx,nz,depth}=hit,shift=(depth+.0001)*.5;
  a.x-=nx*shift;a.z-=nz*shift;b.x+=nx*shift;b.z+=nz*shift;
  const closing=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;
  if(closing>0){const impulse=closing*.55;a.vx-=nx*impulse;a.vz-=nz*impulse;b.vx+=nx*impulse;b.vz+=nz*impulse;
   const slide=(a.vx-b.vx)*(-nz)+(a.vz-b.vz)*nx,friction=Math.sign(slide)*Math.min(Math.abs(slide)*.5,impulse*.12);
   a.vx+=nz*friction;a.vz-=nx*friction;b.vx-=nz*friction;b.vz+=nx*friction;
   impacts.set(i,Math.max(impacts.get(i)??0,closing));impacts.set(j,Math.max(impacts.get(j)??0,closing));
  }
 }
 return impacts;
}
