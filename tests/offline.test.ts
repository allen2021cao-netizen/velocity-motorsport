import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {webcrypto,createHash} from 'node:crypto';
test('all 13 vehicle GLBs embed their buffers and textures; no third-party model dependency',()=>{
 const files=fs.readdirSync('public/models').filter(f=>f.endsWith('-detailed.glb')||f==='ferrari-458.glb');assert.equal(files.length,13);
 for(const file of files){const bytes=fs.readFileSync('public/models/'+file),length=bytes.readUInt32LE(12),json=JSON.parse(bytes.toString('utf8',20,20+length));for(const asset of [...json.buffers||[],...json.images||[]])assert.ok(!asset.uri||asset.uri.startsWith('data:'),file+' has external URI');}
});
test('offline worker validates assets, resumes partial downloads and serves a navigation without network',async()=>{
 const bodies=new Map([['/index.html','game shell'],['/models/test.glb','model bytes'],['/audio/test.wav','audio bytes']]);
 const entries=[...bodies].map(([url,body])=>({url,bytes:body.length,hash:createHash('sha256').update(body).digest('hex')}));
 const store=new Map<string,Response>(),handlers:any={},messages:any[]=[];let online=true,requests=0,corrupt=false;
 const cache={match:async(k:string)=>store.get(k)?.clone(),put:async(k:string,r:Response)=>{store.set(k,r.clone());}};
 const context={MANIFEST:{version:'test',entries},URL,Response,Headers,TextEncoder,TextDecoder,AbortController,setTimeout,clearTimeout,crypto:webcrypto,caches:{open:async()=>cache},fetch:async(request:any)=>{requests++;if(!online)throw Error('offline');const url=typeof request==='string'?request:request.url;return new Response(corrupt?'bad data':(bodies.get(new URL(url,'https://game.test').pathname)+(new URL(url,'https://game.test').pathname==='/index.html'?`<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{}'></script>`:'')),{status:200});},self:{location:{origin:'https://game.test'},clients:{claim:async()=>{},matchAll:async()=>[{postMessage:(s:any)=>messages.push(s)}]},addEventListener:(name:string,fn:any)=>handlers[name]=fn}};
 vm.runInNewContext(fs.readFileSync('tools/offline-worker.js','utf8'),context);
 async function event(name:string,data:any={}){let task:Promise<any>=Promise.resolve();handlers[name]({...data,waitUntil:(p:Promise<any>)=>task=p,respondWith:(p:Promise<any>)=>task=p});return task;}
 await event('install');assert.equal(store.size,1);assert.equal(await [...store.values()][0].clone().text(),'game shell','proxy analytics must normalize back to verified build bytes');
 corrupt=true;await event('message',{data:{type:'CACHE_GAME'}});assert.match(messages.at(-1).error,/版本/);assert.equal(store.size,1);
 corrupt=false;await event('message',{data:{type:'CACHE_GAME'}});assert.equal(store.size,3);assert.equal(messages.at(-1).count,3);
 const before=requests;await event('message',{data:{type:'CACHE_GAME'}});assert.equal(requests,before,'resume must reuse all saved bytes');
 online=false;const model=await event('fetch',{request:{url:'https://game.test/models/test.glb',method:'GET',mode:'cors'}});assert.equal(await model.text(),'model bytes');assert.equal(requests,before);
 const page=await event('fetch',{request:{url:'https://game.test/',method:'GET',mode:'navigate'}});assert.equal(await page.text(),'game shell');
});
