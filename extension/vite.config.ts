import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    crx({ manifest }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    // CRXJS generates service-worker-loader.js that imports from http://localhost:5173
    // so we MUST bind to 'localhost' (not '127.0.0.1') for the extension to connect
    host: 'localhost',
    cors: true,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
