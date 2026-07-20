/**
 * Captures Baselines for Sections that deliberately deviate from the artboard
 * (FidelityTarget.deviated, e.g. D-032). These have no render pixel to slice
 * against, so their Baseline comes from the build instead of design/figma/renders/.
 *
 * The screenshot path mirrors hero/footer.spec's expectBaseline exactly (same
 * clip, deviceScaleFactor, reduced motion, animations disabled, fullPage) so the
 * gate diffs like against like. Requires the dev server (pnpm dev) running, the
 * same topology the gate reuses. Regenerate: pnpm --filter web fidelity:baseline:build
 * Run with Node ≥24 (native TypeScript type stripping).
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { targets } from './sections.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'baselines')
const BASE_URL = 'http://localhost:5173'

const deviated = targets.filter((t) => t.deviated)
if (deviated.length === 0) {
  console.log('no deviated Sections — nothing to build')
  process.exit(0)
}

const browser = await chromium.launch()
for (const target of deviated) {
  // Mobile Sections are 393 wide; match the gate's mobile project (D-021).
  const mobile = target.clip.width <= 393
  const context = await browser.newContext({
    viewport: mobile ? { width: 393, height: 852 } : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.getByTestId('footer-wordmark').waitFor()
  await page.screenshot({
    path: join(outDir, `${target.id}.png`),
    clip: target.clip,
    animations: 'disabled',
    fullPage: true,
  })
  await context.close()
  console.log(`built ${target.id}.png (deviated ${target.deviated}) from ${BASE_URL}`)
}
await browser.close()
