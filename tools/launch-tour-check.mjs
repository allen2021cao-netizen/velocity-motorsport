import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('artifacts/launch',{recursive:true});
const b=await chromium.launch({headless:true,channel:'msedge'}),p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{window.coverTimes={};new MutationObserver(()=>{const e=document.getElementById('launchCover');if(e?.dataset.shownAt&&!window.coverTimes.shown)window.coverTimes.shown=Number(e.dataset.shownAt);if(e?.classList.contains('leaving')&&!window.coverTimes.left)window.coverTimes.left=performance.now();}).observe(document,{subtree:true,attributes:true,childList:true});});
await p.goto(process.env.TEST_URL||'http://127.0.0.1:5173/');await p.screenshot({path:'artifacts/launch/cover-mobile.png'});
await p.waitForSelector('#launchCover',{state:'detached',timeout:30000});const times=await p.evaluate(()=>window.coverTimes);assert.ok(times.left-times.shown>=1490);assert.ok(times.left-times.shown<2500);console.log('COVER HOLD',times.left-times.shown);
await p.waitForFunction(()=>window.__velocity?.snapshot().detailed,null,{timeout:90000});await p.click('#navTrack');const tour=await p.locator('#tourBtn').boundingBox(),stage=await p.locator('#menuPreview').boundingBox();assert.ok(tour.x-stage.x<20&&tour.y-stage.y<20);await p.screenshot({path:'artifacts/launch/track-mobile.png'});
await p.click('#tourBtn');const cities=[];
for(let i=0;i<12;i++){
 await p.waitForFunction(()=>window.__velocity.snapshot().environment.sky.status==='ready');
 const samples=await p.evaluate(async()=>{const frames=[];for(let i=0;i<30;i++){await new Promise(requestAnimationFrame);frames.push(window.__velocity.snapshot());}return frames;});
 assert.ok(samples.every(s=>s.cameraClip[0]===2&&s.cameraClip[1]===5000));assert.ok(samples.every(s=>s.pixelRatio===samples[0].pixelRatio));assert.ok(samples[0].environment.minimumBuildingSeparation>=2);
 for(let n=1;n<samples.length;n++){const a=samples[n-1].cameraEye,c=samples[n].cameraEye;assert.ok(c.every(Number.isFinite));assert.ok(Math.hypot(...c.map((x,j)=>x-a[j]))<3);}
 const key=samples[0].track;cities.push(key);await p.screenshot({path:`artifacts/launch/tour-${key}.png`});console.log('TOUR',key);await p.click('#tourNext');
}
await p.click('#tourBack');await p.click('#startBtn');await p.waitForFunction(()=>window.__velocity.snapshot().state==='race');
for(const size of [{width:390,height:844},{width:844,height:390}]){await p.setViewportSize(size);const cam=await p.locator('#btnCam').boundingBox(),left=await p.locator('#btnL').boundingBox(),toggle=await p.locator('#controlsToggle').boundingBox();assert.ok(cam.x<20&&cam.y>size.height*.5);assert.ok(cam.y+cam.height<=left.y);assert.ok(cam.y>=toggle.y+toggle.height||toggle.y>=cam.y+cam.height);await p.click('#btnCam');await p.screenshot({path:`artifacts/launch/camera-${size.width}.png`});}
assert.equal(await p.evaluate(()=>window.__velocity.snapshot().camera),2);assert.deepEqual(errors,[]);console.log('PASS',cities,errors);await b.close();
