import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sources=[
 ['porsche','https://raw.githubusercontent.com/playcanvas/web-components/main/examples/assets/models/porsche-911-carrera-4s.glb','421fdabf0da312edb3c22dc0fc915bcc75551ff0db7374a7ebac8af80efc5ea2'],
 ['bmw','https://raw.githubusercontent.com/lukaizj/car-mod-saas/main/public/models/bmw-m4.optimized.glb','9379539798ba1a3d79ebe52d52469778af6334e8261e834536d5cd4726c720a5'],
 ['gt40','https://raw.githubusercontent.com/Vivekkk-1/3D-Models/main/Cars/ford_gt40.glb','c4357b6dd42421559a8f981ca2bcbe93317ebde10b4ab0f0e18b972918804f9c'],
];
await fs.mkdir('artifacts/model-sources',{recursive:true});
for(const [name,url,hash] of sources){const r=await fetch(url);if(!r.ok)throw Error(`${name}: ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==hash)throw Error(`${name}: upstream changed; review attribution and geometry before updating hash`);await fs.writeFile(`artifacts/model-sources/${name}.glb`,bytes);console.log(name,bytes.length);}
