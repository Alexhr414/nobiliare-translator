import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // `npm run dev` serves only the SPA. To exercise the real LLM path, run
    // `npm run dev:api` in a second terminal; it hosts the Pages Function on
    // :8788 and this proxy forwards /api/* to it. Without it the client shows
    // the "API failed, demo mode" banner and uses the offline engine.
    proxy: {
      '/api': { target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8788', changeOrigin: false },
    },
  },
})
