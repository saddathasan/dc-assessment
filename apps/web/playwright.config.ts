/**
 * Playwright config for the Fidelity Gate (D-013/D-021): per-Section screenshots
 * diffed ≤5% against Figma-render Baselines at the design's two widths, plus
 * zero-tolerance computed-style asserts inside the specs.
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/fidelity',
  // Baselines are sliced from design/figma/renders/ by fidelity:slice — never
  // auto-recorded, so a missing Baseline must fail loudly instead of self-creating.
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  updateSnapshots: 'none',
  expect: {
    // ≤5% pixel diff absorbs Figma-vs-Chromium font antialiasing; the numeric
    // layer in the specs is the authoritative pixel proof (D-021).
    toMatchSnapshot: { maxDiffPixelRatio: 0.05 },
  },
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    // Screenshots come out @2x to match the render Baselines' export scale.
    deviceScaleFactor: 2,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true },
    },
  ],
  // Same dev topology as `pnpm dev` (D-012); running servers are reused, so the
  // gate composes with the user's live localhost session.
  webServer: [
    {
      command: 'pnpm --filter api dev',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
})
