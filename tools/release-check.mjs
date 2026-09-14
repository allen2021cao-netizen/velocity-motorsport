import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('artifacts/release',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
const snap=()=>page.evaluate(()=>window.__velocity.snapshot());
async function settle(){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:1440,height:900}]){
 await page.setViewportSize(size);
 for(const [nav,tab] of [['navCar','car'],['navTrack','track'],['navSetup','setup']]){
  await page.click('#'+nav);await settle();const s=await snap();if(s.menuTab!==tab)throw Error('Wrong tab');
  if(tab==='track'&&(!s.sceneVisibility.world||s.sceneVisibility.cars))throw Error('Track preview contaminated');
  if(tab!=='track'&&(s.sceneVisibility.world||s.sceneVisibility.cars!==1))throw Error('Car preview contaminated');
  const layout=await page.evaluate(()=>{const start=document.querySelector('#startBtn').getBoundingClientRect(),stage=document.querySelector('#menuPreview').getBoundingClientRect(),controls=document.querySelector('#menuControls').getBoundingClientRect();return{start:[start.x,start.y,start.right,start.bottom],stage:[stage.width,stage.height],controls:[controls.width,controls.height],overflow:document.documentElement.scrollWidth>innerWidth};});
  if(layout.overflow||layout.start[0]<0||layout.start[2]>size.width+1||layout.start[3]>size.height+1||layout.controls[1]<70||layout.stage[0]<150)throw Error('Invalid layout '+JSON.stringify({size,layout}));
  await page.screenshot({path:`artifacts/release/${size.width}-${tab}.png`});
 }
}
if(await page.locator('.diffBtn').count()!==3)throw Error('Difficulty count');
await page.locator('#cornerAssist').uncheck();if(await page.evaluate(()=>JSON.parse(localStorage.getItem('uv3-setup')).cornerAssist)!==false)throw Error('Assist cannot be disabled');await page.locator('#cornerAssist').check();
await page.selectOption('#quality','balanced');await page.selectOption('#mode','time');await page.selectOption('#weather','clear');
await page.click('#navTrack');for(const i of [0,7,9,11]){await page.locator('.trackBtn').nth(i).click();await page.waitForFunction(()=>window.__velocity.snapshot().environment.sky.status==='ready');if((await snap()).environment.key!==(await snap()).track)throw Error('City mismatch');}
await page.click('#tourBtn');await settle();await page.screenshot({path:'artifacts/release/city-tour.png'});await page.click('#tourBack');await page.click('#navCar');await page.click('#vehicleBtn');await settle();await page.screenshot({path:'artifacts/release/car-inspect.png'});await page.click('#vehicleBack');
const cars=[];
for(let i=0;i<13;i++){
 await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:60000});
 const car=(await snap()).car;
 for(const mode of [1,2]){await page.keyboard.press('KeyC');await page.waitForFunction(m=>window.__velocity.snapshot().camera===m,mode);await settle();const s=await snap();if(s.cameraEye.some(x=>!Number.isFinite(x)))throw Error('Invalid camera');await page.screenshot({path:`artifacts/release/${car}-${mode===1?'cockpit':'bonnet'}.png`});}
 if(i===0){await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__velocity.snapshot().speed>8,null,{timeout:30000});await page.keyboard.up('KeyW');const before=await snap();await page.keyboard.down('KeyA');await page.waitForTimeout(600);await page.keyboard.up('KeyA');if(Math.abs((await snap()).heading-before.heading)<.15)throw Error('Unresponsive steering');}
 await page.keyboard.press('Escape');await page.click('#quitBtn');await page.click('#navCar');await page.click('#nextCar');cars.push(car);console.log('VIEWS',car);
}
await page.click('#navSetup');await page.selectOption('#mode','race');await page.locator('.diffBtn').nth(2).click();await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race');await page.keyboard.down('KeyW');await page.waitForTimeout(2200);await page.keyboard.up('KeyW');const race=await snap();if(race.ai!==3||race.aiSpeeds.some(x=>!Number.isFinite(x)||x<1))throw Error('CPU not racing');console.log('CPU',race.aiSpeeds,'PLAYER',race.speed);
await page.setViewportSize({width:390,height:844});await settle();const buttons=[];for(const id of ['btnL','btnR','btnGas','btnBrake'])buttons.push(await page.locator('#'+id).boundingBox());for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){const a=buttons[i],b=buttons[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)throw Error('Portrait controls overlap');}await page.screenshot({path:'artifacts/release/portrait-race.png'});
fs.writeFileSync('artifacts/release/report.json',JSON.stringify({cars,race,errors},null,2));console.log('ERRORS',errors);await browser.close();if(errors.length)process.exitCode=1;
