import { defineConfig } from 'vite';
export default defineConfig({build:{target:'es2022',rollupOptions:{input:{main:'index.html',soundPreview:'sound-preview.html'},output:{manualChunks:{three:['three']}}}},server:{port:5173,strictPort:true}});
