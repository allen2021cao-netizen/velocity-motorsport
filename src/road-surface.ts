type Point={x:number;y:number;z:number};
/** Sample the exact two triangles used by buildStrip, not a centreline tangent.
 * A local hint prevents snapping to another branch at a hairpin. */
export function roadSurface(points:Point[],normals:Point[],halfWidth:number,open:boolean,x:number,z:number,hint:number){
 const count=points.length,index=(i:number)=>open?Math.max(0,Math.min(count-1,i)):((i%count)+count)%count;
 let best={height:points[index(hint)].y,gx:0,gz:0,error:Infinity};
 for(let k=-4;k<=4;k++){
  const i=index(hint+k),j=index(i+1);if(i===j)continue;
  const p=points[i],q=points[j],n=normals[i],m=normals[j];
  const ax=p.x+n.x*halfWidth,az=p.z+n.z*halfWidth,bx=p.x-n.x*halfWidth,bz=p.z-n.z*halfWidth,cx=q.x+m.x*halfWidth,cz=q.z+m.z*halfWidth,dx=q.x-m.x*halfWidth,dz=q.z-m.z*halfWidth;
  triangle(ax,p.y,az,cx,q.y,cz,bx,p.y,bz);
  triangle(bx,p.y,bz,cx,q.y,cz,dx,q.y,dz);
 }
 function triangle(ax:number,ay:number,az:number,bx:number,by:number,bz:number,cx:number,cy:number,cz:number){
  const ux=bx-ax,uz=bz-az,vx=cx-ax,vz=cz-az,det=ux*vz-uz*vx;if(Math.abs(det)<1e-8)return;
  const u=((x-ax)*vz-(z-az)*vx)/det,v=(ux*(z-az)-uz*(x-ax))/det,w=1-u-v;
  const error=Math.max(0,-u,-v,-w);if(error>=best.error)return;
  const gx=((by-ay)*vz-(cy-ay)*uz)/det,gz=(ux*(cy-ay)-vx*(by-ay))/det;
  best={height:ay+gx*(x-ax)+gz*(z-az),gx,gz,error};
 }
 return best;
}
export function roadAttitude(gx:number,gz:number,heading:number){return{pitch:-Math.atan(gx*Math.sin(heading)+gz*Math.cos(heading)),roll:Math.atan(gx*Math.cos(heading)-gz*Math.sin(heading))};}
