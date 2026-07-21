/**
 * Accessibility gate (MS-11 / T11.2): axe-core over the settled page at both
 * artboard widths (the desktop/mobile projects). Runs WCAG 2.0 + 2.1, levels A
 * and AA. Keyboard focus is a separate concern — the page-wide :focus-visible
 * ring (styles/index.css) — since axe cannot see focus state.
 *
 * color-contrast is asserted on its own so the ONE design-inherited exception can
 * be scoped out precisely rather than by disabling the rule everywhere.
 */
import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.getByTestId('footer-wordmark').waitFor()
})

test('no axe violations across the page (WCAG 2.1 A/AA, contrast checked separately)', async ({
  page,
}) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('contrast is AA everywhere but the two design-inherited spots', async ({ page }) => {
  // Exactly two AA contrast gaps remain, both inherited verbatim from Figma, so
  // raising either changes the design's colours and breaks a Baseline — a
  // design-owner decision (tracked as an open question), scoped out here rather
  // than silently patched:
  //   1. #showcase — the product band's light text on green-700.
  //   2. the nav "Book a meeting" CTA — white on a 25%-white pill over deep
  //      green, computed 4.04:1 vs the 4.5 threshold (0.46 short).
  // Every other surface clears comfortably (white on ink/deep 17–18:1, accent
  // on ink 13:1), which this still guards.
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include('body')
    .exclude('#showcase')
    .exclude('a[href="#contact"]')
    .options({ runOnly: ['color-contrast'] })
    .analyze()
  expect(results.violations).toEqual([])
})
