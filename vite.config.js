import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', 'three/addons/misc/Timer.js'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
