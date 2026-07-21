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

test('no axe violations across the page (WCAG 2.1 A/AA, incl. full colour-contrast)', async ({
  page,
}) => {
  // Full AA, nothing scoped out: D-034 darkened the showcase green and the nav
  // CTA pill so every surface clears the ratio (previously the two were inherited
  // AA gaps from Figma, deviated from to earn compliance).
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
