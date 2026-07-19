/// <reference types="vitest/config" />
// Vite config for the web app: file-based router codegen, React, Tailwind v4,
// the same-origin /api dev proxy, and the Vitest environment.
import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    // Dev serves same-origin: /api proxies to the local Express app, so no
    // CORS anywhere — mirroring the production Worker topology (D-012).
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    // tests/ belongs to the Playwright Fidelity Gate, not Vitest.
    exclude: [...configDefaults.exclude, 'tests/**'],
  },
})
