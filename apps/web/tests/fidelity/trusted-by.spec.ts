/**
 * Fidelity Gate — Trusted By Section (MS-4). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines; numeric layer: zero-tolerance computed-style
 * asserts on the values extracted from file.json (D-021). The two walls carry
 * different designed duplicate tiles per breakpoint (D-017.4).
 */
import { test, expect, type Page } from '@playwright/test'
import { targets } from './sections.ts'

/**
 * Clips the page to a manifest region and diffs it against the Section's Baseline.
 * fullPage: the band sits past the viewport fold, and clips outside the viewport
 * are only valid on a full-page screenshot.
 */
async function expectBaseline(page: Page, id: string): Promise<void> {
  const target = targets.find((t) => t.id === id)
  if (!target) throw new Error(`no fidelity target '${id}'`)
  const shot = await page.screenshot({ clip: target.clip, animations: 'disabled', fullPage: true })
  expect(shot).toMatchSnapshot(`${id}.png`)
}

/** boundingBox against %-derived geometry: sub-pixel float residue, 0.05px window. */
const closeTo = (
  box: { x: number; y: number; width: number; height: number } | null,
  expected: { x: number; y: number; width: number; height: number },
) => {
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(box![key]).toBeCloseTo(expected[key], 1)
  }
}

const heading = (page: Page) => page.getByRole('heading', { name: /Trusted by product teams/ })

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: entrance animations are
  // motion-safe-gated, so this pins geometry to its settled values before any
  // boundingBox sample — no mid-flight flake.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('Trusted By @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('trusted-by band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'trusted-by-desktop')
  })

  test('heading block geometry and styles are design-exact', async ({ page }) => {
    // Band bg: the deep green continues under the wall (ancestor node 1:39).
    const section = page.locator('section').filter({ has: page.getByTestId('trusted-by-wall-desktop') })
    await expect(section).toHaveCSS('background-color', 'rgb(3, 32, 25)')

    // h2: 192x60 (3 lines) at (20,1271) — every character override-styled to
    // Manrope w600 18/20, ls −0.9; accent runs on "Trusted by"/"innovators."
    // (node 1:81 styleOverrideTable 74/75).
    const h2 = heading(page)
    expect(await h2.boundingBox()).toEqual({ x: 20, y: 1271, width: 192, height: 60 })
    await expect(h2).toHaveCSS('font-family', /Manrope/)
    await expect(h2).toHaveCSS('font-size', '18px')
    await expect(h2).toHaveCSS('line-height', '20px')
    await expect(h2).toHaveCSS('font-weight', '600')
    await expect(h2).toHaveCSS('letter-spacing', '-0.9px')
    await expect(h2).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(h2.locator('span', { hasText: 'innovators.' })).toHaveCSS(
      'color',
      'rgb(51, 249, 135)',
    )
    await expect(h2.locator('span', { hasText: 'product teams' })).toHaveCSS(
      'color',
      'rgb(255, 255, 255)',
    )
  })

  test('logo wall geometry is design-exact', async ({ page }) => {
    // Wall: 925x200 at (495,1271) — 4x232 tiles per row, −1px column overlap
    // (rows 1:83/1:92 itemSpacing=-1), so 4*232−3 = 925 (node 1:82).
    const wall = page.getByTestId('trusted-by-wall-desktop')
    expect(await wall.boundingBox()).toEqual({ x: 495, y: 1271, width: 925, height: 200 })

    const rows = wall.locator('> div')
    const row1Tiles = rows.first().locator('> div')
    const row2Tiles = rows.nth(1).locator('> div')
    expect(await row1Tiles.first().boundingBox()).toEqual({ x: 495, y: 1271, width: 232, height: 100 })
    expect(await row1Tiles.nth(3).boundingBox()).toEqual({ x: 1188, y: 1271, width: 232, height: 100 })
    expect(await row2Tiles.first().boundingBox()).toEqual({ x: 495, y: 1371, width: 232, height: 100 })

    // Tile chrome: transparent fill, 1px inside stroke white@25% (nodes 1:84...).
    await expect(row1Tiles.first()).toHaveCSS('border-color', 'rgba(255, 255, 255, 0.25)')
    await expect(row1Tiles.first()).toHaveCSS('border-width', '1px')
    await expect(row1Tiles.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    // Logo rects, exact from file.json: Databricks 172 wide centered in tile 1
    // (node 1:85, height from the bitmap's design-matched 622:173 ratio); AWS the
    // 80x80 square (1:98); UiPath 112 wide (1:89).
    closeTo(await wall.getByAltText('Databricks').boundingBox(), {
      x: 525,
      y: 1297.08,
      width: 172,
      height: 47.84,
    })
    expect(await wall.getByAltText('Amazon Web Services').boundingBox()).toEqual({
      x: 1033,
      y: 1381,
      width: 80,
      height: 80,
    })
    closeTo(await wall.getByAltText('UiPath').boundingBox(), {
      x: 1017,
      y: 1295.94,
      width: 112,
      height: 50.12,
    })
  })

  test('band stays capped and coherent on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard, but the band must
    // cap at 1440 and center (the page convention): every x shifts by exactly
    // (1920−1440)/2 = 240 while widths and y hold.
    await page.setViewportSize({ width: 1920, height: 900 })

    expect(await heading(page).boundingBox()).toMatchObject({ x: 260, y: 1271, width: 192 })

    const wall = page.getByTestId('trusted-by-wall-desktop')
    expect(await wall.boundingBox()).toEqual({ x: 735, y: 1271, width: 925, height: 200 })

    // Last tile of the wall keeps its design offset inside the capped band.
    const lastTile = wall.locator('> div').nth(1).locator('> div').nth(3)
    expect(await lastTile.boundingBox()).toEqual({ x: 1428, y: 1371, width: 232, height: 100 })
  })
})

