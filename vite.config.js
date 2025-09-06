import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['react', 'react-dom'],
          // Image gallery related
          gallery: ['react-image-gallery'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const name = facadeModuleId.split('/').pop().replace(/\.[^.]*$/, '')
            return `js/${name}-[hash].js`
          }
          return 'js/[name]-[hash].js'
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash].css'
          }
          if (/\.(png|jpg|jpeg|svg|gif|webp)$/.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    target: 'es2015'
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false
    }
  }
})