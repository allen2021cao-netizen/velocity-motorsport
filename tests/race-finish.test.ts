import test from 'node:test';
import assert from 'node:assert/strict';
import {allFinished,crossingTime} from '../src/race-finish';
import {freshDriver,opponentPit} from '../src/race-ai';
const setup={tires:'sport',assist:'sport',downforce:.4,balance:55,weather:'clear',mode:'endurance'};
test('player winning never ends the race while an opponent is still driving',()=>{
 const player={finished:true,finishTime:100},ais=[{finished:false,finishTime:null as number|null},{finished:true,finishTime:105}];
 assert.equal(allFinished(player,ais),false);ais[0]={finished:true,finishTime:110};assert.equal(allFinished(player,ais),true);assert.equal(allFinished(player,[]),true);
});
test('arrival time is an actual crossing and remains independent of the player clock',()=>{
 assert.equal(crossingTime(990,1010,1000,120,1),119.5);assert.equal(crossingTime(980,990,1000,120,1),null);assert.equal(crossingTime(1005,1010,1000,120,1),null);
});
test('endurance opponents must stop eight seconds before receiving fuel and same-compound tires',()=>{
 const a={dist:1018,speed:0,driver:freshDriver()};a.driver.fuel=20;a.driver.wear=.6;
 for(let i=0;i<7;i++)assert.equal(opponentPit(a,1000,8,setup,1).holding,true);
 assert.equal(a.driver.fuel,20);opponentPit(a,1000,8,setup,1);assert.equal(a.driver.fuel,100);assert.equal(a.driver.wear,0);assert.equal(setup.tires,'sport');assert.equal(opponentPit(a,1000,8,setup,.1).holding,false);
});
