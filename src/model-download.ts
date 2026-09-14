import type {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
/** Same-origin assets are fulfilled from the offline pack when available. */
export async function downloadModel(loader:GLTFLoader,url:string){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
 try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('模型下载失败 '+response.status);const bytes=await response.arrayBuffer();if(bytes.byteLength<12||new DataView(bytes).getUint32(0,true)!==0x46546c67)throw Error('模型文件不完整，请重试');return await loader.parseAsync(bytes,'/models/');}
 finally{clearTimeout(timer);}
}
