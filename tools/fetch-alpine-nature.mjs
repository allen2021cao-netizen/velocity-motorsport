import fs from 'node:fs';
const dir='public/environment/alpine';fs.mkdirSync(dir,{recursive:true});
const log=[];
for(const [id,name]of [['rock_face','rock'],['aerial_grass_rock','grass'],['snow_02','snow']]){
 const files=await (await fetch('https://api.polyhaven.com/files/'+id)).json();
 for(const type of ['diff','nor_gl']){const file=files[type==='diff'?'Diffuse':type]?.['1k']?.jpg;if(!file)throw Error(id+type);const bytes=Buffer.from(await(await fetch(file.url)).arrayBuffer());fs.writeFileSync(`${dir}/${name}-${type}.jpg`,bytes);log.push({name:`${name}-${type}.jpg`,source:file.url,license:'CC0',bytes:bytes.length});}
}
const tree=await(await fetch('https://api.polyhaven.com/files/fir_tree_01')).json();
for(const type of ['diff','alpha']){const include=tree.blend['1k'].blend.include;const file=Object.entries(include).find(([key])=>key.includes('twig_'+type+'_'))?.[1];if(!file)throw Error(type);const bytes=Buffer.from(await(await fetch(file.url)).arrayBuffer());fs.writeFileSync(`${dir}/fir-${type}.png`,bytes);log.push({name:`fir-${type}.png`,source:file.url,license:'CC0',bytes:bytes.length});}
fs.writeFileSync(`${dir}/sources.json`,JSON.stringify(log,null,2));console.log(log.map(x=>({name:x.name,bytes:x.bytes})));

