import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('artifacts/environments',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__velocity,null,{timeout:90000});
await page.click('#navSetup');await page.selectOption('#quality','balanced');await page.selectOption('#weather','clear');
await page.click('#navTrack');
const results=[];
for(let i=0;i<12;i++){
 await page.locator('.trackBtn').nth(i).click();await page.waitForFunction(()=>window.__velocity.snapshot().environment.sky.status==='ready'&&window.__velocity.snapshot().environment.surfaces==='ready',null,{timeout:60000});
 await page.click('#tourBtn');await page.waitForTimeout(350);const report=await page.evaluate(()=>window.__velocity.snapshot());
 if(report.environment.minimumBuildingClearance<12)throw Error('Building intersects racing corridor');
 if(report.environment.buildings<1)throw Error('Empty city');
 await page.screenshot({path:`artifacts/environments/${report.track}.png`});results.push(report);console.log(report.track,report.environment.buildings,report.drawCalls,report.triangles,report.environment.sky.status);
 await page.click('#tourBack');
}
await page.locator('.trackBtn').nth(7).click();await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:60000});await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__velocity.snapshot().speed>12,null,{timeout:60000});await page.keyboard.up('KeyW');await page.screenshot({path:'artifacts/environments/driving.png'});
await page.keyboard.press('Escape');await page.click('#quitBtn');await page.click('#navSetup');await page.selectOption('#weather','rain');await page.click('#navTrack');await page.locator('.trackBtn').nth(3).click();await page.waitForFunction(()=>window.__velocity.snapshot().environment.sky.status==='ready',null,{timeout:60000});await page.click('#startBtn');await page.waitForFunction(()=>window.__velocity.snapshot().state==='race',null,{timeout:60000});await page.screenshot({path:'artifacts/environments/rain.png'});
fs.writeFileSync('artifacts/environments/report.json',JSON.stringify({results,errors},null,2));
fs.writeFileSync('artifacts/environments/gallery.html','<html><body style="margin:0;background:#12191c;color:white;font:16px sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:14px">'+results.map(r=>`<section><h3>${r.track}</h3><img style="width:100%" src="${r.track}.png"></section>`).join('')+'</body></html>');
await page.goto('http://127.0.0.1:5173/artifacts/environments/gallery.html');await page.setViewportSize({width:1800,height:1700});await page.screenshot({path:'artifacts/environments/gallery.png',fullPage:true});
console.log('ERRORS',errors);await browser.close();if(errors.length)process.exitCode=1;
