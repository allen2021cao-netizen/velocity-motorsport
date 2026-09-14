import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function offlineBuild(){return {name:'offline-game',closeBundle(){
 const entries:{url:string;bytes:number;hash:string}[]=[];
 function walk(dir:string){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(!['sw.js','offline-manifest.json'].includes(item.name)){const data=fs.readFileSync(file);entries.push({url:'/'+path.relative('dist',file).replaceAll('\\','/'),bytes:data.length,hash:crypto.createHash('sha256').update(data).digest('hex')});}}}
 walk('dist');entries.sort((a,b)=>a.url.localeCompare(b.url));
 const manifest={version:crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0,16),entries};
 fs.writeFileSync('dist/offline-manifest.json',JSON.stringify(manifest));
 fs.writeFileSync('dist/sw.js','const MANIFEST='+JSON.stringify(manifest)+';\n'+fs.readFileSync('tools/offline-worker.js','utf8'));
}};}
