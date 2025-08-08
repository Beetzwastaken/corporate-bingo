import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand'],
          router: ['react-router-dom']
        }
      }
    },
    // Use default minification for better compatibility
    minify: true,
    // Optimize CSS
    cssMinify: true,
    // Target modern browsers for better compression
    target: 'esnext'
  },
  server: {
    // Optimize dev server
    port: 5175,
    host: true
  }
})
