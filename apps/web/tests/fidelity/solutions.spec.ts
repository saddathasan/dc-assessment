/**
 * Fidelity Gate — Solutions Section (MS-6). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines (block 01 only — 02/03 are Authored, D-016;
 * the 01 heading differs from the render per D-017.1). Numeric layer:
 * zero-tolerance computed-style asserts from file.json nodes 1:110..1:131 and
 * 1:363..1:379. Sticky + scroll-spy behavior per note 1:277 — the release
 * point is provisional until Tech Stack lands (re-verified in MS-9, T9.3).
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

/** Fractional design coords (1:124's 147.2067 vector et al.) — assert within half a pixel. */
function expectBoxNear(
  box: { x: number; y: number; width: number; height: number } | null,
  wanted: { x?: number; y?: number; width?: number; height?: number },
): void {
  expect(box).not.toBeNull()
  for (const [key, value] of Object.entries(wanted)) {
    expect(Math.abs(box![key as keyof typeof box] - value), `${key} ≈ ${value}`).toBeLessThan(0.5)
  }
}

const band = (page: Page) => page.getByRole('navigation', { name: 'Solutions' })
const tabRow = (page: Page) => band(page).locator('ul')
const tabLink = (page: Page, name: string) => page.getByRole('link', { name })
const scope = (page: Page) => page.getByTestId('solutions-sticky-scope')
const block = (page: Page, id: string) => page.locator(`#solution-${id}`)
const numeralBox = (page: Page) => block(page, 'data-ai').locator('div[aria-hidden]')
const heading01 = (page: Page) => page.getByRole('heading', { name: 'Data + AI Driven Innovation' })
const body01 = (page: Page) => page.locator('p').filter({ hasText: 'Our Data and AI services' })
const cta01 = (page: Page) =>
  block(page, 'data-ai').getByRole('link', { name: 'Book a consultation' })

/**
 * Appends a 2000px stand-in for the MS-7..9 Sections after the sticky scope,
 * so scroll states past today's page tail are reachable (provisional until
 * MS-9 lands the real Tech Stack and T9.3 re-verifies).
 */
function extendPageTail(page: Page) {
  return page.evaluate(() => {
    const spacer = document.createElement('div')
    spacer.style.height = '2000px'
    document.querySelector('main')!.appendChild(spacer)
  })
}

