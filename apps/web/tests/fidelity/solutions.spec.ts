/**
 * Fidelity Gate — Solutions Section (MS-6, D-028). Visual layer: screenshot diff
 * ≤5% against sliced Figma Baselines (the tab bar + the active panel's intro
 * block — the Data + AI panel is the one the artboard draws; its heading differs
 * from the render per D-017.1). Numeric layer: zero-tolerance computed-style
 * asserts from file.json nodes 1:110..1:131 and 1:363..1:379.
 *
 * The bar is a content SWITCHER, not anchor navigation: one panel renders at a
 * time and the whole panel swaps on selection. It stays pinned for the panel's
 * height and releases where the Section ends — Tech Stack per note 1:277, the
 * seam MS-9 verified. Since MS-10 put the Footer under Tech Stack the page
 * finally outruns that release, so the bar leaves the viewport outright rather
 * than stalling part-way off it.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect, type Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { targets } from './sections.ts'

/** Mean colour of every blk x blk block — cancels the design's per-pixel noise. */
function blockAverage(png: PNG, blk: number) {
  const w = Math.floor(png.width / blk)
  const h = Math.floor(png.height / blk)
  const out = new Float64Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0
      for (let dy = 0; dy < blk; dy++) {
        for (let dx = 0; dx < blk; dx++) {
          const i = (png.width * (y * blk + dy) + (x * blk + dx)) << 2
          r += png.data[i]
          g += png.data[i + 1]
          b += png.data[i + 2]
        }
      }
      const n = blk * blk
      const k = (y * w + x) * 3
      out[k] = r / n
      out[k + 1] = g / n
      out[k + 2] = b / n
    }
  }
  return { w, h, data: out }
}

/**
 * Clips the page to a manifest region and diffs it against the Section's Baseline.
 * fullPage: the band sits past the viewport fold, and clips outside the viewport
 * are only valid on a full-page screenshot.
 */
