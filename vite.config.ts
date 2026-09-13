import { defineConfig } from 'vite';
export default defineConfig({build:{target:'es2022',rollupOptions:{output:{manualChunks:{three:['three']}}}},server:{port:5173,strictPort:true}});
