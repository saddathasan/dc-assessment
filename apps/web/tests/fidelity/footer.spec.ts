/**
 * Fidelity Gate — Footer Section (MS-10). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines; numeric layer: zero-tolerance computed-style
 * asserts on the values extracted from file.json (D-021).
 *
 * This is the last band, so the page-height asserts here are the page's own:
 * 4738 desktop and 4915 mobile mean the build lands on the artboard end to end.
 *
 * The METATECH mark is a VECTOR whose per-glyph colour lives in
 * fillOverrideTable, not in `fills` — so the two path colours are asserted
 * directly (D-031). What reads as a gradient is the desktop-only scrim 1:264;
 * the mobile artboard draws none, and that asymmetry is pinned below.
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

const band = (page: Page) => page.locator('footer')
const wordmark = (page: Page) => page.getByTestId('footer-wordmark')
const scrim = (page: Page) => page.getByTestId('footer-wordmark-scrim')

/** Absolute page y of an element's top edge — the artboard's coordinate, not the viewport's. */
async function pageTop(page: Page, testId: string): Promise<number> {
  return page.evaluate(
    (id) =>
      document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().top + window.scrollY,
    testId,
  )
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await wordmark(page).waitFor()
})

test.describe('Footer @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('footer band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'footer-desktop')
  })

  test('the band closes the page flush under Tech Stack, on the artboard', async ({ page }) => {
    // Node 1:248: #161616, 1440x358 at y=4380 = Tech Stack's 3530+850. Unlike
    // the showcase→Tech Stack seam there is no itemSpacing here, so it is flush.
    const footer = band(page)
    await expect(footer).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    expect(await footer.boundingBox()).toMatchObject({ y: 4380, height: 358 })

    const seam = await page.evaluate(() => {
      const tech = document.querySelector('section#tech-stack')!.getBoundingClientRect()
      return document.querySelector('footer')!.getBoundingClientRect().top - tech.bottom
    })
    expect(seam).toBe(0)

    // The artboard ends at 4738 and so does the build — page complete (MS-10 AC).
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(4738)
  })

  test('the link row sits where the artboard draws each group (node 1:250)', async ({ page }) => {
    // Frame 112: 1264x24 at (88,4448) — 68 below the band's top edge, with the
    // three groups' left edges at x=88 / 625 / 1032.
    for (const [testId, x] of [
      ['footer-copyright-desktop', 88],
      ['footer-legal-desktop', 625],
      ['footer-social-desktop', 1032],
    ] as const) {
      const box = (await page.getByTestId(testId).boundingBox())!
      expect({ id: testId, x: box.x, y: box.y }).toEqual({ id: testId, x, y: 4448 })
      expect(box.height).toBe(24)
    }
  })

  test('footer type is Manrope 700 14/24 at −0.7, white but for the company name', async ({
    page,
  }) => {
    // Nodes 1:252/1:255..1:261 all share one style; only the copyright's middle
    // span carries the accent fill (styleOverrideTable entry 2 = rgb(51,249,135)).
    const copyright = page.getByTestId('footer-copyright-desktop')
    await expect(copyright).toHaveCSS('font-family', /Manrope/)
    await expect(copyright).toHaveCSS('font-size', '14px')
    await expect(copyright).toHaveCSS('line-height', '24px')
    await expect(copyright).toHaveCSS('font-weight', '700')
    await expect(copyright).toHaveCSS('letter-spacing', '-0.7px')
    await expect(copyright).toHaveCSS('color', 'rgb(255, 255, 255)')

    await expect(copyright.locator('span').nth(1)).toHaveText('MetaTech LLC')
    await expect(copyright.locator('span').nth(1)).toHaveCSS('color', 'rgb(51, 249, 135)')

    // Every link is underlined (textDecoration UNDERLINE on all six nodes).
    const links = page.getByTestId('footer-legal-desktop').getByRole('link')
    await expect(links.first()).toHaveText('Terms of Use')
    for (const scope of ['footer-legal-desktop', 'footer-social-desktop']) {
      for (const link of await page.getByTestId(scope).getByRole('link').all()) {
        await expect(link).toHaveCSS('text-decoration-line', 'underline')
        await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)')
      }
    }
  })

  test('the mark is 1432x227 at the band foot, under its scrim (nodes 1:262/1:264)', async ({
    page,
  }) => {
    // The mark ends flush with the band at 4738 — it does not overrun the page.
    const svg = page.locator('[data-testid="footer-wordmark"] svg')
    expect(await svg.boundingBox()).toMatchObject({ x: 4, y: 4511, width: 1432, height: 227 })

    // fillOverrideTable paints META accent, TECH the node's base white.
    await expect(svg.locator('path').nth(0)).toHaveCSS('fill', 'rgb(51, 249, 135)')
    await expect(svg.locator('path').nth(1)).toHaveCSS('fill', 'rgb(255, 255, 255)')

    // The scrim covers the mark's full band width, not just the glyphs' 1432.
    await expect(scrim(page)).toBeVisible()
    expect(await scrim(page).boundingBox()).toMatchObject({
      x: 0,
      y: 4511,
      width: 1440,
      height: 227,
    })
    // Figma's stops run #161616 at the box bottom to transparent 12.8% down from
    // its top: 0.872 x 227 = 197.94px of upward travel, in the band's own hue.
    await expect(scrim(page)).toHaveCSS(
      'background-image',
      'linear-gradient(to top, rgb(22, 22, 22) 0px, rgba(22, 22, 22, 0) 197.94px)',
    )
  })
})

