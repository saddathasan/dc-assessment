/**
 * Fidelity Gate — Hero Section (MS-3). Visual layer: screenshot diff ≤5% against
 * sliced Figma Baselines; numeric layer: zero-tolerance computed-style asserts on
 * the values extracted from file.json (D-021). The video modal is our design
 * (note 1:510) with no Baseline, so it gets interaction + numeric checks only.
 */
import { test, expect, type Page } from '@playwright/test'
import { targets } from './sections.ts'

/**
 * Clips the page to a manifest region and diffs it against the Section's Baseline.
 * fullPage: the hero band runs past the viewport fold, and clips outside the
 * viewport are only valid on a full-page screenshot.
 */
async function expectBaseline(page: Page, id: string): Promise<void> {
  const target = targets.find((t) => t.id === id)
  if (!target) throw new Error(`no fidelity target '${id}'`)
  const shot = await page.screenshot({ clip: target.clip, animations: 'disabled', fullPage: true })
  expect(shot).toMatchSnapshot(`${id}.png`)
}

/** The one play button CSS shows at the current width (two placements exist in the DOM). */
const visiblePlay = (page: Page) => page.getByTestId('hero-play').filter({ visible: true })

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: entrance animations are
  // motion-safe-gated, so this pins geometry to its settled values before any
  // boundingBox sample — no mid-flight flake.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('Hero @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('hero band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'hero-desktop')
  })

  test('headline block geometry and styles are design-exact', async ({ page }) => {
    // h1: 664x216 at (50,212) — Bricolage w800 72/72, -5% tracking, Title Case
    // via textCase:TITLE, white with accent character runs (node 1:57).
    const h1 = page.getByRole('heading', { level: 1 })
    expect(await h1.boundingBox()).toEqual({ x: 50, y: 212, width: 664, height: 216 })
    await expect(h1).toHaveCSS('font-family', /Bricolage/)
    await expect(h1).toHaveCSS('font-size', '72px')
    await expect(h1).toHaveCSS('line-height', '72px')
    await expect(h1).toHaveCSS('font-weight', '800')
    await expect(h1).toHaveCSS('letter-spacing', '-3.6px')
    await expect(h1).toHaveCSS('text-transform', 'capitalize')
    await expect(h1).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(h1.locator('span', { hasText: 'Intelligence to Power' })).toHaveCSS(
      'color',
      'rgb(51, 249, 135)',
    )

    // Sub-copy column: 388 wide at (894,239) — Manrope w300 16/23 (node 1:59).
    const subcopy = page.getByText(/MetaTech integrates custom software/)
    expect(await subcopy.boundingBox()).toEqual({ x: 894, y: 239, width: 388, height: 92 })
    await expect(subcopy).toHaveCSS('font-size', '16px')
    await expect(subcopy).toHaveCSS('line-height', '23px')
    await expect(subcopy).toHaveCSS('font-weight', '300')

    // CTA pill: 160x50 at (894,351), r=15, pad 10/35, accent fill (nodes 1:61/1:62).
    const cta = page.getByRole('link', { name: 'Book for Demo' })
    expect(await cta.boundingBox()).toEqual({ x: 894, y: 351, width: 160, height: 50 })
    await expect(cta).toHaveCSS('border-radius', '15px')
    await expect(cta).toHaveCSS('padding', '10px 35px')
    await expect(cta).toHaveCSS('background-color', 'rgb(51, 249, 135)')
    await expect(cta).toHaveCSS('color', 'rgb(22, 22, 22)')
    await expect(cta).toHaveCSS('font-size', '14px')
    await expect(cta).toHaveCSS('font-weight', '700')
  })

  test('media block geometry is design-exact', async ({ page }) => {
    // Block: 1400x571 at (20,600) — the notch shape itself is proven visually.
    const media = page.getByTestId('hero-media')
    expect(await media.boundingBox()).toEqual({ x: 20, y: 600, width: 1400, height: 571 })

    // Photo rect: 1402x934 drawn from (18,505) — the design's FILL crop (node 2:13).
    const photo = page.getByTestId('hero-photo')
    expect(await photo.boundingBox()).toEqual({ x: 18, y: 505, width: 1402, height: 934 })

    // Gradient wash at 30% (node 2:15).
    await expect(page.getByTestId('hero-overlay')).toHaveCSS('opacity', '0.3')

    // Play rings: 130/105/74 at (655,535) — accent at 25%/50%/100% (nodes 2:18..2:20).
    const play = visiblePlay(page)
    expect(await play.boundingBox()).toEqual({ x: 655, y: 535, width: 130, height: 130 })
    await expect(play).toHaveCSS('background-color', 'rgba(51, 249, 135, 0.25)')
    const middle = play.locator('span').first()
    expect(await middle.boundingBox()).toMatchObject({ width: 105, height: 105 })
    await expect(middle).toHaveCSS('background-color', 'rgba(51, 249, 135, 0.5)')
    const inner = middle.locator('span').first()
    expect(await inner.boundingBox()).toMatchObject({ width: 74, height: 74 })
    await expect(inner).toHaveCSS('background-color', 'rgb(51, 249, 135)')

    // Watermark: 1001x159 at (219,1015) (node 2:34).
    expect(await page.getByTestId('hero-watermark').boundingBox()).toEqual({
      x: 219,
      y: 1015,
      width: 1001,
      height: 159,
    })
  })

  test('band stays capped and coherent on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard, but the layout must
    // degrade coherently there: the band caps at 1440 and centers (the nav's
    // convention), and the notch contents stay married to the scaled clip path.
    // Regression for the >1440 breakage where the container stretched while the
    // photo/play/watermark stayed at fixed artboard offsets.
    await page.setViewportSize({ width: 1920, height: 900 })

    // Copy block centers with the band: 50px margin inside the capped 1440.
    expect(await page.getByRole('heading', { level: 1 }).boundingBox()).toMatchObject({ x: 290 })

    // Media block: still 1400x571, centered — never stretched.
    const media = await page.getByTestId('hero-media').boundingBox()
    expect(media).toEqual({ x: 260, y: 600, width: 1400, height: 571 })

    // Play button rides the notch center (~50% of the block), not a fixed offset.
    expect(await visiblePlay(page).boundingBox()).toMatchObject({ x: 895, y: 535 })

    // Photo still covers the whole block; watermark keeps its design offset.
    const photo = await page.getByTestId('hero-photo').boundingBox()
    expect(photo!.x).toBeLessThanOrEqual(media!.x)
    expect(photo!.x + photo!.width).toBeGreaterThanOrEqual(media!.x + media!.width)
    expect(await page.getByTestId('hero-watermark').boundingBox()).toMatchObject({ x: 459 })
  })

  test('play button opens the modal; Esc closes and returns focus', async ({ page }) => {
    await visiblePlay(page).click()

    // Modal opens with the payload's provider (YouTube per D-023), focus on close.
    const dialog = page.getByRole('dialog', { name: 'MetaTech video' })
    await expect(dialog).toBeVisible()
    const iframe = page.locator('iframe[title="MetaTech video"]')
    await expect(iframe).toHaveAttribute('src', /youtube\.com\/embed\/.*autoplay=1/)
    await expect(page.getByRole('button', { name: 'Close video' })).toBeFocused()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

    // Esc → cancel path → focus returns to the play button, scroll unlocks.
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(visiblePlay(page)).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
})

