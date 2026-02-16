import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
    // Personalizzazioni server comuni:
    // port: 3000,
    // host: true,
    // proxy: { '/api': 'http://localhost:8080' }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Aggiungi alias personalizzati qui:
      // '@components': path.resolve(__dirname, './src/components'),
      // '@utils': path.resolve(__dirname, './src/utils'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // Altre configurazioni comuni:
  // build: {
  //   outDir: 'dist',
  //   sourcemap: true
  // }
})
