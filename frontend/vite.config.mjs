import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [react({ include: "**/*.{jsx,js}" })],

  server: command === 'serve' ? {
    port: 80,
    host: true,
    middlewareMode: false,
    fs: { strict: false },
  } : undefined,

  build: {
    outDir: 'dist',
  },

  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },

  preview: {
    port: 80,
    host: true,
  },
}))
