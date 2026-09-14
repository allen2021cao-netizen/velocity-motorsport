import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {prune,simplify,draco} from '@gltf-transform/functions';import draco3d from 'draco3dgltf';import {MeshoptSimplifier} from 'meshoptimizer';import fs from 'node:fs';
await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});
for(const key of ['porsche','bmw','gt40','f40','r34','supra-mk4','r8','mcf1','veneno','slr','challenger','c7'].filter(k=>!process.argv[2]||process.argv.slice(2).includes(k))){
 const doc=await io.read(`public/models/${key}-detailed.glb`);
 for(const n of [...doc.getRoot().listNodes()])if(/^(wheel|caliper)_/.test(n.getName()))n.dispose();
 const count=()=>doc.getRoot().listMeshes().reduce((a,m)=>a+m.listPrimitives().reduce((b,p)=>b+(p.getIndices()?.getCount()??0)/3,0),0);
 await doc.transform(prune());const before=count();await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.28,error:key==='slr'?.02:.003}),prune(),draco({quantizePosition:16,quantizeNormal:12}));
 const output=`public/models/${key}-body-lod.glb`;await io.write(output,doc);console.log(key,{before,after:count(),bytes:fs.statSync(output).size});
}
