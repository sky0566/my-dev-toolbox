import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/my-dev-toolbox/portfolio/',
  build: {
    outDir: '../docs/portfolio',
    emptyOutDir: true,
  },
})