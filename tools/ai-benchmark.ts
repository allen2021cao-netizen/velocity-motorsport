import {gripFor} from '../src/physics';
import {createTrackCurve,circuitCurvature} from '../src/circuits/circuit';
import {TRACKS} from '../src/tracks.js';
import {aiTargetSpeed,stepOpponent,freshDriver,roadCurvature,drivingCurvature,opponentPit} from '../src/race-ai';
const setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'race'},car={top:296,accel:.84,handling:.9};
const wet=process.argv.includes('--rain')?1:0;
setup.tires=process.argv.includes('--wet-tires')?'wet':process.argv.includes('--soft-tires')?'soft':'sport';
const laps=process.argv.includes('--endurance')?8:1;if(laps===8)setup.mode='endurance';
const results=[];
for(const theme of TRACKS.map(t=>t.theme)){
 const curve=createTrackCurve(TRACKS.find(t=>t.theme===theme)!),n=1400,length=curve.getLength(),seg=length/n;
 const curvature=drivingCurvature(Array.from({length:n},(_,i)=>curve.getTangentAt(i/n)));
 const row:{city:string;tiers:unknown[]}={city:theme,tiers:[]};
 for(let difficulty=0;difficulty<3;difficulty++){
  const driver=freshDriver();driver.temperature=60;let distance=0,time=0,peak=0,maxCornerExcess=0;const dt=1/120;
  let target=0,timer=0;const pitCar={dist:0,speed:0,driver};
  while(distance<length*laps&&time<7200){const idx=Math.floor(distance/seg)%n,k=roadCurvature(curvature,seg,idx);
   if(timer<=0){target=aiTargetSpeed(curvature,seg,idx,car,setup,difficulty,wet,driver);timer=.08;}timer-=dt;
   pitCar.dist=distance;pitCar.speed=driver.speed;const pit=opponentPit(pitCar,length,laps,setup,dt,wet);
   driver.speed=pit.holding?0:stepOpponent(driver.speed,Math.min(target,pit.target),car,setup,difficulty,dt,wet,driver,k);
   distance+=driver.speed*dt;time+=dt;peak=Math.max(peak,driver.speed*3.6);
   maxCornerExcess=Math.max(maxCornerExcess,driver.speed*driver.speed*k/9.81-gripFor(setup,driver.wear,driver.temperature,wet)*(1+setup.downforce*driver.speed*driver.speed*.000025)*(.85+car.handling*.18));
  }
  row.tiers.push({difficulty,finished:distance>=length*laps,fuel:+driver.fuel.toFixed(1),seconds:+time.toFixed(2),peakKmh:+peak.toFixed(1),cornerDemandExcessG:+maxCornerExcess.toFixed(3)});
 }
 results.push(row);
}
console.log(JSON.stringify({method:'Standing-start laps, identical car/setup, no traffic or mistakes; lap pace only, not human win rates.',laps,wet,tires:setup.tires,results},null,2));
