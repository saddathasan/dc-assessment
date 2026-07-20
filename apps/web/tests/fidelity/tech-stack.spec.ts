/**
 * Fidelity Gate — Tech Stack Section (MS-9). Visual layer: screenshot diff ≤5%
 * against sliced Figma Baselines; numeric layer: zero-tolerance computed-style
 * asserts on the values extracted from file.json (D-021).
 *
 * The gate forces reduced motion, so what it screenshots is the marquee at rest
 * — which is why "at rest" is defined as the phase each row's artboard frame was
 * drawn at (D-029.3). The phase asserts below are the pixel proof of that: the
 * tile opening each row must sit at exactly −phase, reproducing the trimmed end
 * tile the design draws. Motion, pausing, and WCAG 2.2.2 are exercised in the
 * one describe that opts back into animation.
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

const band = (page: Page) => page.locator('section#tech-stack')
const eyebrow = (page: Page) => page.getByText('Tech Stacks />')
const heading = (page: Page) => page.getByRole('heading', { name: 'Built With Modern Technologies' })
const body = (page: Page) => page.getByText(/^We use modern, reliable technologies/)
const marquee = (page: Page) => page.getByTestId('marquee')
const rows = (page: Page) => page.getByTestId('marquee-row')

test.beforeEach(async ({ page }) => {
  // Belt to the config's reducedMotion braces: the marquee is motion-gated, so
  // this pins every row to its drawn phase before any boundingBox sample.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
})

test.describe('Tech Stack @1440', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only asserts')

  test('tech stack band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'tech-stack-desktop')
  })

  test('band and copy block geometry and styles are design-exact', async ({ page }) => {
    // Band: white 1440x850 at y=3530 — one artboard px under the showcase's
    // 3529 end (frame 1:143 itemSpacing=1, built as a 1px white strip).
    const section = band(page)
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await section.boundingBox()).toMatchObject({ y: 3530, height: 850 })

    // Copy row: 147 tall bottom-pinned in the 297 heading frame, itself centred
    // in the 850 band (41.5 above and below, node 1:166 primaryAxis=CENTER).
    // Eyebrow 115x24 at (20,3671.5), Manrope w600 18/24 ls −0.9 (node 1:169).
    const label = eyebrow(page)
    expect(await label.boundingBox()).toEqual({ x: 20, y: 3671.5, width: 115, height: 24 })
    await expect(label).toHaveCSS('font-family', /Manrope/)
    await expect(label).toHaveCSS('font-size', '18px')
    await expect(label).toHaveCSS('line-height', '24px')
    await expect(label).toHaveCSS('font-weight', '600')
    await expect(label).toHaveCSS('letter-spacing', '-0.9px')
    await expect(label).toHaveCSS('color', 'rgb(22, 22, 22)')

    // Heading: 681 wide at (493,3671.5) = 20 + 115 + itemSpacing 358, one line
    // of 36. Bricolage w800 32/36 ls −1.6 (node 1:171).
    const h2 = heading(page)
    expect(await h2.boundingBox()).toEqual({ x: 493, y: 3671.5, width: 681, height: 36 })
    await expect(h2).toHaveCSS('font-family', /Bricolage/)
    await expect(h2).toHaveCSS('font-size', '32px')
    await expect(h2).toHaveCSS('line-height', '36px')
    await expect(h2).toHaveCSS('font-weight', '800')
    await expect(h2).toHaveCSS('letter-spacing', '-1.6px')

    // Body: 681 wide at (493,3737.5) — 30 under the heading — wrapping to
    // exactly 3 lines of 27. Manrope w400 18/27 ls −0.54 (node 1:172).
    const p = body(page)
    expect(await p.boundingBox()).toEqual({ x: 493, y: 3737.5, width: 681, height: 81 })
    await expect(p).toHaveCSS('font-family', /Manrope/)
    await expect(p).toHaveCSS('font-size', '18px')
    await expect(p).toHaveCSS('line-height', '27px')
    await expect(p).toHaveCSS('letter-spacing', '-0.54px')
  })

  test('the three rows sit where the artboard stacks them', async ({ page }) => {
    // Rows block: 470 = 3x150 + 2x10, opening at 3868.5 (node 1:173).
    expect(await marquee(page).boundingBox()).toMatchObject({ y: 3868.5, height: 470 })

    const boxes = await rows(page).evaluateAll((els) =>
      els.map((el) => {
        const { y, height, width } = el.getBoundingClientRect()
        return { y: y + window.scrollY, height, width }
      }),
    )
    expect(boxes).toEqual([
      { y: 3868.5, height: 150, width: 1440 },
      { y: 4028.5, height: 150, width: 1440 },
      { y: 4188.5, height: 150, width: 1440 },
    ])
  })

  test('each row rests at the phase its artboard frame was drawn at (D-029)', async ({ page }) => {
    // The decode: a row's first visible tile is 250 − phase wide, so parking the
    // strip at −phase reproduces the trimmed end tile the design draws. Tile 6
    // opens the second copy, which is the one the base offset brings on screen.
    const PHASES = [36, 76, 34]
    for (const [index, phase] of PHASES.entries()) {
      const tiles = rows(page).nth(index).getByTestId('marquee-tile')
      const opening = await tiles.nth(6).boundingBox()
      expect(opening).toMatchObject({ x: -phase, width: 250, height: 150 })
      // …and the visible remnant matches the artboard's own first tile.
      expect(opening!.x + opening!.width).toBe(250 - phase)
      // The next tile lands on the 260 pitch (250 tile + 10 gap).
      expect((await tiles.nth(7).boundingBox())!.x).toBe(260 - phase)
    }
  })

  test('tiles carry the design plate: 250 wide, #f8f8f8, radius 15', async ({ page }) => {
    const tile = rows(page).first().getByTestId('marquee-tile').nth(7)
    expect(await tile.boundingBox()).toMatchObject({ width: 250, height: 150 })
    await expect(tile).toHaveCSS('background-color', 'rgb(248, 248, 248)')
    await expect(tile).toHaveCSS('border-radius', '15px')
  })

  test('reduced motion leaves the marquee static at its drawn frame', async ({ page }) => {
    // The whole Baseline rests on this: no animation at all under reduce, so the
    // screenshot is the artboard frame rather than a sample of a moving strip.
    const animation = await page
      .locator('.marquee-strip')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName)
    expect(animation).toBe('none')
  })

  test('band bleeds full-width while the copy caps at 1440 on wide viewports', async ({ page }) => {
    // No Baseline exists beyond the design's 1440 artboard. The copy follows the
    // page convention (caps and centres); the marquee does not — the design's
    // rows are layoutSizingHorizontal=FILL, so they bleed and simply reveal more
    // tiles, which is the whole point of a strip.
    await page.setViewportSize({ width: 2000, height: 900 })

    expect(await band(page).boundingBox()).toMatchObject({ x: 0, width: 2000, height: 850 })
    // Copy shifts by exactly (2000 − 1440) / 2 = 280 while its widths hold.
    expect(await eyebrow(page).boundingBox()).toMatchObject({ x: 300, width: 115 })
    expect(await heading(page).boundingBox()).toMatchObject({ x: 773, width: 681 })

    const row = rows(page).first()
    expect((await row.boundingBox())!.width).toBe(2000)
    // The strip still covers the wider viewport at both ends of a cycle — a
    // short strip would tear a gap in at the right edge as it travels.
    const tiles = row.getByTestId('marquee-tile')
    const last = await tiles.nth((await tiles.count()) - 1).boundingBox()
    expect(last!.x + last!.width).toBeGreaterThan(2000)
  })
})

test.describe('Tech Stack @393', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only asserts')

  test('tech stack band matches the Baseline', async ({ page }) => {
    await expectBaseline(page, 'tech-stack-mobile')
  })

  test('stacked geometry and styles are design-exact', async ({ page }) => {
    // Band: 393x710 at y=3723 (render 3780 − 57 status bar), flush under the
    // showcase's clip end 2823+900. 350 heading block + 360 marquee block.
    const section = band(page)
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await section.boundingBox()).toMatchObject({ y: 3723, height: 710 })

    // Copy is bottom-pinned in the 350 block (node 1:410 primaryAxis=MAX): 212
    // of content 50 above the block end leaves 88px of headroom. Eyebrow swaps
    // to Bricolage on mobile like every other Section's (node 1:413).
    const label = eyebrow(page)
    expect(await label.boundingBox()).toMatchObject({ x: 20, y: 3811, height: 24 })
    await expect(label).toHaveCSS('font-family', /Bricolage/)
    await expect(label).toHaveCSS('font-size', '18px')
    await expect(label).toHaveCSS('letter-spacing', '-0.9px')

    // Heading: 28/34 over exactly 2 lines, 20 under the eyebrow (node 1:414).
    const h2 = heading(page)
    expect(await h2.boundingBox()).toMatchObject({ x: 20, y: 3855, height: 68 })
    await expect(h2).toHaveCSS('font-size', '28px')
    await expect(h2).toHaveCSS('line-height', '34px')
    await expect(h2).toHaveCSS('letter-spacing', '-1.4px')

    // Body: Manrope 14/20 over exactly 4 lines, 20 under the heading (1:415).
    // The 347 measure is asserted, not incidental — at the 353 the padding box
    // would otherwise give, the same four lines break in different places and
    // "and" rides up to line 1, diverging from the render.
    const p = body(page)
    expect(await p.boundingBox()).toMatchObject({ x: 20, y: 3943, width: 347, height: 80 })
    const lines = await p.evaluate((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return [...range.getClientRects()].map((r) => Math.round(r.width))
    })
    expect(lines).toHaveLength(4)
    await expect(p).toHaveCSS('font-family', /Manrope/)
    await expect(p).toHaveCSS('font-size', '14px')
    await expect(p).toHaveCSS('line-height', '20px')
    await expect(p).toHaveCSS('letter-spacing', '-0.42px')
  })

  test('rows are 100 tall with the design’s 40px of slack under them', async ({ page }) => {
    // Node 2:37 is 360 tall over 320 of rows, packed top — the slack is real
    // design space, not a rounding gap, and the Footer starts after it (4490).
    expect(await marquee(page).boundingBox()).toMatchObject({ y: 4073, height: 360 })

    const boxes = await rows(page).evaluateAll((els) =>
      els.map((el) => {
        const { y, height, width } = el.getBoundingClientRect()
        return { y: y + window.scrollY, height, width }
      }),
    )
    expect(boxes).toEqual([
      { y: 4073, height: 100, width: 393 },
      { y: 4183, height: 100, width: 393 },
      { y: 4293, height: 100, width: 393 },
    ])
  })

  test('each row rests at its mobile phase, bleeding off both edges', async ({ page }) => {
    // Mobile keeps the 250 tile and 260 pitch of desktop — only the row height
    // and the phases differ (D-029.2). Both edges are mid-tile: that is the
    // edge-bleed T9.2 calls for, and it only exists on the X axis.
    const PHASES = [42, 82, 40]
    for (const [index, phase] of PHASES.entries()) {
      const tiles = rows(page).nth(index).getByTestId('marquee-tile')
      const opening = await tiles.nth(6).boundingBox()
      expect(opening).toMatchObject({ x: -phase, width: 250, height: 100 })
      expect(opening!.x + opening!.width).toBe(250 - phase)
      // The row's right edge lands mid-tile too, never on a tile boundary.
      const second = (await tiles.nth(7).boundingBox())!
      expect(second.x).toBe(260 - phase)
      expect(second.x + second.width).toBeGreaterThan(393)
    }
  })

  test('band stays fluid and coherent across phone and tablet widths', async ({ page }) => {
    // No Baselines exist off the 393 artboard, but below lg the band must scale
    // like its neighbours: 20px side margins hold, the copy fills the width, the
    // mobile type scale holds, and the marquee keeps bleeding.
    for (const width of [360, 430, 800]) {
      await page.setViewportSize({ width, height: 900 })

      const labelBox = await eyebrow(page).boundingBox()
      expect(labelBox!.x).toBe(20)

      const pBox = await body(page).boundingBox()
      expect(pBox!.x).toBe(20)
      // 20 left + 26 right: the design's copy measure, which is what holds the
      // body's line breaks at 393 (see the block's padding comment).
      expect(pBox!.width).toBe(width - 46)
      // Wrapped height stays a whole number of 20px lines.
      expect(pBox!.height % 20).toBe(0)
      await expect(body(page)).toHaveCSS('font-size', '14px')

      // Rows bleed the full width at every size and keep the 250 tile.
      const row = rows(page).first()
      expect((await row.boundingBox())!.width).toBe(width)
      expect((await row.getByTestId('marquee-tile').nth(7).boundingBox())!.width).toBe(250)
    }
  })
})

test.describe('Tech Stack motion and pause control (WCAG 2.2.2)', () => {
  test.skip(({ isMobile }) => isMobile, 'one pass is enough; the CSS is shared')

  test.beforeEach(async ({ page }) => {
    // Opt back into motion — the rest of the gate runs reduced, which is exactly
    // the state in which none of this applies.
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  const playState = (page: Page, index: number) =>
    page
      .locator('.marquee-strip')
      .nth(index)
      .evaluate((el) => getComputedStyle(el).animationPlayState)

  const animationName = (page: Page, index: number) =>
    page
      .locator('.marquee-strip')
      .nth(index)
      .evaluate((el) => getComputedStyle(el).animationName)

  test('top and bottom rows travel together, the middle one against them (note 2:5)', async ({
    page,
  }) => {
    const names = await Promise.all([0, 1, 2].map((i) => animationName(page, i)))
    expect(names[0]).toBe('marquee-left')
    expect(names[1]).toBe('marquee-right')
    expect(names[2]).toBe('marquee-left')
    expect(names[0]).toBe(names[2])
    expect(names[1]).not.toBe(names[0])
  })

  test('rows animate by default', async ({ page }) => {
    expect(await playState(page, 0)).toBe('running')
  })

  test('hovering a row pauses that row', async ({ page }) => {
    await page.getByTestId('marquee-row').first().hover()
    expect(await playState(page, 0)).toBe('paused')
  })

  test('the pause control stops every row and says what it will do next', async ({ page }) => {
    // WCAG 2.2.2 needs a mechanism that does not depend on pointing. The control
    // is off-screen until focused (D-029.5) — focusing it must reveal it, and
    // activating it must stop all three rows, not just the hovered one.
    const control = page.getByRole('button', { name: /pause logo animation/i })
    await control.focus()
    await expect(control).toBeInViewport()

    await control.click()
    expect(await Promise.all([0, 1, 2].map((i) => playState(page, i)))).toEqual([
      'paused',
      'paused',
      'paused',
    ])

    const resume = page.getByRole('button', { name: /resume logo animation/i })
    await expect(resume).toHaveAttribute('aria-pressed', 'true')
    await resume.click()
    expect(await playState(page, 0)).toBe('running')
  })

  test('the marquee can be stopped by keyboard alone', async ({ page }) => {
    // The WCAG 2.2.2 path for someone with no pointer: reach the control by
    // tabbing and fire it with the keyboard. Focusing it must not pause on its
    // own — stopping the motion stays an explicit act.
    const control = page.getByRole('button', { name: /pause logo animation/i })
    await control.focus()
    expect(await playState(page, 0)).toBe('running')

    await page.keyboard.press('Enter')
    expect(await playState(page, 0)).toBe('paused')
    await expect(page.getByRole('button', { name: /resume logo animation/i })).toBeFocused()
  })
})

test.describe('Solutions sticky release at the Tech Stack seam (T9.3)', () => {
  test('the Section seam matches the artboard at both widths', async ({ page, isMobile }) => {
    // The desktop artboard puts 1px between the showcase and Tech Stack (frame
    // 1:143 itemSpacing=1, white on white); the mobile stack is flush. This is
    // the coupling MS-6 left provisional: Tech Stack's top edge IS where the
    // sticky scope ends, so the page must land on the artboard, not near it.
    const seam = await page.evaluate(() => {
      const solutions = document.querySelector('section#solutions')!
      const techStack = document.querySelector('section#tech-stack')!
      return techStack.getBoundingClientRect().top - solutions.getBoundingClientRect().bottom
    })
    expect(seam).toBe(isMobile ? 0 : 1)

    const top = await page.evaluate(
      () => document.querySelector('section#tech-stack')!.getBoundingClientRect().top + window.scrollY,
    )
    expect(top).toBe(isMobile ? 3723 : 3530)
  })

  test('the Section makes the release position reachable without clamping', async ({
    page,
    isMobile,
  }) => {
    // The bar's release is asserted in solutions.spec.ts, which owns the sticky
    // behaviour. What MS-9 owes it is a real tail: before this Section landed,
    // the document ended at the Solutions Section, so no scroll position could
    // reach the release and it had to be staged with a synthetic spacer (the
    // now-deleted extendPageTail). This pins the property that made it real —
    // the page can actually scroll far enough to push the bar off its perch.
    //
    // Desktop only, and the margin is thin on purpose: Tech Stack's 850 tail is
    // shorter than the 900 viewport, so the release clears by ~51px. Mobile
    // cannot reach it at all yet (710 of tail against an 852 viewport) and
    // becomes observable when MS-10 lands the Footer.
    test.skip(isMobile, 'mobile release needs the Footer (MS-10) to be reachable')

    const { maxScroll, releaseAt } = await page.evaluate(() => {
      const solutions = document.querySelector('section#solutions')!.getBoundingClientRect()
      const bar = document.querySelector('[role="tablist"]')!.getBoundingClientRect()
      return {
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        releaseAt: solutions.bottom + window.scrollY - bar.height,
      }
    })
    expect(maxScroll).toBeGreaterThan(releaseAt)
  })
})
