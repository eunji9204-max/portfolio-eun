import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from https://eunji9204-max.github.io/portfolio-eun/
  base: '/portfolio-eun/',
  plugins: [react()],
})
