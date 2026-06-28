import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// HOLLOWREACH build config.
// `base` defaults to '/hollowreach/' so the game can be served from a
// project sub-path on GitHub Pages. Override with VITE_BASE for other hosts
// (e.g. `VITE_BASE=/ npm run build` for a root deploy on Netlify).
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? (mode === 'production' ? '/hollowreach/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@loc': fileURLToPath(new URL('./src/localization', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
}));