test.describe('Trusted By @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('trusted-by band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'trusted-by-mobile')
  })

  test('column geometry and styles are design-exact', async ({ page }) => {
    // h2: 218x48 (2 lines) at (21.5,950) — Bricolage w600 18/24, ls −0.9
    // (node 1:336; render y=1006.76 − 57 status bar = 949.76, built at 950
    // because the hero band above rounds to the slicer's whole-pixel height).
    const h2 = heading(page)
    expect(await h2.boundingBox()).toEqual({ x: 21.5, y: 950, width: 218, height: 48 })
    await expect(h2).toHaveCSS('font-family', /Bricolage/)
    await expect(h2).toHaveCSS('font-size', '18px')
    await expect(h2).toHaveCSS('line-height', '24px')
    await expect(h2).toHaveCSS('font-weight', '600')
    await expect(h2).toHaveCSS('letter-spacing', '-0.9px')
    await expect(h2.locator('span', { hasText: 'innovators.' })).toHaveCSS(
      'color',
      'rgb(51, 249, 135)',
    )

    // Wall: 350x280 at (21.5,1028) — 4 rows of 175x70 tiles, gap 0 (node 1:337:
    // grid y = heading + 48 + the wrapper's 30 gap, node 1:335).
    const wall = page.getByTestId('trusted-by-wall-mobile')
    expect(await wall.boundingBox()).toEqual({ x: 21.5, y: 1028, width: 350, height: 280 })

    const tiles = wall.locator('> div')
    expect(await tiles.first().boundingBox()).toEqual({ x: 21.5, y: 1028, width: 175, height: 70 })
    expect(await tiles.nth(1).boundingBox()).toEqual({ x: 196.5, y: 1028, width: 175, height: 70 })
    // Row 4 — the design's own duplicate of row 2 (node 1:353, D-017.4).
    expect(await tiles.nth(6).boundingBox()).toEqual({ x: 21.5, y: 1238, width: 175, height: 70 })
    await expect(tiles.first()).toHaveCSS('border-color', 'rgba(255, 255, 255, 0.25)')
    await expect(tiles.first()).toHaveCSS('border-width', '1px')

    // Logo rects: Databricks 144 wide (node 1:340); AWS the 50x50 square
    // (1:352). All percentage-sized from the tile, so exact at the 393 artboard.
    const databricks = await wall.getByAltText('Databricks').boundingBox()
    expect(databricks!.width).toBeCloseTo(144, 1)
    expect(databricks!.x).toBeCloseTo(37, 1)
    const aws = await wall.getByAltText('Amazon Web Services').boundingBox()
    expect(aws!.width).toBeCloseTo(50, 1)
    expect(aws!.height).toBeCloseTo(50, 1)

    // UiPath (node 1:347): Figma STRETCH here is a CROP, not a distortion —
    // the 96x36 window shows the bitmap's full width x top 83.55% (its
    // imageTransform), keeping the glyphs' natural proportions. So the visible
    // frame is 96x36 while the img inside is drawn 1/0.99885 wide x 1/0.83552
    // tall (96.11x43.09), offset to the transform's origin. The ≤5% visual
    // layer cannot see this defect class — these asserts are the guard.
    const uipathImg = wall.getByAltText('UiPath').first()
    const uipathFrame = await uipathImg.locator('..').boundingBox()
    expect(uipathFrame!.width).toBeCloseTo(96, 1)
    expect(uipathFrame!.height).toBeCloseTo(36, 1)
    const uipath = await uipathImg.boundingBox()
    expect(uipath!.width).toBeCloseTo(96.11, 1)
    expect(uipath!.height).toBeCloseTo(43.09, 1)
    expect(uipath!.y - uipathFrame!.y).toBeCloseTo(0.22, 1)
  })

  test('wall stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard, but below lg the band must scale
    // like the hero does: the design's 21.5px side margins hold, tiles split the
    // remaining width 50/50 keeping the 175:70 aspect, and logos scale as
    // percentages of their tile.
    for (const width of [430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      expect(await heading(page).boundingBox()).toMatchObject({ x: 21.5, width: 218 })

      const wall = await page.getByTestId('trusted-by-wall-mobile').boundingBox()
      expect(wall!.x).toBe(21.5)
      expect(wall!.width).toBe(width - 43)

      const tileWidth = (width - 43) / 2
      const tile = await page
        .getByTestId('trusted-by-wall-mobile')
        .locator('> div')
        .first()
        .boundingBox()
      expect(tile!.width).toBeCloseTo(tileWidth, 1)
      expect(tile!.height).toBeCloseTo((tileWidth * 70) / 175, 1)

      // Logo %s resolve against the tile's content box (border-box − 2x1px).
      const databricks = await page
        .getByTestId('trusted-by-wall-mobile')
        .getByAltText('Databricks')
        .boundingBox()
      expect(databricks!.width).toBeCloseTo((tile!.width - 2) * 0.83237, 1)

      // UiPath's crop frame keeps its 96:36 tile proportion at every width.
      const uipathFrame = await page
        .getByTestId('trusted-by-wall-mobile')
        .getByAltText('UiPath')
        .first()
        .locator('..')
        .boundingBox()
      expect(uipathFrame!.height / uipathFrame!.width).toBeCloseTo(36 / 96, 2)
    }
  })
})
