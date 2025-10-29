import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,js}"
  })],
  server: {
    port: 3000,
    host: true,
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist'
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
})