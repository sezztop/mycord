import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so it works on GitHub Pages project sites (/repo-name/)
export default defineConfig({
  plugins: [react()],
  base: './',
})
