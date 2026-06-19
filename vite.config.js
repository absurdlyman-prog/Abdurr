import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Smart Drug Formulary',
        short_name: 'Formulary',
        description: 'DOH Abu Dhabi drug formulary — search 22,000+ medications',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell and assets
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Don't cache the large Excel file — too big for service worker cache
        globIgnores: ['**/*.xlsx'],
        runtimeCaching: [
          {
            // Cache the Excel formulary file with a network-first strategy
            urlPattern: /\.xlsx$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'formulary-data',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
            },
          },
        ],
      },
    }),
  ],
});