async function expectBaseline(page: Page, id: string): Promise<void> {
  const target = targets.find((t) => t.id === id)
  if (!target) throw new Error(`no fidelity target '${id}'`)
  const shot = await page.screenshot({ clip: target.clip, animations: 'disabled', fullPage: true })
  if (!target.noiseTextured) {
    expect(shot).toMatchSnapshot(`${id}.png`)
    return
  }
  // Noise-textured band: diff the 8x8 block averages instead (see sections.ts).
  const here = dirname(fileURLToPath(import.meta.url))
  const base = blockAverage(PNG.sync.read(readFileSync(join(here, 'baselines', `${id}.png`))), 8)
  const shotAvg = blockAverage(PNG.sync.read(shot), 8)
  expect({ w: shotAvg.w, h: shotAvg.h }).toEqual({ w: base.w, h: base.h })
  let over = 0
  for (let i = 0; i < base.data.length; i += 3) {
    const delta =
      Math.abs(base.data[i] - shotAvg.data[i]) +
      Math.abs(base.data[i + 1] - shotAvg.data[i + 1]) +
      Math.abs(base.data[i + 2] - shotAvg.data[i + 2])
    if (delta > 48) over++
  }
  const ratio = over / (base.data.length / 3)
  expect(ratio, `${id} averaged diff ${(ratio * 100).toFixed(2)}%`).toBeLessThan(0.05)
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
// First child only: the showcase's scrim is aria-hidden too.
const numeralBox = (page: Page) => panel(page).locator('> div').first().locator('div[aria-hidden]')
const heading = (page: Page) => panel(page).getByRole('heading', { level: 2 })
// Scoped to the intro block: the card row and the showcase each add their own
// paragraphs to the panel, so this must target the panel's first child only.
const body = (page: Page) => panel(page).locator('> div').first().locator('p')
const cta = (page: Page) => panel(page).getByRole('link', { name: 'Book a consultation' })
const band = (page: Page) => panel(page).locator('> div').last()
const bandCta = (page: Page) => band(page).getByRole('link', { name: /Explore more/ })
const dots = (page: Page) => band(page).locator('ul').last().locator('span')

const cardRow = (page: Page) => page.getByTestId('solution-cards')
const cards = (page: Page) => cardRow(page).locator('li')
const cardTitle = (page: Page, i: number) => cards(page).nth(i).getByRole('heading', { level: 3 })
// The light and dark states are separate cross-fading layers (see SolutionCards):
// the light one is presentational, so its heading is a <p> inside an aria-hidden box.
const lightLayer = (page: Page, i: number) => cards(page).nth(i).locator('div[aria-hidden]')
const darkLayer = (page: Page, i: number) => cards(page).nth(i).locator(':scope > div').nth(1)
const cardRestTitle = (page: Page, i: number) => lightLayer(page, i).locator('p')
const cardBody = (page: Page, i: number) => darkLayer(page, i).locator('p')

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
    // The panel is the tab's whole body: intro 1936..2306, cards 2306..2756, a
    // 73px gray gap, then the showcase 2829..3529 — 1593 in all. With one panel
    // on screen the page matches the artboard 1:1 (D-028).
    expect(await panel(page).boundingBox()).toMatchObject({ y: 1936, height: 1593 })

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
    await page.evaluate(() => window.scrollTo(0, 2000))
    expect(await viewportRect(page, BAR_SELECTOR)).toMatchObject({ top: 0 })

    // Pinned, the bar still switches panels — that is the whole point of note
    // 1:277 keeping it on screen for the Section's height.
    await tab(page, 'Tech Staffing').click()
    await expect(numeralBox(page).locator('span')).toHaveText('03')
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)
  })

  test('bar releases with the Section end, at the real Tech Stack seam', async ({ page }) => {
    // Verified against the real page tail since MS-9 (T9.3): the Section now
    // runs its full 1836→3529 and Tech Stack follows it, so the release happens
    // where note 1:277 says it does instead of against a synthetic spacer.
    const box = (await section(page).boundingBox())!
    const bottom = box.y + box.height

    // Still pinned while the Section has room below the bar…
    await page.evaluate((y) => window.scrollTo(0, y), box.y + 100)
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)

    // …and pushed out with the Section bottom once it passes: the bar's bottom
    // edge rides the Section's bottom edge exactly (note 1:277 release). The
    // target sits 60 short of the seam so the release is observed rather than
    // clamped into. That margin used to be the binding constraint — 11px before
    // MS-10 — but the Footer moved maximum scroll to 3838, well past this 3469.
    await page.evaluate((y) => window.scrollTo(0, y), bottom - 60)
    const [barRect, sectionRect] = await Promise.all([
      viewportRect(page, BAR_SELECTOR),
      viewportRect(page, 'section#solutions'),
    ])
    expect(barRect.bottom).toBe(sectionRect.bottom)
    expect(barRect.top).toBeLessThan(0)

    // And it never re-pins: scrolled as far as the page goes, the bar is still
    // riding the Section's bottom edge rather than back at top 0.
    //
    // It is also gone. MS-9 could only record that the bar does not re-pin,
    // because Tech Stack's 850 tail was shorter than the 900 viewport and left
    // ~49px of it on screen at maximum scroll. MS-10's Footer takes the page to
    // 4738, so maximum scroll (3838) now outruns the Section's 3529 end and the
    // bar clears the top edge by 309px — note 1:277's "no longer required" is
    // literally true, and asserted as such rather than deferred again.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const released = await viewportRect(page, BAR_SELECTOR)
    expect(released.bottom).toBeLessThan(0)
    expect(released.bottom).toBe((await viewportRect(page, 'section#solutions')).bottom)
  })

  test('value cards match the Baseline and the light-state design', async ({ page }) => {
    await expectBaseline(page, 'solution-cards-desktop')

    // Row 1:132/1:133: 1440x450 flush under the intro block's 1936+370, three
    // 457x450 cards, 16 gutter, centered — the 18.5 inset is that centering.
    expect(await cardRow(page).boundingBox()).toMatchObject({ y: 2306, height: 450 })
    for (const [i, x] of [18.5, 491.5, 964.5].entries()) {
      expectBoxNear(await cards(page).nth(i).boundingBox(), { x, y: 2306, width: 457, height: 450 })
    }

    // Card shell: white, r15, and the 1px #E3E3E3 edge drawn as an INSET ring —
    // a real border would eat the padding and shift every child 1px.
    const card = cards(page).first()
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(card).toHaveCSS('border-radius', '15px')
    await expect(card).toHaveCSS('box-shadow', /rgb\(227, 227, 227\) 0px 0px 0px 1px inset/)

    // Titles 1:136/1:139/1:142: centered ink Bricolage 800 32, ls -1.6, and the
    // content column is the full 397 (padding 30 either side of 457).
    for (const i of [0, 1, 2]) {
      const title = cardRestTitle(page, i)
      expectBoxNear(await title.boundingBox(), { x: [48.5, 521.5, 994.5][i], width: 397 })
      await expect(title).toHaveCSS('font-family', /Bricolage/)
      await expect(title).toHaveCSS('font-size', '32px')
      await expect(title).toHaveCSS('font-weight', '800')
      await expect(title).toHaveCSS('letter-spacing', '-1.6px')
      await expect(title).toHaveCSS('text-align', 'center')
      await expect(title).toHaveCSS('color', 'rgb(22, 22, 22)')
    }
    // The two wrapping titles sit exactly where the design puts them; line-height
    // is held at the design's 42 through the flip rather than dropping to the
    // dark state's 36, so the heading never reflows mid-animation.
    expectBoxNear(await cardRestTitle(page, 1).boundingBox(), { y: 2489, height: 84 })
    expectBoxNear(await cardRestTitle(page, 2).boundingBox(), { y: 2489, height: 84 })

    // At rest the light layer is opaque and the dark one fully faded out; the
    // body copy stays in the DOM for search and assistive tech either way.
    await expect(lightLayer(page, 0)).toHaveCSS('opacity', '1')
    await expect(darkLayer(page, 0)).toHaveCSS('opacity', '0')
  })

  test('a card flips light to dark on hover, revealing its body (note 2:3)', async ({ page }) => {
    const card = cards(page).first()
    // hover() scrolls the card into view, so settle the scroll BEFORE sampling —
    // otherwise the "did it move" comparison just measures the scroll.
    await card.scrollIntoViewIfNeeded()
    // Geometry of both layers before the flip: the reveal is a cross-fade like
    // the mega-menu tiles, so neither may move (mutating text-align or
    // justify-content instead snapped the heading on frame 1 — see SolutionCards).
    const restBefore = await cardRestTitle(page, 0).boundingBox()
    const darkBefore = await cardTitle(page, 0).boundingBox()

    await card.hover()

    // Frame 2:36: bg #032019, title accent green and left-aligned, body white.
    await expect(card).toHaveCSS('background-color', 'rgb(3, 32, 25)')
    await expect(lightLayer(page, 0)).toHaveCSS('opacity', '0')
    await expect(darkLayer(page, 0)).toHaveCSS('opacity', '1')
    await expect(cardTitle(page, 0)).toHaveCSS('color', 'rgb(51, 249, 135)')
    await expect(cardTitle(page, 0)).toHaveCSS('text-align', 'start')
    expect(await cardRestTitle(page, 0).boundingBox()).toEqual(restBefore)
    expect(await cardTitle(page, 0).boundingBox()).toEqual(darkBefore)
    // The dark layer fills the design's 397x390 content box exactly: heading at
    // its top, body ending on its floor. Pinned because the mobile `h-full`
    // resolves against the card, not the inset box, and silently overflowed it
    // by 30px. Measured relative to the card, since hover() has scrolled.
    const cardBox = (await card.boundingBox())!
    const layerBox = (await darkLayer(page, 0).boundingBox())!
    expect(layerBox.width).toBe(397)
    expect(layerBox.height).toBe(390)
    expect(layerBox.x - cardBox.x).toBe(30)
    expect(layerBox.y - cardBox.y).toBe(30)

    const titleBox = (await cardTitle(page, 0).boundingBox())!
    expect(titleBox.y - cardBox.y).toBe(30)
    expect(titleBox.height).toBe(42)

    const body = cardBody(page, 0)
    const bodyBox = (await body.boundingBox())!
    expect(bodyBox.width).toBe(397)
    expect(bodyBox.height).toBe(120)
    // Body floor == content-box floor: card 450 − 30 padding.
    expect(bodyBox.y + bodyBox.height - cardBox.y).toBe(420)
    await expect(body).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(body).toHaveCSS('font-family', /Manrope/)
    await expect(body).toHaveCSS('font-size', '18px')
    await expect(body).toHaveCSS('line-height', '24px')
    await expect(body).toHaveCSS('font-weight', '500')

    // Scoped to the hovered card only — "each card individually".
    await expect(cards(page).nth(1)).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(darkLayer(page, 1)).toHaveCSS('opacity', '0')

    // The stroke survives the flip (render-verified on the dark cards).
    await expect(card).toHaveCSS('box-shadow', /rgb\(227, 227, 227\) 0px 0px 0px 1px inset/)
  })

  test('keyboard focus mirrors the hover reveal (D-010 parity)', async ({ page }) => {
    await cards(page).first().focus()
    await expect(cards(page).first()).toHaveCSS('background-color', 'rgb(3, 32, 25)')
    await expect(darkLayer(page, 0)).toHaveCSS('opacity', '1')
  })

  test('the card row swaps with the tab', async ({ page }) => {
    await tab(page, 'Tech Staffing').click()
    await page.evaluate(() => window.scrollTo(0, 0))

    await expect(cardTitle(page, 0)).toHaveText('Engineers Screen Engineers')
    await expect(cardRestTitle(page, 0)).toHaveText('Engineers Screen Engineers')
    // Authored copy must land in the same design boxes as the extracted set.
    expect(await cardRow(page).boundingBox()).toMatchObject({ y: 2306, height: 450 })
    expectBoxNear(await cards(page).nth(0).boundingBox(), { x: 18.5, y: 2306, width: 457, height: 450 })
  })

  test('the showcase closes the panel and matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'solution-showcase-desktop')

    // Band 1:146: #17A955 1440x700 at y=2829 — 73px of gray canvas below the
    // card row. (The design token named `showcase` was a mobile-sampled #21A356;
    // both artboards' node fill is this green, so that token is retired.)
    expect(await band(page).boundingBox()).toMatchObject({ y: 2829, height: 700 })
    await expect(band(page)).toHaveCSS('background-color', 'rgb(14, 124, 59)') // D-034: darkened for AA

    // Copy column 1:148 centred in the band: logo, 230 gap, then the copy stack.
    expectBoxNear(await band(page).locator('img').first().boundingBox(), {
      x: 30, y: 2878.5, width: 279, height: 40,
    })
    const h3 = band(page).getByRole('heading', { level: 3 })
    expectBoxNear(await h3.boundingBox(), { x: 30, y: 3148.5, width: 539, height: 162 })
    await expect(h3).toHaveCSS('font-size', '48px')
    await expect(h3).toHaveCSS('line-height', '54px')
    await expect(h3).toHaveCSS('letter-spacing', '-2.4px')
    await expect(h3).toHaveCSS('color', 'rgb(255, 255, 255)')

    // CTA 1:154: ghost pill, 2px white@35% inset stroke, no fill.
    expectBoxNear(await bandCta(page).boundingBox(), { x: 30, y: 3429.5, width: 169, height: 50 })
    await expect(bandCta(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(bandCta(page)).toHaveCSS('box-shadow', /rgba\(255, 255, 255, 0.35\) 0px 0px 0px 2px inset/)

    // Media frame 1:157 at x=710 — the design keeps 30px gutters either side
    // (30 + 680 + 700 + 30 = 1440).
    expectBoxNear(await band(page).locator('.relative').first().boundingBox(), {
      x: 710, y: 2854, width: 700, height: 650,
    })

    // Dot rail 1:161: the active dot is elongated, not recoloured.
    await expect(dots(page).first()).toHaveCSS('width', '50px')
    await expect(dots(page).nth(1)).toHaveCSS('width', '20px')
  })

  test('the showcase swaps with the tab, wordmark standing in for a missing logo', async ({ page }) => {
    await tab(page, 'Custom Software').click()
    await page.evaluate(() => window.scrollTo(0, 0))

    await expect(band(page).getByRole('heading', { level: 3 })).toHaveText(
      'An offline-first field operations platform',
    )
    // D-028.5: authored panels ship no logo bitmap, so the product name renders
    // as a wordmark at the mark's height rather than leaving a hole.
    await expect(band(page).locator('img')).toHaveCount(4)
    await expect(band(page).getByText('Fieldmark')).toBeVisible()
    expect(await band(page).boundingBox()).toMatchObject({ y: 2829, height: 700 })
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
    // Panel = intro 600 (1:371) + cards 394 (1:380) + 29 gap + showcase 900 (1:387).
    expect(await panel(page).boundingBox()).toMatchObject({ y: 1800, height: 1923 })

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
    await page.evaluate(() => window.scrollTo(0, 2000))
    expect((await viewportRect(page, BAR_SELECTOR)).top).toBe(0)
  })

  test('value cards match the Baseline and rest in the dark state', async ({ page }) => {
    await expectBaseline(page, 'solution-cards-mobile')

    // Block 1:380 at render 2457 → page 2400 (−57 status bar); the designed card
    // 1:381 is 353x350 inset 20, and mobile has no hover so it rests dark (D-015).
    const card = cards(page).first()
    expect(await card.boundingBox()).toEqual({ x: 20, y: 2422, width: 353, height: 350 })
    await expect(card).toHaveCSS('background-color', 'rgb(3, 32, 25)')
    await expect(card).toHaveCSS('border-radius', '15px')
    await expect(card).toHaveCSS('box-shadow', /rgb\(227, 227, 227\) 0px 0px 0px 1px inset/)

    const title = cardTitle(page, 0)
    expect(await title.boundingBox()).toMatchObject({ x: 43, y: 2445, height: 30 })
    await expect(title).toHaveCSS('color', 'rgb(51, 249, 135)')
    await expect(title).toHaveCSS('font-size', '24px')
    await expect(title).toHaveCSS('line-height', '30px')

    // Body 1:384: 322 wide — it deliberately overruns the card's 23px right
    // padding — and rests 23 from the bottom, not the frame's declared 28.
    const body = cardBody(page, 0)
    expect(await body.boundingBox()).toEqual({ x: 43, y: 2605, width: 322, height: 144 })
    await expect(body).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(body).toHaveCSS('font-size', '18px')
    await expect(body).toHaveCSS('line-height', '24px')
    await expect(body).toHaveCSS('opacity', '1')
  })

  test('all three cards ride a swipe carousel (D-015)', async ({ page }) => {
    // The artboard draws one card; D-015 keeps all three on mobile as a
    // scroll-snap carousel rather than dropping two value propositions.
    await expect(cards(page)).toHaveCount(3)
    const row = cardRow(page)
    expect(await row.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0)
    await expect(row).toHaveCSS('scroll-snap-type', 'x mandatory')
    await expect(cards(page).first()).toHaveCSS('scroll-snap-align', 'center')
  })

  test('the showcase closes the panel and matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'solution-showcase-mobile')

    // Band 1:387 at render 2880 → page 2823, 393x900 after a 29px gray gap.
    expect(await band(page).boundingBox()).toMatchObject({ y: 2823, height: 900 })
    await expect(band(page)).toHaveCSS('background-color', 'rgb(14, 124, 59)') // D-034: darkened for AA

    // Logo block 1:388 (200 tall, 40 top pad), copy block 1:392 (300, centred),
    // media block 1:399 (400, device bottom-packed 20 from the edge).
    expectBoxNear(await band(page).locator('img').first().boundingBox(), {
      x: 20, y: 2863, width: 209, height: 30,
    })
    const h3 = band(page).getByRole('heading', { level: 3 })
    expectBoxNear(await h3.boundingBox(), { x: 20, y: 3041, width: 353, height: 114 })
    await expect(h3).toHaveCSS('font-size', '32px')
    await expect(h3).toHaveCSS('line-height', '38px')
    expectBoxNear(await bandCta(page).boundingBox(), { x: 20, y: 3265, width: 140, height: 40 })
    await expect(bandCta(page)).toHaveCSS('border-radius', '10px')
    expectBoxNear(await band(page).locator('.relative').first().boundingBox(), {
      x: 15, y: 3366, width: 363, height: 337,
    })
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
