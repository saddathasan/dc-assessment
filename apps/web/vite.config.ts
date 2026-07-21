/// <reference types="vitest/config" />
// Vite config for the web app: file-based router codegen, React, Tailwind v4,
// the same-origin /api dev proxy, and the Vitest environment.
import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

/**
 * Preloads the hero-weight display font (D-005): Fontsource ships Bricolage as a
 * hashed woff2, so the <link rel=preload> can't be static in index.html — this
 * finds the emitted latin variable file at build time and injects it. Build-only,
 * so the dev-served Fidelity Gate (which awaits document.fonts.ready) is untouched.
 */
function preloadHeroFont() {
  return {
    name: 'preload-hero-font',
    apply: 'build' as const,
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string, ctx: { bundle?: Record<string, unknown> }) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) =>
          /bricolage-grotesque-latin-wght-normal-[^/]*\.woff2$/.test(f),
        )
        if (!file) return html
        return {
          html,
          tags: [
            {
              tag: 'link',
              attrs: {
                rel: 'preload',
                as: 'font',
                type: 'font/woff2',
                href: `/${file}`,
                crossorigin: '',
              },
              injectTo: 'head-prepend' as const,
            },
          ],
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    preloadHeroFont(),
  ],
  server: {
    // Dev serves same-origin: /api proxies to the local Express app, so no
    // CORS anywhere — mirroring the production Worker topology (D-012).
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  // `vite preview` mirrors the same-origin topology so a production build can be
  // measured (Lighthouse) against real API content, not just the dev bundle.
  preview: {
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
    // Unit tests must never touch the network: happy-dom would otherwise
    // really fetch iframe/script/css URLs (e.g. the video modal's YouTube embed).
    environmentOptions: {
      happyDOM: {
        settings: {
          disableIframePageLoading: true,
          disableJavaScriptFileLoading: true,
          disableCSSFileLoading: true,
        },
      },
    },
  },
})