test.describe('Footer @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('footer band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'footer-mobile')
  })

  test('the band closes the page flush under Tech Stack, on the artboard', async ({ page }) => {
    // Node 1:441: 393x482 at render y=4490 → page y 4433 (the excluded 57px
    // status bar), flush under Tech Stack's 3723+710.
    const footer = band(page)
    await expect(footer).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    const box = (await footer.boundingBox())!
    expect(box.y).toBe(4433)
    // The mark's height follows its viewBox aspect (391 x 227/1432), which lands
    // on Chromium's 1/64px grid rather than the artboard's whole 62.
    expect(box.height).toBeCloseTo(482, 0)

    const seam = await page.evaluate(() => {
      const tech = document.querySelector('section#tech-stack')!.getBoundingClientRect()
      return document.querySelector('footer')!.getBoundingClientRect().top - tech.bottom
    })
    expect(seam).toBe(0)

    // 4433 + 482: the mobile artboard's 4972 less its status bar — page complete.
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(4915)
  })

  test('the column stacks on the artboard rhythm (node 1:442)', async ({ page }) => {
    // Frame 289404 has no vertical padding, so the first link starts on the
    // band's own top edge; then 30/50 gaps put each group at its drawn y.
    expect(await pageTop(page, 'footer-legal-mobile')).toBe(4433)
    expect(await pageTop(page, 'footer-social-mobile')).toBe(4433 + 129)
    expect(await pageTop(page, 'footer-copyright-mobile')).toBe(4433 + 366)
    expect(await pageTop(page, 'footer-wordmark')).toBe(4433 + 420)

    // 30px inset both sides (pad=(0,30,0,30)).
    expect((await page.getByTestId('footer-legal-mobile').boundingBox())!.x).toBe(30)
  })

  test('mobile links are 18/24 at −0.9 and the socials keep their own order', async ({ page }) => {
    // Nodes 1:446/1:450..1:453 step up to 18px; the copyright stays at 14 (1:456).
    const link = page.getByTestId('footer-social-mobile').getByRole('link').first()
    await expect(link).toHaveText('Linkedin')
    await expect(link).toHaveCSS('font-size', '18px')
    await expect(link).toHaveCSS('line-height', '24px')
    await expect(link).toHaveCSS('letter-spacing', '-0.9px')
    await expect(link).toHaveCSS('text-decoration-line', 'underline')

    await expect(page.getByTestId('footer-copyright-mobile')).toHaveCSS('font-size', '14px')

    // Desktop opens on Facebook, mobile on Linkedin — the D-030 divergence.
    const labels = await page.getByTestId('footer-social-mobile').getByRole('link').allTextContents()
    expect(labels).toEqual(['Linkedin', 'Youtube', 'Instagram', 'Facebook'])
  })

  test('the two 20x1 rules bracket the socials, and no scrim is drawn', async ({ page }) => {
    // Nodes 1:448/1:454 — white, 20x1, radius clamped by the 1px height.
    const rules = page.locator('footer [aria-hidden]:not([data-testid])')
    const boxes = await Promise.all(
      (await rules.all()).map(async (rule) => await rule.boundingBox()),
    )
    const drawn = boxes.filter((b) => b && b.width === 20 && b.height === 1)
    expect(drawn).toHaveLength(2)

    // The mobile artboard draws no scrim over the mark — that is why it stays
    // crisp where desktop's dissolves (node 1:264 has no mobile counterpart).
    await expect(scrim(page)).toBeHidden()

    const svg = page.locator('[data-testid="footer-wordmark"] svg')
    expect(await svg.boundingBox()).toMatchObject({ x: 0, width: 391 })
    await expect(svg.locator('path').nth(0)).toHaveCSS('fill', 'rgb(51, 249, 135)')
  })
})
