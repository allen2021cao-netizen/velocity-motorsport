import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const baseline='artifacts/audio-review/production-baseline',out='artifacts/audio-review/preview-deploy';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(!fs.existsSync(baseline+'/index.html')||!fs.existsSync(baseline+'/sw.js'))throw Error('Missing captured production baseline');
fs.cpSync(baseline,out,{recursive:true});
fs.copyFileSync('dist/sound-preview.html',out+'/sound-preview.html');
// Content-addressed chunks can be added safely; never overwrite an existing race chunk.
for(const file of fs.readdirSync('dist/assets')){const from=path.join('dist/assets',file),to=path.join(out,'assets',file);if(!fs.statSync(from).isFile())continue;if(fs.existsSync(to)&&hash(from)!==hash(to))throw Error('Would overwrite production asset: '+file);if(!fs.existsSync(to))fs.copyFileSync(from,to);}
fs.cpSync('dist/audio/review-v1',out+'/audio/review-v1',{recursive:true});
let preserved=0;function verify(dir,relative=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const rel=path.join(relative,e.name);if(e.isDirectory())verify(path.join(dir,e.name),rel);else if(rel!=='sound-preview.html'){if(hash(path.join(baseline,rel))!==hash(path.join(out,rel)))throw Error('Production file changed: '+rel);preserved++;}}}verify(baseline);
const report={preservedProductionFiles:preserved,changedExistingFiles:['sound-preview.html'],addedAudioDirectory:'audio/review-v1',indexSha256:hash(out+'/index.html'),workerSha256:hash(out+'/sw.js'),manifestSha256:hash(out+'/offline-manifest.json')};fs.writeFileSync('artifacts/audio-review/deployment-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
