import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Force rebuild to pick up VITE_API_URL environment variable
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
    // Use esbuild for minification (preserves exports better than terser)
    minify: 'esbuild',
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup options
    rollupOptions: {
      // Disable tree-shaking to prevent export removal issues in production
      treeshake: false,
      output: {
        // Preserve module structure to avoid export issues
        preserveModules: false,
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
