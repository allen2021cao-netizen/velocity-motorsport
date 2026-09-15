import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173/');
 await page.waitForFunction(()=>window.__velocity&&navigator.serviceWorker.controller,null,{timeout:90000});
 // Reload once under the installed worker so all visited assets are in its cache.
 await page.reload();await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
 await page.click('#navSetup');await page.selectOption('#mode','race');await page.click('#quickQuality [data-quality=balanced]');
 await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:90000});
 await page.keyboard.down('KeyW');await page.waitForTimeout(5500);await page.keyboard.up('KeyW');
 const racing=await page.evaluate(()=>window.__velocity.snapshot());assert.equal(racing.ai,3);assert.ok(racing.aiSpeeds.every(v=>v>1&&Number.isFinite(v)));assert.ok(racing.cameraEye.every(Number.isFinite));
 await page.screenshot({path:'artifacts/driving-experience/ai-race.png'});
 const storage=await page.evaluate(async()=>{const manifest=await (await fetch('/offline-manifest.json')).json(),cache=await caches.open('velocity-offline-v1');return{cached:(await cache.keys()).length,total:manifest.entries.length};});
 assert.ok(storage.cached<storage.total,'must not silently fetch the complete offline pack');
 await page.keyboard.press('Escape');await page.click('#quitBtn');
 await page.context().setOffline(true);await page.reload();await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
 await page.waitForFunction(()=>window.__velocity.snapshot().assetStatus==='ready',null,{timeout:30000});
 const offline=await page.evaluate(()=>window.__velocity.snapshot());assert.equal(offline.detailed,true);assert.deepEqual(errors,[]);
 const report={aiCars:racing.ai,aiSpeeds:racing.aiSpeeds,storage,visitedCarOffline:true,errors};fs.writeFileSync('artifacts/driving-experience/production-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
