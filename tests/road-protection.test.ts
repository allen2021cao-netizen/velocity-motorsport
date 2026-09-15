import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createTrackCurve,CIRCUITS} from '../src/circuits/circuit';
import {constrainRoadEdge,raisedRoadEdges,CONCRETE_SECTION} from '../src/circuits/road-protection';
for(const theme of ['bathurst','phillip','suzuka','fuji','redbull','arosa'])test(theme+' retains vehicles inside raised edges at every height and bend',()=>{
 const c=createTrackCurve({theme,base:0,modes:[]}),width=CIRCUITS[theme].halfWidth;
 const p=Array.from({length:1400},(_,i)=>c.getPointAt(i/(CIRCUITS[theme].pointToPoint?1399:1400))),n=p.map((_,i)=>{const t=c.getTangentAt(i/(CIRCUITS[theme].pointToPoint?1399:1400));return new Vector3(-t.z,0,t.x).normalize();});
 for(let i=0;i<p.length;i++)for(const side of [-1,1]){const pos=p[i].clone().addScaledVector(n[i],side*(width+15));constrainRoadEdge(pos,p[i],n[i],width-1.25);assert.ok(Math.abs(pos.clone().sub(p[i]).dot(n[i]))<=width-1.25+1e-8);assert.equal(pos.y,p[i].y);assert.ok(Math.abs(constrainRoadEdge(pos,p[i],n[i],width-1.25))<1e-8);}
 const closed=!CIRCUITS[theme].pointToPoint,g=raisedRoadEdges(p,n,width,closed),v=g.attributes.position;assert.ok(Array.from(v.array).every(Number.isFinite));if(closed)for(let i=0;i<CONCRETE_SECTION.length;i++)assert.ok(new Vector3().fromBufferAttribute(v,i).distanceTo(new Vector3().fromBufferAttribute(v,1400*CONCRETE_SECTION.length+i))<.001);if(!closed){assert.equal(v.count,2*p.length*CONCRETE_SECTION.length);const count=CONCRETE_SECTION.length;assert.ok(new Vector3().fromBufferAttribute(v,(p.length-1)*count).distanceTo(p.at(-1)!)<width+2);const index=g.index!;for(let i=0;i<index.count;i+=3){const triangle=[0,1,2].map(k=>new Vector3().fromBufferAttribute(v,index.getX(i+k)));assert.ok(triangle[0].distanceTo(triangle[1])<30,'no end-to-start bridge across the mountain');}}g.dispose();
});
