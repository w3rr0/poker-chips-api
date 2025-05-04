import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      viteStaticCopy({
          targets: [
              {
                  src: 'staticwebapp.config.json',
                  dest: '.'
              }
          ]
      })],
  base: '/',
  build: {
      outDir: 'dist'
  }
})
