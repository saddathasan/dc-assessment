/**
 * Fidelity Gate — Navigation Section (MS-2). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines; numeric layer: zero-tolerance computed-style
 * asserts on the values extracted from file.json (D-021). The hamburger overlay
 * is Authored Content with no designed Baseline, so it gets numeric checks only.
 */
import { test, expect, type Page } from '@playwright/test'
import { targets } from './sections.ts'

/** Clips the page to a manifest region and diffs it against the Section's Baseline. */
async function expectBaseline(page: Page, id: string): Promise<void> {
  const target = targets.find((t) => t.id === id)
  if (!target) throw new Error(`no fidelity target '${id}'`)
  const shot = await page.screenshot({ clip: target.clip, animations: 'disabled' })
  expect(shot).toMatchSnapshot(`${id}.png`)
}

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: entrance animations are
  // motion-safe-gated, so this pins geometry to its settled values before any
  // boundingBox sample — no mid-flight flake.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('Navigation @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('floating bar matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'navigation-desktop')
  })

  test('bar geometry and styles are design-exact', async ({ page }) => {
    // Bar: 1400x80 at (20,20), r=25, white @25% over the hero (nodes 1:40/1:41).
    const bar = page.getByTestId('nav-bar')
    expect(await bar.boundingBox()).toEqual({ x: 20, y: 20, width: 1400, height: 80 })
    await expect(bar).toHaveCSS('border-radius', '25px')
    await expect(bar).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.25)')
    await expect(bar).toHaveCSS('padding', '15px 20px')

    // Logo: 155x25 vector (node 1:44).
    const logo = page.getByRole('link', { name: /metatech home/i })
    expect(await logo.boundingBox()).toMatchObject({ width: 155, height: 25 })

    // Links: Manrope w700 14/24, -5% tracking, white, 25px apart (nodes 1:45..1:51).
    const link = page.getByRole('navigation').getByRole('link', { name: 'Showcase' })
    await expect(link).toHaveCSS('font-family', /Manrope/)
    await expect(link).toHaveCSS('font-size', '14px')
    await expect(link).toHaveCSS('line-height', '24px')
    await expect(link).toHaveCSS('font-weight', '700')
    await expect(link).toHaveCSS('letter-spacing', '-0.7px')
    await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(page.getByTestId('nav-links')).toHaveCSS('column-gap', '25px')

    // CTA pill: 50 tall, r=15, pad 10/25, white @25%, Manrope w800 (nodes 1:52/1:53).
    const cta = page.getByRole('link', { name: 'Book a meeting' })
    expect(await cta.boundingBox()).toMatchObject({ height: 50 })
    await expect(cta).toHaveCSS('border-radius', '15px')
    await expect(cta).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.25)')
    await expect(cta).toHaveCSS('padding', '10px 25px')
    await expect(cta).toHaveCSS('font-weight', '800')
  })

  test('open mega-menu matches the Baseline', async ({ page }) => {
    await page.getByRole('link', { name: 'Solutions' }).hover()
    await expect(page.getByTestId('mega-menu-panel')).toBeVisible()
    await expectBaseline(page, 'navigation-menu-open-desktop')
  })

  test('mega-menu geometry and styles are design-exact', async ({ page }) => {
    const trigger = page.getByRole('link', { name: 'Solutions' })
    await trigger.hover()

    // Trigger reflects the open state: accent color + aria-expanded (note 1:512).
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger).toHaveCSS('color', 'rgb(51, 249, 135)')

    // Panel: 1400x444 replacing the bar at (20,20), #161616, r=25 (node 1:461).
    const panel = page.getByTestId('mega-menu-panel')
    expect(await panel.boundingBox()).toEqual({ x: 20, y: 20, width: 1400, height: 444 })
    await expect(panel).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(panel).toHaveCSS('border-radius', '25px')

    // Tiles: 3 black 450x339 r=20 cards with a 25%-white hairline, ordered by x
    // as Custom Software / Data+AI / Tech Staff (nodes 1:462..1:467).
    const tiles = page.getByTestId('mega-menu-tile')
    await expect(tiles).toHaveCount(3)
    const order: number[] = []
    for (const [i, title] of [
      'Custom Software Development',
      'Data+AI First Innovation',
      'Tech Staff Augmentation',
    ].entries()) {
      const tile = tiles.filter({ hasText: title })
      const box = await tile.boundingBox()
      expect(box).toMatchObject({ y: 106, width: 450, height: 339 })
      order[i] = box!.x
      await expect(tile).toHaveCSS('border-radius', '20px')
      await expect(tile).toHaveCSS('background-color', 'rgb(0, 0, 0)')
      await expect(tile).toHaveCSS('border-color', 'rgba(255, 255, 255, 0.25)')
      await expect(tile).toHaveCSS('border-width', '1px')
    }
    expect(order[0]).toBeLessThan(order[1])
    expect(order[1]).toBeLessThan(order[2])

    // Tile headings: Bricolage w800 30/30, -5% tracking, accent green (node 1:465).
    const heading = tiles.first().getByRole('heading')
    await expect(heading).toHaveCSS('font-family', /Bricolage/)
    await expect(heading).toHaveCSS('font-size', '30px')
    await expect(heading).toHaveCSS('line-height', '30px')
    await expect(heading).toHaveCSS('font-weight', '800')
    await expect(heading).toHaveCSS('letter-spacing', '-1.5px')
    await expect(heading).toHaveCSS('color', 'rgb(51, 249, 135)')
  })

  test('per-tile hover reveals the image and whitens the heading', async ({ page }) => {
    await page.getByRole('link', { name: 'Solutions' }).hover()
    const tiles = page.getByTestId('mega-menu-tile')
    const first = tiles.first()
    await first.hover()
    // Hovered tile: image fades in, heading goes #f4f6f5 (1:481 hover composite).
    await expect(first.getByRole('img')).toHaveCSS('opacity', '1')
    await expect(first.getByRole('heading')).toHaveCSS('color', 'rgb(244, 246, 245)')
    // Reveal is per-tile (note 1:514): the others stay covered.
    await expect(tiles.nth(1).getByRole('img')).toHaveCSS('opacity', '0')
    await expect(tiles.nth(2).getByRole('img')).toHaveCSS('opacity', '0')
  })

  test('Escape closes the mega-menu', async ({ page }) => {
    const trigger = page.getByRole('link', { name: 'Solutions' })
    await trigger.hover()
    await expect(page.getByTestId('mega-menu-panel')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('mega-menu-panel')).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('Navigation @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('header pill matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'navigation-mobile')
  })

  test('header geometry and styles are design-exact', async ({ page }) => {
    // Pill: 373x56 at (10,10), r=5, white @25%, pad 16 (nodes 1:301/1:302).
    const bar = page.getByTestId('nav-bar')
    expect(await bar.boundingBox()).toEqual({ x: 10, y: 10, width: 373, height: 56 })
    await expect(bar).toHaveCSS('border-radius', '5px')
    await expect(bar).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.25)')
    await expect(bar).toHaveCSS('padding', '16px')

    // Logo scales down to 126x20 (node 1:303); desktop links leave the bar.
    const logo = page.getByRole('link', { name: /metatech home/i })
    expect(await logo.boundingBox()).toMatchObject({ width: 126, height: 20 })
    await expect(page.getByTestId('nav-links')).toBeHidden()
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible()
  })

  test('hamburger opens the Authored overlay with lock and trap', async ({ page }) => {
    const button = page.getByRole('button', { name: /open menu/i })
    await button.tap()

    // Overlay: full-screen deep green (open Q1 default), links + CTA inside.
    const overlay = page.getByRole('dialog')
    await expect(overlay).toBeVisible()
    await expect(overlay).toHaveCSS('background-color', 'rgb(3, 32, 25)')
    expect(await overlay.boundingBox()).toEqual({ x: 0, y: 0, width: 393, height: 852 })
    await expect(overlay.getByRole('link', { name: 'Showcase' })).toBeVisible()

    // Scroll locked while open; Escape closes and restores.
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    await page.keyboard.press('Escape')
    await expect(overlay).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
})