/** Viewport-relative rects for scrolled states, where boundingBox conventions get murky. */
function viewportRect(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const rect = document.querySelector(sel)!.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom, x: rect.x, height: rect.height }
  }, selector)
}

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: pins geometry and makes anchor
  // scrolling instant (the smooth behavior is motion-gated in index.css).
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('Solutions @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('solutions band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'solutions-desktop')
  })

  test('tab bar geometry and styles are design-exact', async ({ page }) => {
    // Gray canvas: #E9EDF0 from y=1836, flush under We Are's 1491+345 (node 1:105).
    await expect(scope(page)).toHaveCSS('background-color', 'rgb(233, 237, 240)')
    expect(await scope(page).boundingBox()).toMatchObject({ x: 0, y: 1836 })

    // Band 1:110: transparent 1440x100 — the pill floats free once pinned.
    await expect(band(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect(await band(page).boundingBox()).toMatchObject({ y: 1836, height: 100 })

    // Pill 1:111/1:112: white 612x70 r15 at x=490 — deliberately off the 1440
    // center (490/338 side margins), bottom-pinned in the band.
    const pill = tabRow(page)
    expect(await pill.boundingBox()).toEqual({ x: 490, y: 1866, width: 612, height: 70 })
    await expect(pill).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(pill).toHaveCSS('border-radius', '15px')

    // Active tab 1:114/1:115: ink 200x60 r10 at x=496 (the 3x200 row bleeds 4px
    // past the design's 592 inner frame), spring-green label, Manrope 700 18/30.
    const active = tabLink(page, 'Data + AI')
    await expect(active).toHaveAttribute('aria-current', 'true')
    expect(await active.boundingBox()).toEqual({ x: 496, y: 1871, width: 200, height: 60 })
    await expect(active).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(active).toHaveCSS('border-radius', '10px')
    await expect(active).toHaveCSS('color', 'rgb(6, 255, 112)')
    await expect(active).toHaveCSS('font-family', /Manrope/)
    await expect(active).toHaveCSS('font-size', '18px')
    await expect(active).toHaveCSS('line-height', '30px')
    await expect(active).toHaveCSS('font-weight', '700')
    await expect(active).toHaveCSS('letter-spacing', '-0.9px')

    // Inactive tabs 1:116/1:118: transparent on the white pill, ink labels.
    for (const [name, x] of [
      ['Custom Software', 696],
      ['Tech Staffing', 896],
    ] as const) {
      const link = tabLink(page, name)
      expect(await link.boundingBox()).toEqual({ x, y: 1871, width: 200, height: 60 })
      await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(link).toHaveCSS('color', 'rgb(22, 22, 22)')
      await expect(link).not.toHaveAttribute('aria-current', 'true')
    }
  })

  test('block 01 geometry and styles are design-exact', async ({ page }) => {
    // Numeral: the 147.2x116.79 flattened vector box at (20,2022) (node 1:124);
    // the box is fixed so the copy column holds x=487.2 whatever Chromium's
    // digit advances measure.
    expectBoxNear(await numeralBox(page).boundingBox(), {
      x: 20,
      y: 2022,
      width: 147.2,
      height: 116.79,
    })
    const numeral = numeralBox(page).locator('span')
    await expect(numeral).toHaveCSS('font-family', /Bricolage/)
    await expect(numeral).toHaveCSS('font-weight', '800')
    await expect(numeral).toHaveCSS('font-size', '170.7px')

    // Heading 1:128: Bricolage 800 32/36 at (487.2,2022) — one line; width is
    // not pinned because the D-017.1 fix ("Driven") renders narrower than the
    // design's "Settings".
    const h2 = heading01(page)
    expectBoxNear(await h2.boundingBox(), { x: 487.2, y: 2022, height: 36 })
    await expect(h2).toHaveCSS('font-family', /Bricolage/)
    await expect(h2).toHaveCSS('font-size', '32px')
    await expect(h2).toHaveCSS('line-height', '36px')
    await expect(h2).toHaveCSS('font-weight', '800')
    await expect(h2).toHaveCSS('letter-spacing', '-1.6px')
    await expect(h2).toHaveCSS('color', 'rgb(22, 22, 22)')

    // Body 1:129: Manrope 400 18/27 in the fixed 610 column — exactly 4 lines
    // of 27 (D-027-class line-count pin; any reflow fails loudly).
    const p = body01(page)
    expectBoxNear(await p.boundingBox(), { x: 487.2, y: 2078, width: 610, height: 108 })
    await expect(p).toHaveCSS('font-family', /Manrope/)
    await expect(p).toHaveCSS('font-size', '18px')
    await expect(p).toHaveCSS('line-height', '27px')
    await expect(p).toHaveCSS('letter-spacing', '-0.54px')

    // CTA 1:130/1:131: ink 192x50 r15, label #EFEFEF Manrope 700 14/24 centered.
    const cta = cta01(page)
    expectBoxNear(await cta.boundingBox(), { x: 487.2, y: 2206, width: 192, height: 50 })
    await expect(cta).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(cta).toHaveCSS('border-radius', '15px')
    await expect(cta).toHaveCSS('color', 'rgb(239, 239, 239)')
    await expect(cta).toHaveCSS('font-size', '14px')
    await expect(cta).toHaveCSS('line-height', '24px')
    await expect(cta).toHaveCSS('font-weight', '700')
    await expect(cta).toHaveCSS('letter-spacing', '-0.7px')

    // Authored blocks 02/03 (D-016) stack below on the same 370 rhythm.
    expect(await block(page, 'custom-software').boundingBox()).toMatchObject({ y: 2306, height: 370 })
    expect(await block(page, 'tech-staffing').boundingBox()).toMatchObject({ y: 2676, height: 370 })
  })

  test('tab bar pins to the viewport top and the spy follows the blocks', async ({ page }) => {
    // While Solutions is the page tail, max scroll (2146 at 900 viewport)
    // leaves the ~15% spy line short of block 02's 2306 — the synthetic tail
    // stands in for the MS-7..9 slices so the spy can actually be exercised.
    await extendPageTail(page)

    // Mid-stack: the band leaves its flow position (1836) and pins at top 0.
    await page.evaluate(() => window.scrollTo(0, 2300))
    expect(await viewportRect(page, 'nav[aria-label="Solutions"]')).toMatchObject({ top: 0 })

    // The spy line (~15% viewport = y135) sits inside block 02 (2306..2676) —
    // the highlight must have moved without any click.
    await expect(tabLink(page, 'Custom Software')).toHaveAttribute('aria-current', 'true')
    await expect(tabLink(page, 'Data + AI')).not.toHaveAttribute('aria-current', 'true')

    await page.evaluate(() => window.scrollTo(0, 2700))
    await expect(tabLink(page, 'Tech Staffing')).toHaveAttribute('aria-current', 'true')
  })

  test('tab click jumps to its block under the pinned bar', async ({ page }) => {
    await tabLink(page, 'Custom Software').click()

    // Anchor scroll honors scroll-margin-top: 100 (the pinned band height),
    // clamped to the page's max scroll while Solutions is still the page tail.
    const { scrollY, expected, blockTop } = await page.evaluate(() => {
      const el = document.getElementById('solution-custom-software')!
      const max = document.documentElement.scrollHeight - window.innerHeight
      const top = el.getBoundingClientRect().top + window.scrollY
      return {
        scrollY: window.scrollY,
        expected: Math.min(top - 100, max),
        blockTop: el.getBoundingClientRect().top,
      }
    })
    expect(scrollY).toBe(expected)
    expect(blockTop).toBeLessThanOrEqual(160)
    // The clamp strands the spy line inside block 01 — the click-priority pin
    // must hold the clicked highlight against that passing entry.
    await expect(tabLink(page, 'Custom Software')).toHaveAttribute('aria-current', 'true')
    await expect(tabLink(page, 'Data + AI')).not.toHaveAttribute('aria-current', 'true')
  })

  test('bar releases with the scope end — provisional until MS-9', async ({ page }) => {
    // The scope currently ends with Solutions, so the release point is not
    // reachable by real scroll (max scroll leaves the scope bottom at the
    // fold). The synthetic tail stands in for the MS-7..9 slices; MS-9 T9.3
    // re-verifies against the real Tech Stack.
    await extendPageTail(page)

    // Still pinned while the scope has room…
    await page.evaluate(() => {
      const scopeEl = document.querySelector('[data-testid="solutions-sticky-scope"]')!
      window.scrollTo(0, scopeEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight)
    })
    expect((await viewportRect(page, 'nav[aria-label="Solutions"]')).top).toBe(0)

    // …and pushed out with the scope bottom once it passes: the bar's bottom
    // edge rides the scope's bottom edge exactly (note 1:277 release).
    await page.evaluate(() => {
      const scopeEl = document.querySelector('[data-testid="solutions-sticky-scope"]')!
      window.scrollTo(0, scopeEl.getBoundingClientRect().bottom + window.scrollY - 40)
    })
    const [bar, scopeRect] = await Promise.all([
      viewportRect(page, 'nav[aria-label="Solutions"]'),
      viewportRect(page, '[data-testid="solutions-sticky-scope"]'),
    ])
    expect(bar.bottom).toBe(scopeRect.bottom)
    expect(bar.top).toBeLessThan(0)
  })

  test('band stays capped and coherent on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard, but the content
    // caps at 1440 and centers while the gray canvas bleeds full-width (the
    // page convention): every x shifts by exactly (1920−1440)/2 = 240.
    await page.setViewportSize({ width: 1920, height: 900 })

    expect(await scope(page).boundingBox()).toMatchObject({ x: 0, width: 1920 })
    expect(await tabRow(page).boundingBox()).toMatchObject({ x: 730, y: 1866, width: 612 })
    expectBoxNear(await numeralBox(page).boundingBox(), { x: 260, y: 2022 })
    expectBoxNear(await heading01(page).boundingBox(), { x: 727.2, y: 2022 })
  })
})

