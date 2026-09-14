import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),manifest=JSON.parse(await fs.readFile('tools/classic-vehicle-sources.json','utf8'));
for(const source of manifest){
 const dir=path.resolve('artifacts/model-sources','fetch-'+source.key);await fs.mkdir(dir,{recursive:true});
 for(const file of source.files){const target=path.resolve(dir,file.path);if(!target.startsWith(dir+path.sep))throw Error('Invalid source path');const response=await fetch(file.url);if(!response.ok)throw Error(`${source.key}: ${response.status}`);let bytes=Buffer.from(await response.arrayBuffer());if(file.canonicalJson)bytes=Buffer.from(JSON.stringify(JSON.parse(bytes.toString())));if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error(`${source.key}: source changed; re-audit before accepting`);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);}
 const out=`artifacts/model-sources/${source.key}.glb`;
 if(source.format==='glb')await fs.copyFile(path.join(dir,source.files[0].path),out);else await io.write(out,await io.read(path.join(dir,'scene.gltf')));
 console.log(source.key,'verified');
}
