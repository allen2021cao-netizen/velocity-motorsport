import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const output='artifacts/stability';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
const results=[];
const cases=[{name:'desktop',width:1280,height:800,dpr:1,mobile:false},{name:'phone-emulation',width:844,height:390,dpr:2,mobile:true}];
try{
 for(let repeat=0;repeat<2;repeat++)for(const config of cases)for(const version of repeat?['after','before']:['before','after']){
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.dpr,isMobile:config.mobile,hasTouch:config.mobile});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{let seed=73129;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
  await page.goto(version==='before'?'http://127.0.0.1:5174/':'http://127.0.0.1:5173/');
  await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
  if(await page.locator('#rotateHint button').isVisible())await page.locator('#rotateHint button').click();
  await page.click('#navCar');for(let i=0;i<13;i++){if(await page.evaluate(()=>window.__velocity.snapshot().car==='458'))break;await page.click('#nextCar');}
  await page.click('#navTrack');await page.locator('.trackBtn').nth(7).click();
  await page.click('#navSetup');await page.selectOption('#mode','time');await page.selectOption('#weather','clear');await page.selectOption('#tires','sport');
  await page.click('#quickQuality [data-quality=balanced]');await page.locator('#cornerAssist').uncheck();
  await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:90000});
  await page.waitForTimeout(2500);
  const metrics=await page.evaluate(async()=>{
   const {TRACKS}=await import('/src/tracks.js'),{createTrackCurve}=await import('/src/circuits/circuit.ts'),{aiTargetSpeed,drivingCurvature}=await import('/src/race-ai.ts'),{CARS}=await import('/src/cars.js'),{options}=await import('/src/session.ts');
   const initial=window.__velocity.snapshot(),track=TRACKS.find(t=>t.theme===initial.track),curve=createTrackCurve(track),n=1400,length=curve.getLength(),segment=length/n;
   const points=Array.from({length:n},(_,i)=>curve.getPointAt(i/n)),tangents=Array.from({length:n},(_,i)=>curve.getTangentAt(i/n)),curvature=drivingCurvature(tangents),car=CARS.find(c=>c.type===initial.car);
   const held=new Map(),send=(code,down)=>{if(held.get(code)===down)return;held.set(code,down);document.body.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,bubbles:true}));};
   let pathIndex=0,offroad=0,maxOffset=0;
   const controller=setInterval(()=>{
    const s=window.__velocity.snapshot();let nearest=Infinity;
    for(let i=0;i<n;i++){const d=(s.position[0]-points[i].x)**2+(s.position[2]-points[i].z)**2;if(d<nearest){nearest=d;pathIndex=i;}}
    maxOffset=Math.max(maxOffset,Math.sqrt(nearest));if(Math.sqrt(nearest)>s.roadWidth/2)offroad++;
    const ahead=points[(pathIndex+Math.round(Math.max(7,s.speed*.55)/segment))%n];
    let angle=Math.atan2(ahead.x-s.position[0],ahead.z-s.position[2])-s.heading;angle=Math.atan2(Math.sin(angle),Math.cos(angle));
    const target=aiTargetSpeed(curvature,segment,pathIndex,car,options,1,0)*.85;
    send('KeyA',angle>.055);send('KeyD',angle<-.055);send('KeyS',s.speed>target+1);send('KeyW',s.speed<target);
   },60);
   const intervals=[],draws=[],triangles=[],ratios=[],longTasks=[];let last=0,start=performance.now();
   const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())longTasks.push(e.duration);});observer.observe({type:'longtask'});
   await new Promise(resolve=>{function frame(t){if(last)intervals.push(t-last);last=t;
    if(intervals.length%20===0){const s=window.__velocity.snapshot();draws.push(s.drawCalls);triangles.push(s.triangles);ratios.push(s.pixelRatio);}
    if(t-start<12000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
   clearInterval(controller);for(const code of held.keys())send(code,false);observer.disconnect();
   const final=window.__velocity.snapshot(),gl=document.querySelector('#game canvas').getContext('webgl2'),info=gl.getExtension('WEBGL_debug_renderer_info');
   const sorted=intervals.slice().sort((a,b)=>a-b),pct=p=>sorted[Math.floor((sorted.length-1)*p)],mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
   return{car:initial.car,track:initial.track,weather:options.weather,quality:initial.quality,viewport:[innerWidth,innerHeight],devicePixelRatio,renderer:info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):'unavailable',seconds:(last-start)/1000,frames:intervals.length,medianMs:pct(.5),p95Ms:pct(.95),p99Ms:pct(.99),framesOver33:intervals.filter(v=>v>33.34).length,framesOver50:intervals.filter(v=>v>50).length,longTasks:longTasks.length,meanDrawCalls:mean(draws),meanTriangles:mean(triangles),pixelRatios:[...new Set(ratios)],offroadSamples:offroad,maxRoadOffset:maxOffset,position:final.position,speed:final.speed};
  });
  assert.deepEqual(errors,[]);assert.equal(metrics.car,'458');assert.equal(metrics.track,'shanghai');
  await page.screenshot({path:output+'/'+config.name+'-'+version+'-'+repeat+'.png'});
  results.push({version,repeat,case:config.name,...metrics});fs.writeFileSync(output+'/comparison.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.at(-1)));await page.close();
 }
}finally{await browser.close();}
