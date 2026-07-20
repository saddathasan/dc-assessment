/**
 * Fidelity Gate — Solutions Section (MS-6, D-028). Visual layer: screenshot diff
 * ≤5% against sliced Figma Baselines (the tab bar + the active panel's intro
 * block — the Data + AI panel is the one the artboard draws; its heading differs
 * from the render per D-017.1). Numeric layer: zero-tolerance computed-style
 * asserts from file.json nodes 1:110..1:131 and 1:363..1:379.
 *
 * The bar is a content SWITCHER, not anchor navigation: one panel renders at a
 * time and the whole panel swaps on selection. It stays pinned for the panel's
 * height and releases where the Section ends — Tech Stack per note 1:277, whose
 * exact seam MS-9 verifies once the panel's cards (MS-7) and showcase (MS-8) land.
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

/**
 * Appends a 2000px stand-in for the Sections that follow Solutions, so scroll
 * states past today's page tail are reachable. Provisional until MS-9 lands the
 * real Tech Stack and T9.3 verifies the release seam against it.
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

const section = (page: Page) => page.locator('section#solutions')
const bar = (page: Page) => page.getByTestId('solutions-tab-bar')
const tabRow = (page: Page) => page.getByRole('tablist')
const tab = (page: Page, name: string) => page.getByRole('tab', { name })
const panel = (page: Page) => page.getByRole('tabpanel')
const numeralBox = (page: Page) => panel(page).locator('div[aria-hidden]')
const heading = (page: Page) => panel(page).getByRole('heading', { level: 2 })
const body = (page: Page) => panel(page).locator('p')
const cta = (page: Page) => panel(page).getByRole('link', { name: 'Book a consultation' })

const BAR_SELECTOR = '[data-testid="solutions-tab-bar"]'

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: entrance animations are
  // motion-safe-gated, so this pins geometry to its settled values before any
  // boundingBox sample — no mid-flight flake.
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
    await expect(section(page)).toHaveCSS('background-color', 'rgb(233, 237, 240)')
    expect(await section(page).boundingBox()).toMatchObject({ x: 0, y: 1836 })

    // Band 1:110: transparent 1440x100 — the pill floats free once pinned.
    await expect(bar(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect(await bar(page).boundingBox()).toMatchObject({ y: 1836, height: 100 })

    // Pill 1:111/1:112: white 612x70 r15 at x=490 — deliberately off the 1440
    // center (490/338 side margins), bottom-pinned in the band.
    const pill = tabRow(page)
    expect(await pill.boundingBox()).toEqual({ x: 490, y: 1866, width: 612, height: 70 })
    await expect(pill).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(pill).toHaveCSS('border-radius', '15px')

    // Selected tab 1:114/1:115: ink 200x60 r10 at x=496 (the 3x200 row bleeds
    // 4px past the design's 592 inner frame), spring-green label, Manrope 700 18/30.
    const selected = tab(page, 'Data + AI')
    await expect(selected).toHaveAttribute('aria-selected', 'true')
    expect(await selected.boundingBox()).toEqual({ x: 496, y: 1871, width: 200, height: 60 })
    await expect(selected).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(selected).toHaveCSS('border-radius', '10px')
    await expect(selected).toHaveCSS('color', 'rgb(6, 255, 112)')
    await expect(selected).toHaveCSS('font-family', /Manrope/)
    await expect(selected).toHaveCSS('font-size', '18px')
    await expect(selected).toHaveCSS('line-height', '30px')
    await expect(selected).toHaveCSS('font-weight', '700')
    await expect(selected).toHaveCSS('letter-spacing', '-0.9px')

    // Unselected tabs 1:116/1:118: transparent on the white pill, ink labels.
    for (const [name, x] of [
      ['Custom Software', 696],
      ['Tech Staffing', 896],
    ] as const) {
      const control = tab(page, name)
      expect(await control.boundingBox()).toEqual({ x, y: 1871, width: 200, height: 60 })
      await expect(control).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(control).toHaveCSS('color', 'rgb(22, 22, 22)')
      await expect(control).toHaveAttribute('aria-selected', 'false')
    }
  })

  test('the panel intro is design-exact', async ({ page }) => {
    // Panel body starts flush under the 100px band: the design's intro block
    // 1:120 occupies 1936..2306, and with one panel on screen the page matches
    // the artboard 1:1 (D-028) — the value-card row will begin at 2306 in MS-7.
    expect(await panel(page).boundingBox()).toMatchObject({ y: 1936, height: 370 })

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
    await expect(numeral).toHaveText('01')
    await expect(numeral).toHaveCSS('font-family', /Bricolage/)
    await expect(numeral).toHaveCSS('font-weight', '800')
    await expect(numeral).toHaveCSS('font-size', '170.7px')

    // Heading 1:128: Bricolage 800 32/36 at (487.2,2022) — one line; width is
    // not pinned because the D-017.1 fix ("Driven") renders narrower than the
    // design's "Settings".
    const h2 = heading(page)
    expectBoxNear(await h2.boundingBox(), { x: 487.2, y: 2022, height: 36 })
    await expect(h2).toHaveCSS('font-family', /Bricolage/)
    await expect(h2).toHaveCSS('font-size', '32px')
    await expect(h2).toHaveCSS('line-height', '36px')
    await expect(h2).toHaveCSS('font-weight', '800')
    await expect(h2).toHaveCSS('letter-spacing', '-1.6px')
    await expect(h2).toHaveCSS('color', 'rgb(22, 22, 22)')

    // Body 1:129: Manrope 400 18/27 in the fixed 610 column — exactly 4 lines
    // of 27 (D-027-class line-count pin; any reflow fails loudly).
    const p = body(page)
    expectBoxNear(await p.boundingBox(), { x: 487.2, y: 2078, width: 610, height: 108 })
    await expect(p).toHaveCSS('font-family', /Manrope/)
    await expect(p).toHaveCSS('font-size', '18px')
    await expect(p).toHaveCSS('line-height', '27px')
    await expect(p).toHaveCSS('letter-spacing', '-0.54px')

    // CTA 1:130/1:131: ink 192x50 r15, label #EFEFEF Manrope 700 14/24 centered.
    const button = cta(page)
    expectBoxNear(await button.boundingBox(), { x: 487.2, y: 2206, width: 192, height: 50 })
    await expect(button).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(button).toHaveCSS('border-radius', '15px')
    await expect(button).toHaveCSS('color', 'rgb(239, 239, 239)')
    await expect(button).toHaveCSS('font-size', '14px')
    await expect(button).toHaveCSS('line-height', '24px')
    await expect(button).toHaveCSS('font-weight', '700')
    await expect(button).toHaveCSS('letter-spacing', '-0.7px')
  })

  test('selecting a tab swaps the panel into the same design box', async ({ page }) => {
    const before = await panel(page).boundingBox()

    // click() scrolls the control into view first, so every geometry sample
    // below is taken back at scroll 0 — otherwise boxes read viewport-shifted.
    const select = async (name: string) => {
      await tab(page, name).click()
      await page.evaluate(() => window.scrollTo(0, 0))
    }

    await select('Custom Software')

    // Content changed…
    await expect(numeralBox(page).locator('span')).toHaveText('02')
    await expect(heading(page)).toHaveText('Custom Software Development')
    await expect(tab(page, 'Custom Software')).toHaveAttribute('aria-selected', 'true')

    // …into the identical design geometry: the panels share one layout, so the
    // authored copy must not move the box or reflow the fixed 610 column.
    expect(await panel(page).boundingBox()).toEqual(before)
    expectBoxNear(await numeralBox(page).boundingBox(), { x: 20, y: 2022 })
    expectBoxNear(await heading(page).boundingBox(), { x: 487.2, y: 2022, height: 36 })
    expectBoxNear(await body(page).boundingBox(), { x: 487.2, y: 2078, width: 610, height: 108 })
    expectBoxNear(await cta(page).boundingBox(), { x: 487.2, y: 2206, width: 192, height: 50 })

    await select('Tech Staffing')
    await expect(numeralBox(page).locator('span')).toHaveText('03')
    await expect(heading(page)).toHaveText('Tech Staff Augmentation')
    expect(await panel(page).boundingBox()).toEqual(before)
    expectBoxNear(await body(page).boundingBox(), { x: 487.2, y: 2078, width: 610, height: 108 })
  })

  test('the tab bar pins while the panel scrolls under it', async ({ page }) => {
    await extendPageTail(page)

    await page.evaluate(() => window.scrollTo(0, 2000))
    expect(await viewportRect(page, BAR_SELECTOR)).toMatchObject({ top: 0 })

    // Pinned, the bar still switches panels — that is the whole point of note
    // 1:277 keeping it on screen for the Section's height.
    await tab(page, 'Tech Staffing').click()
    await expect(numeralBox(page).locator('span')).toHaveText('03')
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)
  })

  test('bar releases with the Section end — provisional until MS-9', async ({ page }) => {
    // The Section currently ends after the intro because the panel's cards
    // (MS-7) and showcase (MS-8) are not built; the synthetic tail stands in
    // for what follows. MS-9 T9.3 re-verifies against the real Tech Stack.
    await extendPageTail(page)
    // Section extent measured at rest — it is 470 tall today (shorter than the
    // viewport), so both scroll targets are derived from it rather than assumed.
    const box = (await section(page).boundingBox())!

    // Still pinned while the Section has room below the bar…
    await page.evaluate((y) => window.scrollTo(0, y), box.y + 100)
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)

    // …and pushed out with the Section bottom once it passes: the bar's bottom
    // edge rides the Section's bottom edge exactly (note 1:277 release).
    await page.evaluate((y) => window.scrollTo(0, y), box.y + box.height - 40)
    const [barRect, sectionRect] = await Promise.all([
      viewportRect(page, BAR_SELECTOR),
      viewportRect(page, 'section#solutions'),
    ])
    expect(barRect.bottom).toBe(sectionRect.bottom)
    expect(barRect.top).toBeLessThan(0)
  })

  test('band stays capped and coherent on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard, but the content
    // caps at 1440 and centers while the gray canvas bleeds full-width (the
    // page convention): every x shifts by exactly (1920−1440)/2 = 240.
    await page.setViewportSize({ width: 1920, height: 900 })

    expect(await section(page).boundingBox()).toMatchObject({ x: 0, width: 1920 })
    expect(await tabRow(page).boundingBox()).toMatchObject({ x: 730, y: 1866, width: 612 })
    expectBoxNear(await numeralBox(page).boundingBox(), { x: 260, y: 2022 })
    expectBoxNear(await heading(page).boundingBox(), { x: 727.2, y: 2022 })
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
    expect(await section(page).boundingBox()).toMatchObject({ y: weAreBottom + 22 })
    await expect(section(page)).toHaveCSS('background-color', 'rgb(233, 237, 240)')

    // Band 1:363: 393x80, chips row 40 centered (y=1740 = 1720+20).
    expect(await bar(page).boundingBox()).toMatchObject({ y: 1720, height: 80 })

    // Selected chip 1:365/1:366: ink 110x40 r5 at x=20, spring-green Manrope 700 16/30.
    const selected = tab(page, 'Data + AI')
    expect(await selected.boundingBox()).toEqual({ x: 20, y: 1740, width: 110, height: 40 })
    await expect(selected).toHaveCSS('background-color', 'rgb(22, 22, 22)')
    await expect(selected).toHaveCSS('border-radius', '5px')
    await expect(selected).toHaveCSS('color', 'rgb(6, 255, 112)')
    await expect(selected).toHaveCSS('font-size', '16px')
    await expect(selected).toHaveCSS('line-height', '30px')
    await expect(selected).toHaveCSS('font-weight', '700')
    await expect(selected).toHaveCSS('letter-spacing', '-0.8px')

    // Unselected chips: explicit white on the gray (1:367/1:369) — 160 verbatim,
    // 145 authored for the third (the design draws it cut at the edge with the
    // label truncated to «Tech Staf»; at rest ours clips identically).
    const custom = tab(page, 'Custom Software')
    expect(await custom.boundingBox()).toEqual({ x: 135, y: 1740, width: 160, height: 40 })
    await expect(custom).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await tab(page, 'Tech Staffing').boundingBox()).toEqual({
      x: 300,
      y: 1740,
      width: 145,
      height: 40,
    })
  })

  test('the panel intro is design-exact', async ({ page }) => {
    // Content column 1:373: 342 centered in the 600 frame (25.5 margins),
    // uniform 20 rhythm: numeral 120 / heading 36 / body 168 / CTA 40.
    expect(await panel(page).boundingBox()).toMatchObject({ y: 1800, height: 600 })

    // Both numerals live in the DOM (the desktop one is lg-gated), so the
    // mobile assert must pick the visible node, not the first match.
    const numeral = panel(page).getByText('01', { exact: true }).filter({ visible: true })
    expect(await numeral.boundingBox()).toEqual({ x: 25.5, y: 1888, width: 342, height: 120 })
    await expect(numeral).toHaveCSS('font-family', /Bricolage/)
    await expect(numeral).toHaveCSS('font-size', '120px')
    await expect(numeral).toHaveCSS('line-height', '120px')
    await expect(numeral).toHaveCSS('font-weight', '800')
    await expect(numeral).toHaveCSS('letter-spacing', '-6px')
    await expect(numeral).toHaveCSS('color', 'rgb(0, 0, 0)')

    const h2 = heading(page)
    expect(await h2.boundingBox()).toMatchObject({ x: 25.5, y: 2028, height: 36 })
    await expect(h2).toHaveCSS('font-size', '24px')
    await expect(h2).toHaveCSS('line-height', '36px')
    await expect(h2).toHaveCSS('letter-spacing', '-1.2px')

    // Body 1:377: 18/24 (the desktop band uses 27), exactly 7 lines of 24
    // (D-027-class line-count pin).
    const p = body(page)
    expect(await p.boundingBox()).toEqual({ x: 25.5, y: 2084, width: 342, height: 168 })
    await expect(p).toHaveCSS('font-size', '18px')
    await expect(p).toHaveCSS('line-height', '24px')

    // CTA 1:378: 170x40 r10 (the desktop band uses 192x50 r15).
    const button = cta(page)
    expect(await button.boundingBox()).toEqual({ x: 25.5, y: 2272, width: 170, height: 40 })
    await expect(button).toHaveCSS('border-radius', '10px')
  })

  test('tab row overflow-scrolls, and tapping a chip swaps the panel', async ({ page }) => {
    // The row scrolls — 465 of content (chips + edge padding) in 393.
    const row = tabRow(page)
    expect(await row.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(72)

    // Scrolled to the end, the third chip sits fully inside, 20 off the edge.
    await row.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    expect(
      await tab(page, 'Tech Staffing').evaluate((el) => el.getBoundingClientRect().right),
    ).toBe(373)

    await tab(page, 'Tech Staffing').tap()
    await expect(panel(page).getByText('03', { exact: true }).filter({ visible: true })).toBeVisible()
    await expect(heading(page)).toHaveText('Tech Staff Augmentation')

    // Sticky pin, mobile: mid-panel scroll pins the band at 0.
    await extendPageTail(page)
    await page.evaluate(() => window.scrollTo(0, 2000))
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)
  })

  test('band stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard: the chips hold the 20px inset,
    // the column caps at the design's 342 and centers, fluid below 382.
    for (const width of [360, 430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      expect((await tab(page, 'Data + AI').boundingBox())!.x).toBe(20)

      const col = await body(page).boundingBox()
      const expected = Math.min(342, width - 40)
      expect(col!.width).toBe(expected)
      expect(col!.x).toBe((width - expected) / 2)
      await expect(body(page)).toHaveCSS('font-size', '18px')

      // The white strip holds its 22px across widths — seam, not overlap.
      const seam = await page.evaluate(() => {
        const weAre = [...document.querySelectorAll('section')].find((s) =>
          s.textContent!.includes('We Are />'),
        )!
        const solutions = document.querySelector('section#solutions')!
        return solutions.getBoundingClientRect().top - weAre.getBoundingClientRect().bottom
      })
      expect(seam).toBe(22)
    }
  })
})