test.describe('Solutions @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('solutions band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'solutions-mobile')
  })

  test('tab row geometry and styles are design-exact', async ({ page }) => {
    // The 22px white strip the artboard keeps between We Are and the gray
    // (1754.76→1777, rounded per the slicer's whole-pixel rule).
    const weAreBottom = 1328 + 370
    expect(await scope(page).boundingBox()).toMatchObject({ y: weAreBottom + 22 })
    await expect(scope(page)).toHaveCSS('background-color', 'rgb(233, 237, 240)')

    // Band 1:363: 393x80, chips row 40 centered (y=1740 = 1720+20).
    expect(await band(page).boundingBox()).toMatchObject({ y: 1720, height: 80 })

    // Active chip 1:365/1:366: ink 110x40 r5 at x=20, spring-green Manrope 700 16/30.
    const active = tabLink(page, 'Data + AI')
    expect(await active.boundingBox()).toEqual({ x: 20, y: 1740, width: 110, height: 40 })
    await expect(active).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(active).toHaveCSS('border-radius', '5px')
    await expect(active).toHaveCSS('color', 'rgb(6, 255, 112)')
    await expect(active).toHaveCSS('font-size', '16px')
    await expect(active).toHaveCSS('line-height', '30px')
    await expect(active).toHaveCSS('font-weight', '700')
    await expect(active).toHaveCSS('letter-spacing', '-0.8px')

    // Inactive chips: explicit white on the gray (1:367/1:369) — 160 verbatim,
    // 145 authored for the third (the design draws it cut at the edge with the
    // label truncated to «Tech Staf»; at rest ours clips identically).
    const custom = tabLink(page, 'Custom Software')
    expect(await custom.boundingBox()).toEqual({ x: 135, y: 1740, width: 160, height: 40 })
    await expect(custom).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    const staffing = tabLink(page, 'Tech Staffing')
    expect(await staffing.boundingBox()).toEqual({ x: 300, y: 1740, width: 145, height: 40 })
  })

  test('block 01 geometry and styles are design-exact', async ({ page }) => {
    // Content column 1:373: 342 centered in the 600 frame (25.5 margins),
    // uniform 20 rhythm: numeral 120 / heading 36 / body 168 / CTA 40.
    expect(await block(page, 'data-ai').boundingBox()).toMatchObject({ y: 1800, height: 600 })

    const numeral = block(page, 'data-ai').getByText('01', { exact: true }).filter({ visible: true })
    expect(await numeral.boundingBox()).toEqual({ x: 25.5, y: 1888, width: 342, height: 120 })
    await expect(numeral).toHaveCSS('font-family', /Bricolage/)
    await expect(numeral).toHaveCSS('font-size', '120px')
    await expect(numeral).toHaveCSS('line-height', '120px')
    await expect(numeral).toHaveCSS('font-weight', '800')
    await expect(numeral).toHaveCSS('letter-spacing', '-6px')
    await expect(numeral).toHaveCSS('color', 'rgb(0, 0, 0)')

    const h2 = heading01(page)
    expect(await h2.boundingBox()).toMatchObject({ x: 25.5, y: 2028, height: 36 })
    await expect(h2).toHaveCSS('font-size', '24px')
    await expect(h2).toHaveCSS('line-height', '36px')
    await expect(h2).toHaveCSS('letter-spacing', '-1.2px')

    // Body 1:377: 18/24 (the desktop band uses 27), exactly 7 lines of 24
    // (D-027-class line-count pin).
    const p = body01(page)
    expect(await p.boundingBox()).toEqual({ x: 25.5, y: 2084, width: 342, height: 168 })
    await expect(p).toHaveCSS('font-size', '18px')
    await expect(p).toHaveCSS('line-height', '24px')

    // CTA 1:378: 170x40 r10 (the desktop band uses 192x50 r15).
    const cta = cta01(page)
    expect(await cta.boundingBox()).toEqual({ x: 25.5, y: 2272, width: 170, height: 40 })
    await expect(cta).toHaveCSS('border-radius', '10px')

    // Authored blocks on the same 600 rhythm below.
    expect(await block(page, 'custom-software').boundingBox()).toMatchObject({ y: 2400, height: 600 })
    expect(await block(page, 'tech-staffing').boundingBox()).toMatchObject({ y: 3000, height: 600 })
  })

  test('tab row overflow-scrolls and the bar pins on scroll', async ({ page }) => {
    // T6.4: the row scrolls — 465 of content (chips + edge padding) in 393.
    const row = tabRow(page)
    const overflow = await row.evaluate((el) => el.scrollWidth - el.clientWidth)
    expect(overflow).toBe(72)

    // Scrolled to the end, the third chip sits fully inside, 20 off the edge.
    await row.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    const right = await tabLink(page, 'Tech Staffing').evaluate(
      (el) => el.getBoundingClientRect().right,
    )
    expect(right).toBe(373)

    // Sticky pin + spy, mobile: mid-stack scroll pins the band at 0 and the
    // spy line (~15% of 852 = y128, below the 80 band) tracks block 02.
    await page.evaluate(() => window.scrollTo(0, 2450))
    expect((await viewportRect(page, 'nav[aria-label="Solutions"]')).top).toBe(0)
    await expect(tabLink(page, 'Custom Software')).toHaveAttribute('aria-current', 'true')
  })

  test('band stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard: the chips hold the 20px inset,
    // the column caps at the design's 342 and centers, fluid below 382.
    for (const width of [360, 430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      expect((await tabLink(page, 'Data + AI').boundingBox())!.x).toBe(20)

      const col = await body01(page).boundingBox()
      const expected = Math.min(342, width - 40)
      expect(col!.width).toBe(expected)
      expect(col!.x).toBe((width - expected) / 2)
      await expect(body01(page)).toHaveCSS('font-size', '18px')

      // The white strip holds its 22px across widths — seam, not overlap.
      const seam = await page.evaluate(() => {
        const weAre = [...document.querySelectorAll('section')].find((s) =>
          s.textContent!.includes('We Are />'),
        )!
        const scopeEl = document.querySelector('[data-testid="solutions-sticky-scope"]')!
        return scopeEl.getBoundingClientRect().top - weAre.getBoundingClientRect().bottom
      })
      expect(seam).toBe(22)
    }
  })
})
