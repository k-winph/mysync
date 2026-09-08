import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// IMPORTANT: `base` must match the GitHub repo name so asset paths work on
// GitHub Pages (served at https://<user>.github.io/mysync/).
// `basename` in the router (see main.jsx) must match this value.
export default defineConfig({
  base: '/mysync/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'MySync - Personal Finance',
        short_name: 'MySync',
        description: 'Personal finance manager: track spending, debts and investments.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/mysync/',
        start_url: '/mysync/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
