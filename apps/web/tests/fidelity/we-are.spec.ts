/**
 * Fidelity Gate — We Are Section (MS-5). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines; numeric layer: zero-tolerance computed-style
 * asserts on the values extracted from file.json (D-021). The statement's
 * bold→regular split is the design's characterStyleOverrides (w800/w400 runs on
 * nodes 1:104/1:361 — the tree one-liners report w800 throughout and are wrong).
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

const eyebrow = (page: Page) => page.getByRole('heading', { name: 'We Are />' })
const statement = (page: Page) =>
  page.locator('p').filter({ hasText: 'Engineering business solutions' })
const band = (page: Page) => page.locator('section').filter({ has: page.getByRole('heading', { name: 'We Are />' }) })

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: entrance animations are
  // motion-safe-gated, so this pins geometry to its settled values before any
  // boundingBox sample — no mid-flight flake.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('We Are @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('we-are band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'we-are-desktop')
  })

  test('band, eyebrow, and statement geometry and styles are design-exact', async ({ page }) => {
    // Band: white 1440x345 at y=1491 — flush under Trusted By's 1171+320
    // (node 1:101 fill #ffffff).
    const section = band(page)
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await section.boundingBox()).toMatchObject({ y: 1491, height: 345 })

    // Eyebrow: 76x30 at (20,1591) — the row is bottom-pinned 50px above the
    // band end (primaryAxis=MAX: 345 − 50 − 195 = 100 headroom). Manrope w600
    // 18/30, ls −0.9, ink #161616 (node 1:103). The design hugs the text at 76;
    // Chromium's advance is ~1.7px narrower, so the component fixes the box at
    // 76 to keep the statement's offset design-exact.
    const h2 = eyebrow(page)
    expect(await h2.boundingBox()).toEqual({ x: 20, y: 1591, width: 76, height: 30 })
    await expect(h2).toHaveCSS('font-family', /Manrope/)
    await expect(h2).toHaveCSS('font-size', '18px')
    await expect(h2).toHaveCSS('line-height', '30px')
    await expect(h2).toHaveCSS('font-weight', '600')
    await expect(h2).toHaveCSS('letter-spacing', '-0.9px')
    await expect(h2).toHaveCSS('color', 'rgb(22, 22, 22)')

    // Statement: FIXED 680 wide at (496,1591) = 20 + hug 76 + itemSpacing 400,
    // exactly 5 lines of 39 (node 1:104). Height 195 pins the design's line
    // wrapping — the D-017.3 colon must not reflow it.
    const p = statement(page)
    expect(await p.boundingBox()).toEqual({ x: 496, y: 1591, width: 680, height: 195 })
    await expect(p).toHaveCSS('font-family', /Bricolage/)
    await expect(p).toHaveCSS('font-size', '32px')
    await expect(p).toHaveCSS('line-height', '39px')
    await expect(p).toHaveCSS('letter-spacing', '-0.96px')
    await expect(p).toHaveCSS('color', 'rgb(0, 0, 0)')

    // The weight runs: w800 through "pillars: ", w400 from "AI powered"
    // (styleOverrideTable 13/12 — override 12 swaps to BricolageGrotesque-Regular).
    const bold = p.locator('span').filter({ hasText: 'three strategic pillars:' })
    await expect(bold).toHaveCSS('font-weight', '800')
    await expect(p.locator('span').filter({ hasText: 'AI powered delivery' })).toHaveCSS(
      'font-weight',
      '400',
    )

    // D-027 divergence pin: Chromium fits "three" at the end of line 1 where
    // the Figma render breaks before it — same 680 box, same typography, the
    // engines' advances disagree by <2px in opposite directions on lines 1 and
    // 3, so no robust CSS reproduces the design's break (the window is under
    // 2px wide). The bold run must render as exactly two line boxes with line 1
    // ending past x=1100 (design's break would end it at ~1088.8); if a font or
    // engine change ever flips this, fail loudly and re-measure before repinning.
    const boldRects = await bold.evaluate((el) =>
      [...el.getClientRects()].map((r) => ({ right: r.right, y: r.y })),
    )
    expect(boldRects).toHaveLength(2)
    expect(boldRects[0].right).toBeGreaterThan(1100)
  })

  test('band stays capped and coherent on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard, but the content caps
    // at 1440 and centers while the white band bleeds full-width (the page
    // convention): every x shifts by exactly (1920−1440)/2 = 240 while widths
    // and y hold.
    await page.setViewportSize({ width: 1920, height: 900 })

    const sectionBox = await band(page).boundingBox()
    expect(sectionBox!.width).toBe(1920)
    expect(sectionBox).toMatchObject({ x: 0, y: 1491, height: 345 })

    expect(await eyebrow(page).boundingBox()).toMatchObject({ x: 260, y: 1591 })
    expect(await statement(page).boundingBox()).toEqual({
      x: 736,
      y: 1591,
      width: 680,
      height: 195,
    })
  })
})

test.describe('We Are @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('we-are band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'we-are-mobile')
  })

  test('stacked geometry and styles are design-exact', async ({ page }) => {
    // Band: white 393x370 at y=1328 (render 1385 − 57 status bar), flush under
    // trusted-by's clip end 870+458.
    const section = band(page)
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await section.boundingBox()).toMatchObject({ y: 1328, height: 370 })

    // Eyebrow: FILL 353x24 at (20,1415) — 87px band headroom (370 − 50 pad −
    // 233 content, node 1:359). Bricolage w600 18/24, ls −0.9 (node 1:360 — the
    // family swaps from desktop's Manrope, like the Trusted By heading).
    const h2 = eyebrow(page)
    expect(await h2.boundingBox()).toEqual({ x: 20, y: 1415, width: 353, height: 24 })
    await expect(h2).toHaveCSS('font-family', /Bricolage/)
    await expect(h2).toHaveCSS('font-size', '18px')
    await expect(h2).toHaveCSS('line-height', '24px')
    await expect(h2).toHaveCSS('font-weight', '600')
    await expect(h2).toHaveCSS('letter-spacing', '-0.9px')
    await expect(h2).toHaveCSS('color', 'rgb(22, 22, 22)')

    // Statement: 353 wide at (20,1459) — 20px under the eyebrow (frame 289416
    // itemSpacing), exactly 7 lines of 27 (node 1:361). Height 189 pins the
    // wrapping with the D-017.3 colon in place.
    const p = statement(page)
    expect(await p.boundingBox()).toEqual({ x: 20, y: 1459, width: 353, height: 189 })
    await expect(p).toHaveCSS('font-family', /Bricolage/)
    await expect(p).toHaveCSS('font-size', '21px')
    await expect(p).toHaveCSS('line-height', '27px')
    await expect(p).toHaveCSS('letter-spacing', '-0.63px')
    await expect(p).toHaveCSS('color', 'rgb(0, 0, 0)')
    await expect(p.locator('span').filter({ hasText: 'three strategic pillars:' })).toHaveCSS(
      'font-weight',
      '800',
    )
    await expect(p.locator('span').filter({ hasText: 'AI powered delivery' })).toHaveCSS(
      'font-weight',
      '400',
    )
  })

  test('band stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard, but below lg the band must scale
    // like its neighbours: 20px side margins hold, the stack fills the width,
    // the 20px eyebrow→statement gap and the mobile type scale hold.
    for (const width of [360, 430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      // The band stays flush under Trusted By at fractional stack offsets —
      // the sections must share an edge exactly (no seam, no overlap).
      const seam = await page.evaluate(() => {
        const sections = [...document.querySelectorAll('section')]
        const trusted = sections.find((s) => s.textContent!.includes('Trusted by'))!
        const weAre = sections.find((s) => s.textContent!.includes('We Are />'))!
        return weAre.getBoundingClientRect().top - trusted.getBoundingClientRect().bottom
      })
      expect(seam).toBe(0)

      const h2Box = await eyebrow(page).boundingBox()
      expect(h2Box!.x).toBe(20)
      expect(h2Box!.width).toBe(width - 40)
      expect(h2Box!.height).toBe(24)

      const pBox = await statement(page).boundingBox()
      expect(pBox!.x).toBe(20)
      expect(pBox!.width).toBe(width - 40)
      expect(pBox!.y - (h2Box!.y + h2Box!.height)).toBe(20)
      // Wrapped height stays a whole number of 27px lines.
      expect(pBox!.height % 27).toBe(0)

      await expect(statement(page)).toHaveCSS('font-size', '21px')
    }
  })
})
