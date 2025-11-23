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
    chunkSizeWarningLimit: 1000,
    // Rollup options
    rollupOptions: {
      output: {
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
