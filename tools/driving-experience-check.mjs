import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const folder='artifacts/driving-experience';fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)});
const errors=[],report={};let activePage;
async function pageFor(mobile){
 const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
 activePage=page;
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173/');
 await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
 const rotate=page.locator('#rotateHint button');if(await rotate.isVisible())await rotate.click();
 await page.locator('#navSetup').click();await page.selectOption('#mode','time');
 await page.locator('#quickQuality [data-quality=low]').click();
 return page;
}
const snapshot=p=>p.evaluate(()=>window.__velocity.snapshot());
async function start(page){await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:90000});}
try{
 if(!process.env.TOUCH_ONLY){const page=await pageFor(false);
 await page.click('#navCar');await page.click('#nextCar');assert.equal((await snapshot(page)).quality,'low');
 await page.reload();await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
 assert.equal((await snapshot(page)).quality,'high','garage starts at highest quality');
 await start(page);assert.equal((await snapshot(page)).quality,'balanced','race starts at balanced quality');await page.waitForFunction(()=>!document.querySelector('#drivingCue').hidden);
 const initial=await snapshot(page);await page.keyboard.down('KeyW');
 await page.waitForFunction(()=>window.__velocity.snapshot().speed>12,null,{timeout:30000});
 await page.keyboard.down('KeyA');await page.waitForTimeout(500);await page.keyboard.up('KeyA');
 const steering=await snapshot(page);assert.ok(Math.abs(steering.heading-initial.heading)>.05);
 await page.keyboard.up('KeyW');await page.keyboard.down('KeyS');
 await page.waitForFunction(()=>window.__velocity.snapshot().speed<3,null,{timeout:30000});await page.keyboard.up('KeyS');
 await page.keyboard.press('KeyR');await page.waitForTimeout(150);
 const reset=await snapshot(page);assert.ok(reset.speed<1);assert.ok(reset.cameraEye.every(Number.isFinite));
 for(const mode of [1,2,0]){await page.keyboard.press('KeyC');await page.waitForTimeout(120);assert.equal((await snapshot(page)).camera,mode);}
 await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.press('Escape');
 const paused=await snapshot(page);await page.waitForTimeout(250);assert.equal((await snapshot(page)).raceTime,paused.raceTime);assert.ok(await page.locator('#drivingCue').isHidden());
 await page.keyboard.up('KeyW');await page.click('#resumeBtn');await page.keyboard.down('KeyW');
 await page.waitForFunction(()=>window.__velocity.snapshot().pedals.throttle>.8);
 await page.keyboard.up('KeyW');await page.screenshot({path:folder+'/desktop.png'});
 await page.keyboard.press('Escape');await page.click('#quitBtn');await page.click('#navSetup');await page.locator('#line').uncheck();
 await start(page);assert.ok(await page.locator('#drivingCue').isHidden());
 report.keyboard={steering:true,brake:true,reset:true,cameras:true,pause:true,qualityByScene:true,cueToggle:true};
 await page.keyboard.press('Escape');await page.click('#quitBtn');await page.click('#navSetup');await page.selectOption('#mode','race');await start(page);
 if(await page.evaluate(()=>typeof window.__raceFinishTest==='function')){
  await page.evaluate(()=>window.__raceFinishTest());await page.waitForTimeout(600);
  const following=await snapshot(page);assert.equal(following.ai,3);assert.equal(following.state,'finishing');assert.ok(following.cameraEye.every(Number.isFinite));report.aiFollowCamera=true;
 }
 await page.close();console.log('Keyboard checks passed');}
 const phone=await pageFor(true);await start(phone);
 const cdp=await phone.context().newCDPSession(phone);
 const center=async id=>{const b=await phone.locator('#'+id).boundingBox();assert.ok(b);return{x:b.x+b.width/2,y:b.y+b.height/2};};
 const gas=await center('btnGas'),left=await center('btnL');const before=await snapshot(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...gas,id:1},{...left,id:2}]});
 await phone.waitForFunction(()=>window.__velocity.snapshot().speed>3&&window.__velocity.snapshot().pedals.throttle>.8,null,{timeout:15000});
 const moving=await snapshot(phone);assert.ok(Math.abs(moving.heading-before.heading)>.05);
 // Releasing one finger must not cancel the independently held accelerator.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{...left,id:2}]});
 await phone.waitForTimeout(200);assert.ok((await snapshot(phone)).pedals.throttle>.8);
 // Captured touch stays pressed if a thumb moves outside the original button.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:gas.x-110,y:gas.y-100,id:1}]});
 await phone.waitForTimeout(150);assert.ok((await snapshot(phone)).pedals.throttle>.8);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await phone.waitForFunction(()=>window.__velocity.snapshot().pedals.throttle<.05);
 assert.equal(await phone.locator('.tbtn.on').count(),0);
 await phone.locator('#btnReset').tap();
 await phone.locator('#btnPause').tap();assert.equal((await snapshot(phone)).paused,true);
 await phone.locator('#resumeBtn').tap();assert.equal((await snapshot(phone)).paused,false);
 for(const size of [{width:844,height:390},{width:667,height:375},{width:568,height:320},{width:390,height:844}]){
  await phone.setViewportSize(size);await phone.waitForTimeout(180);
  const rotate=phone.locator('#rotateHint button');if(await rotate.isVisible())await rotate.click();
  if((await snapshot(phone)).paused)await phone.click('#resumeBtn');
  await phone.waitForTimeout(180);
  const layout=await phone.evaluate(()=>{const r=document.querySelector('#drivingCue').getBoundingClientRect();const controls=['btnL','btnR','btnGas','btnBrake'].map(id=>{const b=document.getElementById(id).getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom};});return{cue:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},controls,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(layout.overflow,false);assert.ok(layout.cue.x>=0&&layout.cue.right<=size.width+1&&layout.cue.bottom<=size.height);
  if(size.width>size.height){const timing=await phone.locator('#raceTiming').boundingBox();assert.ok(layout.cue.x>=timing.x+timing.width||layout.cue.y>=timing.y+timing.height,'driving cue must not cover standings');}
  for(const c of layout.controls)assert.ok(c.x>=0&&c.right<=size.width+1&&c.bottom<=size.height+1);
  await phone.screenshot({path:folder+'/phone-'+size.width+'.png'});
 }
 report.touch={simultaneous:true,independentRelease:true,capturedDrag:true,cancel:true,layouts:true};
 await phone.close();assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(folder+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(error){if(activePage&&!activePage.isClosed()){console.log('Failure snapshot',await snapshot(activePage));console.log('Touch state',await activePage.evaluate(()=>({on:[...document.querySelectorAll('.tbtn.on')].map(e=>e.id),viewport:[innerWidth,innerHeight],cue:document.querySelector('#drivingCue').textContent})));await activePage.screenshot({path:folder+'/failure.png'});}throw error;}finally{await browser.close();}
