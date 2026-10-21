import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Fix: global is not defined
  define: {
    global: 'globalThis',
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://clothing-swapping-platform.onrender.com',
        changeOrigin: true,
      },
      '/ws': {
        target: 'https://clothing-swapping-platform.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})