test.describe('Hero @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('hero band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'hero-mobile')
  })

  test('column geometry and styles are design-exact', async ({ page }) => {
    // h1: 336x192 at (28.5,138) — Bricolage w800 48/48, -5% tracking (node 1:315);
    // the column starts 62px below the header (hero node y=194.76 vs header end
    // 133 in file.json — the design's spacing survives the excluded banner, D-026).
    const h1 = page.getByRole('heading', { level: 1 })
    expect(await h1.boundingBox()).toEqual({ x: 28.5, y: 138, width: 336, height: 192 })
    await expect(h1).toHaveCSS('font-size', '48px')
    await expect(h1).toHaveCSS('line-height', '48px')
    await expect(h1).toHaveCSS('letter-spacing', '-2.4px')

    // Sub-copy: 336x80 at y=288 — Manrope w300 14/20 (node 1:316).
    const subcopy = page.getByText(/MetaTech integrates custom software/)
    expect(await subcopy.boundingBox()).toEqual({ x: 28.5, y: 350, width: 336, height: 80 })
    await expect(subcopy).toHaveCSS('font-size', '14px')
    await expect(subcopy).toHaveCSS('line-height', '20px')

    // CTA: fixed 130x40 at y=398, r=10 (node 1:319 — pads clamped by the width).
    const cta = page.getByRole('link', { name: 'Book for Demo' })
    expect(await cta.boundingBox()).toEqual({ x: 28.5, y: 460, width: 130, height: 40 })
    await expect(cta).toHaveCSS('border-radius', '10px')

    // Play rings above the photo: 100/80/60 at (28.5,488) (nodes 1:321..1:323).
    const play = visiblePlay(page)
    expect(await play.boundingBox()).toEqual({ x: 28.5, y: 550, width: 100, height: 100 })
    await expect(play).toHaveCSS('background-color', 'rgba(51, 249, 135, 0.25)')
    expect(await play.locator('span').first().boundingBox()).toMatchObject({
      width: 80,
      height: 80,
    })

    // Photo card: 380x200 at (6.5,608), r=20, wash at 35%, watermark 275x44
    // at (59,764) (nodes 2:25..2:35). The card's children are percentage-sized so
    // they scale with the fluid width, which leaves sub-pixel float residue at
    // 393 — asserted to 0.05px, far under anything a pixel can show.
    const closeTo = (box: { x: number; y: number; width: number; height: number } | null,
      expected: { x: number; y: number; width: number; height: number }) => {
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(box![key]).toBeCloseTo(expected[key], 1)
      }
    }
    const media = page.getByTestId('hero-media')
    closeTo(await media.boundingBox(), { x: 6.5, y: 670, width: 380, height: 200 })
    await expect(media.locator('div').first()).toHaveCSS('border-radius', '20px')
    await expect(page.getByTestId('hero-overlay')).toHaveCSS('opacity', '0.35')
    closeTo(await page.getByTestId('hero-photo').boundingBox(), {
      x: 3.5,
      y: 660,
      width: 383,
      height: 255,
    })
    closeTo(await page.getByTestId('hero-watermark').boundingBox(), {
      x: 59,
      y: 826,
      width: 275,
      height: 44,
    })
  })

  test('band stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard, but below lg the band must scale
    // like the nav does: the copy keeps its 28.5px side margins and fills, the
    // photo card keeps its 6.5px margins and 380:200 aspect, and its image and
    // watermark scale with it. Regression for the artboard-capped mobile layout
    // (336/380px maxes) that shrank on big phones and floated lost on tablets.
    for (const width of [430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      const h1 = await page.getByRole('heading', { level: 1 }).boundingBox()
      expect(h1).toMatchObject({ x: 28.5, width: width - 57 })

      const media = await page.getByTestId('hero-media').boundingBox()
      expect(media!.x).toBe(6.5)
      expect(media!.width).toBe(width - 13)
      expect(media!.height).toBeCloseTo((media!.width * 200) / 380, 0)

      // Photo always covers the card; watermark stays centered inside it.
      const photo = await page.getByTestId('hero-photo').boundingBox()
      expect(photo!.x).toBeLessThanOrEqual(media!.x)
      expect(photo!.x + photo!.width).toBeGreaterThanOrEqual(media!.x + media!.width)
      expect(photo!.y).toBeLessThanOrEqual(media!.y)
      expect(photo!.y + photo!.height).toBeGreaterThanOrEqual(media!.y + media!.height)
      const wm = await page.getByTestId('hero-watermark').boundingBox()
      expect(wm!.x + wm!.width / 2).toBeCloseTo(media!.x + media!.width / 2, 0)
      expect(wm!.y + wm!.height).toBeLessThanOrEqual(media!.y + media!.height + 1)
    }
  })

  test('tapping play opens the modal and its close button dismisses it', async ({ page }) => {
    await visiblePlay(page).tap()
    await expect(page.getByRole('dialog', { name: 'MetaTech video' })).toBeVisible()

    await page.getByRole('button', { name: 'Close video' }).tap()
    await expect(page.getByRole('dialog', { name: 'MetaTech video' })).toBeHidden()
    await expect(visiblePlay(page)).toBeFocused()
  })
})
