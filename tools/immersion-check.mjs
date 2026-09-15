import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});await page.click('#navSetup');
 await page.locator('#cameraMotion').evaluate(e=>{e.value='0';e.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.locator('#bodyMotion').evaluate(e=>{e.value='.4';e.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.reload();await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});assert.deepEqual((await page.evaluate(()=>window.__velocity.snapshot())).motion,{body:.4,camera:0});
 await page.click('#navSetup');await page.selectOption('#mode','time');await page.locator('#quickQuality [data-quality=low]').click();await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:90000});await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__velocity.snapshot().speed>12);await page.keyboard.down('KeyA');await page.waitForTimeout(800);await page.keyboard.up('KeyA');await page.keyboard.up('KeyW');
 const live=await page.evaluate(()=>window.__velocity.snapshot());assert.ok(live.audio.grip>0);assert.ok(live.cameraEye.every(Number.isFinite));await page.keyboard.press('Escape');
 const rendered=await page.evaluate(async()=>{
  const {RaceAudio}=await import('/src/race-audio.ts');const {AUDIO_ASSETS}=await import('/src/engine-banks.ts');
  const names=['dry','kerb','grass','wet','grip','left','right','tunnel'],rate=22050,duration=names.length*2,ac=new OfflineAudioContext(2,rate*duration,rate),engine=new RaceAudio(ac,ac.destination);
  const deadline=performance.now()+30000;while(engine.snapshot().loaded.length+engine.snapshot().failed.length<AUDIO_ASSETS.length&&performance.now()<deadline)await new Promise(r=>setTimeout(r,50));
  const frame=i=>({active:true,type:'458',top:300,speed:30,throttle:.4,brake:0,slip:0,wet:i===3?1:0,camera:0,countdown:false,fuel:100,grip:i===4?1:0,surface:{curb:i===1?1:0,grass:i===2?1:0,rough:0,wet:i===3?1:0,tunnel:i===7?1:0},opponents:i===5||i===6?[{x:i===5?-2.8:2.8,z:0,speed:30,type:'f40'}]:[]});
  engine.update(frame(0),1/30);const jobs=[];
  for(let tick=1;tick<duration*30;tick++)jobs.push(ac.suspend(tick/30).then(()=>{engine.update(frame(Math.floor(tick/60)),1/30);return ac.resume();}));
  const buffer=await ac.startRendering();await Promise.all(jobs);const left=buffer.getChannelData(0),right=buffer.getChannelData(1),metrics={};
  for(let i=0;i<names.length;i++){let l=0,r=0,diff=0;const start=Math.floor((i*2+.5)*rate),end=(i+1)*2*rate;for(let j=start;j<end;j++){l+=left[j]**2;r+=right[j]**2;if(j>start)diff+=(left[j]-left[j-1])**2;}metrics[names[i]]={left:Math.sqrt(l/(end-start)),right:Math.sqrt(r/(end-start)),high:Math.sqrt(diff/(end-start))};}
  const bytes=new Uint8Array(left.length*4),view=new DataView(bytes.buffer);for(let i=0;i<left.length;i++){view.setInt16(i*4,Math.max(-1,Math.min(1,left[i]))*32767,true);view.setInt16(i*4+2,Math.max(-1,Math.min(1,right[i]))*32767,true);}let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return{pcm:btoa(binary),metrics,rate,failed:engine.snapshot().failed};
 });
 for(const m of Object.values(rendered.metrics))assert.ok(m.left>0&&Number.isFinite(m.high));assert.ok(rendered.metrics.left.left>rendered.metrics.left.right);assert.ok(rendered.metrics.right.right>rendered.metrics.right.left);assert.ok(rendered.metrics.wet.high>rendered.metrics.dry.high);
 const pcm=Buffer.from(rendered.pcm,'base64'),header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rendered.rate,24);header.writeUInt32LE(rendered.rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 fs.mkdirSync('artifacts/immersion',{recursive:true});fs.writeFileSync('artifacts/immersion/feedback-demo.wav',Buffer.concat([header,pcm]));assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/immersion/check.json',JSON.stringify({motion:live.motion,liveGrip:live.audio.grip,metrics:rendered.metrics,failed:rendered.failed,errors},null,2));console.log(JSON.stringify({motion:live.motion,liveGrip:live.audio.grip,metrics:rendered.metrics,errors}));
}finally{await browser.close();}
