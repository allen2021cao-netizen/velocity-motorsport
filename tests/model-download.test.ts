import test from 'node:test';import assert from 'node:assert/strict';import {ensureDetailedCar} from '../src/detailed-vehicles';
test('a failed model can be retried and a stalled selection does not block another car',async()=>{
 const original=globalThis.fetch;let requests=0,release!:(r:Response)=>void;
 globalThis.fetch=(async()=>{requests++;if(requests===1)return new Promise<Response>(resolve=>release=resolve);return new Response('unavailable',{status:503});}) as typeof fetch;
 const first:any={cfg:{type:'p911'}},second:any={cfg:{type:'r34'}};
 try{
  const pending=ensureDetailedCar(first);const next=ensureDetailedCar(second);
  // The new selection issues its request immediately, independently of the first one.
  assert.equal(requests,2);assert.equal(await next,false);assert.equal(second.assetStatus,'fallback');
  assert.equal(await ensureDetailedCar(second),false);assert.equal(requests,3);
  release(new Response('unavailable',{status:503}));assert.equal(await pending,false);
 }finally{globalThis.fetch=original;}
});
