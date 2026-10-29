import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('/node_modules/')) {
            return;
          }

          // Heavy independent visualization & backend libraries
          if (normalizedId.includes('/node_modules/three/')) {
            return 'vendor-three';
          }

          if (normalizedId.includes('/node_modules/gsap/')) {
            return 'vendor-gsap';
          }

          if (normalizedId.includes('/node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
        },
      },
    },
  },
})
