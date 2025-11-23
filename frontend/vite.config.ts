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
    // Minification for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Rollup options for optimal code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // Separate PDF.js into its own chunk (it's huge - 1MB+)
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            // Separate React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Separate Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Separate Google Genai
            if (id.includes('@google/genai')) {
              return 'genai';
            }
            // Everything else in vendor chunk
            return 'vendor';
          }
        },
        // Asset file names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          let extType = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        // Chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Entry file names
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'react', 'react-dom'],
    esbuildOptions: {
      target: 'esnext',
    },
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
