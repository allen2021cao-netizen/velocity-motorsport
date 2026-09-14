import {gripFor} from '../src/physics';
import {createTrackCurve,circuitCurvature} from '../src/circuits/circuit';
import {TRACKS} from '../src/tracks.js';
import {aiTargetSpeed,stepOpponent,freshDriver,roadCurvature} from '../src/race-ai';
const setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'},car={top:296,accel:.84,handling:.9};
const results=[];
for(const theme of ['shanghai','monaco','miami','vegas']){
 const curve=createTrackCurve(TRACKS.find(t=>t.theme===theme)!),n=1400,length=curve.getLength(),seg=length/n;
 const curvature=circuitCurvature(Array.from({length:n},(_,i)=>curve.getTangentAt(i/n)));
 const row:{city:string;tiers:unknown[]}={city:theme,tiers:[]};
 for(let difficulty=0;difficulty<3;difficulty++){
  const driver=freshDriver();let distance=0,time=0,peak=0,maxCornerExcess=0;const dt=1/120;
  let target=0,timer=0;
  while(distance<length&&time<900){const idx=Math.floor(distance/seg)%n,k=roadCurvature(curvature,seg,idx);
   if(timer<=0){target=aiTargetSpeed(curvature,seg,idx,car,setup,difficulty,0,driver);timer=.08;}timer-=dt;
   driver.speed=stepOpponent(driver.speed,target,car,setup,difficulty,dt,0,driver,k);
   distance+=driver.speed*dt;time+=dt;peak=Math.max(peak,driver.speed*3.6);
   maxCornerExcess=Math.max(maxCornerExcess,driver.speed*driver.speed*k/9.81-gripFor(setup,driver.wear,driver.temperature)*(1+setup.downforce*driver.speed*driver.speed*.000025)*(.85+car.handling*.18));
  }
  row.tiers.push({difficulty,seconds:+time.toFixed(2),peakKmh:+peak.toFixed(1),cornerDemandExcessG:+maxCornerExcess.toFixed(3)});
 }
 results.push(row);
}
console.log(JSON.stringify({method:'One standing-start lap, identical car/setup, dry weather, no traffic or mistakes; lap pace only, not human win rates.',results},null,2));
