import * as T from 'three';
/** A continuous eroded ridge, rather than separate spherical mountain props. */
export function ridgeGeometry(desert=false){
 const geo=new T.PlaneGeometry(2400,650,96,30);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),fade=Math.pow(Math.max(0,1-(z/325)**2),1.4),crest=.55+.18*Math.sin(x*.004)+.12*Math.sin(x*.011+1.2)+.08*Math.cos(x*.019);
  p.setY(i,fade*(desert?100:270)*crest+(desert?1:7)*Math.sin(x*.071+z*.043)*fade-15);
 }geo.computeVertexNormals();return geo;
}
