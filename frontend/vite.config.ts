import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './components'),
      'services': path.resolve(__dirname, './services'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..']
    }
  },
  worker: {
    format: 'es'
  }
})
