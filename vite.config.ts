import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE: '/' for a user site (mochicatsongs.github.io) or a custom domain;
// '/<repo>/' for a project site. Set via env in the GitHub workflow.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
