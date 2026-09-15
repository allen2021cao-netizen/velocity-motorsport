import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={};page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});await page.click('#navSetup');await page.selectOption('#mode','race');await page.locator('#quickQuality [data-quality=low]').click();await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:90000});
 for(const scenario of ['crowded','corner','blocked','lapped','scrape']){
  await page.evaluate(s=>window.__raceCombatTest(s),scenario);const start=await page.evaluate(()=>window.__velocity.snapshot());let maximumLateral=0;
  for(let i=0;i<16;i++){await page.waitForTimeout(250);const snap=await page.evaluate(()=>window.__velocity.snapshot());for(const a of snap.aiDiagnostics){assert.ok([a.speed,a.distance,a.lat,a.lateralVelocity,...a.position].every(Number.isFinite));maximumLateral=Math.max(maximumLateral,Math.abs(a.lateralVelocity));}}
  const end=await page.evaluate(()=>window.__velocity.snapshot());assert.ok(end.aiDiagnostics.every((a,i)=>a.distance>start.aiDiagnostics[i].distance+10),'all cars keep racing: '+scenario);
  report[scenario]={maximumLateral,progress:end.aiDiagnostics.map((a,i)=>a.distance-start.aiDiagnostics[i].distance),final:end.aiDiagnostics};
 }
 assert.deepEqual(errors,[]);fs.mkdirSync('artifacts/ai-combat',{recursive:true});fs.writeFileSync('artifacts/ai-combat/browser.json',JSON.stringify(report,null,2));await page.screenshot({path:'artifacts/ai-combat/preview.png'});console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k,v])=>[k,{progress:v.progress,maximumLateral:v.maximumLateral}]))));
}finally{await browser.close();}
