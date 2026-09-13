import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('artifacts/vehicles',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});await page.selectOption('#quality','balanced');await page.click('#vehicleBtn');
for(let i=0;i<13;i++){
 const snap=await page.evaluate(()=>window.__velocity.snapshot());if(!snap.detailed||snap.wheelCount!==4)throw Error('Missing cabin or wheel assembly: '+snap.car);
 for(const view of ['front','rear']){await page.click(`[data-view="${view}"]`);await page.waitForTimeout(150);await page.screenshot({path:`artifacts/vehicles/${snap.car}-${view}.png`});}
 results.push(snap);console.log(snap.car,snap.modelKind,snap.drawCalls,snap.triangles);await page.click('#vehicleNext');
}
await page.click('[data-view="wheel"]');await page.screenshot({path:'artifacts/vehicles/wheel.png'});
await page.click('#vehicleBack');await page.click('#nextCar');await page.selectOption('#mode','time');await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:60000});await page.keyboard.press('KeyC');await page.screenshot({path:'artifacts/vehicles/cockpit.png'});await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__velocity.snapshot().speed>8,null,{timeout:60000});await page.keyboard.up('KeyW');
fs.writeFileSync('artifacts/vehicles/report.json',JSON.stringify({results,errors},null,2));
const html='<html><body style="background:#172027;color:white;margin:0;font:16px sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">'+results.map(r=>`<section><h3>${r.car}</h3><img style="width:100%" src="${r.car}-front.png"></section>`).join('')+'</body></html>';
fs.writeFileSync('artifacts/vehicles/gallery.html',html);await page.goto('http://127.0.0.1:5173/artifacts/vehicles/gallery.html');await page.setViewportSize({width:1800,height:1600});await page.screenshot({path:'artifacts/vehicles/gallery.png',fullPage:true});console.log('ERRORS',errors);await browser.close();if(errors.length)process.exitCode=1;
