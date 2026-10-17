import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        serviceWorker: resolve(__dirname, 'src/background/ServiceWorker.ts'),
        content: resolve(__dirname, 'src/content/content.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'serviceWorker') return 'background/ServiceWorker.js';
          if (chunkInfo.name === 'content') return 'content/content.js';
          return '[name]/[name].js';
        }
      }
    }
  }
});
