import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Base URL for production (Django serves static files from /static/)
  // In dev mode, we want standard root path
  base: command === 'build' ? '/static/' : '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  }
}))
