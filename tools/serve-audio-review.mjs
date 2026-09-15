import {createServer} from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true,watch:{ignored:['**/artifacts/**']}}});await server.listen();server.printUrls();
