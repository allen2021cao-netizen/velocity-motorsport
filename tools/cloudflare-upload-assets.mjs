import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
// A short-lived Pages upload JWT is supplied by the Cloudflare connector.
const token=fs.readFileSync('artifacts/cf-upload-token.txt','utf8').trim();
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.wasm':'application/wasm','.md':'text/plain','.txt':'text/plain'};
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(!['_headers','_redirects'].includes(e.name)){const bytes=fs.readFileSync(file),type=types[path.extname(file)]||'application/octet-stream',hash=crypto.createHash('sha256').update(bytes).update(type).digest('hex').slice(0,32);files.push({file,url:'/'+path.relative('dist',file).replaceAll('\\','/'),hash,type,size:bytes.length});}}}
walk('dist');
async function request(route,body){for(let attempt=0;attempt<4;attempt++){try{const r=await fetch('https://api.cloudflare.com/client/v4/pages/assets/'+route,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});const data=await r.json();if(!r.ok||!data.success)throw Error(route+' status '+r.status+' '+JSON.stringify(data.errors));return data.result;}catch(e){if(attempt===3)throw e;await new Promise(r=>setTimeout(r,2000*(attempt+1)));}}}
const hashes=[...new Set(files.map(f=>f.hash))],missing=new Set(await request('check-missing',{hashes}));
const queue=files.filter(f=>missing.has(f.hash)),seen=new Set();let index=0,done=0;
async function worker(){while(index<queue.length){const batch=[];let size=0;while(index<queue.length&&(size<5e6||!batch.length)){const f=queue[index++];if(seen.has(f.hash))continue;seen.add(f.hash);size+=f.size;batch.push({key:f.hash,value:fs.readFileSync(f.file).toString('base64'),metadata:{contentType:f.type},base64:true});}if(batch.length){await request('upload',batch);done+=batch.length;console.log('Uploaded '+done+' / '+missing.size);}}}
await Promise.all([worker(),worker(),worker()]);
await request('upsert-hashes',{hashes});
const remaining=await request('check-missing',{hashes});if(remaining.length)throw Error('Missing '+remaining.length+' assets');
fs.writeFileSync('artifacts/cloudflare-manifest.json',JSON.stringify(Object.fromEntries(files.map(f=>[f.url,f.hash]))));
console.log(JSON.stringify({files:files.length,bytes:files.reduce((n,f)=>n+f.size,0),missing:remaining.length}));
