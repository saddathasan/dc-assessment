/**
 * Fidelity-harness manifest: where each Section lives in the Figma render Baselines
 * and on the rendered page. Single source of truth for the baseline slicer and the
 * fidelity specs (D-021). Grows one entry set per Section as slices land (D-025).
 */

/** Rectangle in logical px; renders and screenshots are both @2x, scaling is the consumer's job. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** One Baseline: a crop of a committed Figma render paired with the page region it must match. */
export interface FidelityTarget {
  /** Baseline filename stem under tests/fidelity/baselines/. */
  id: string
  /** Source render inside design/figma/renders/ (all exported @2x, D-001). */
  source: string
  /** Crop within the source frame, logical px. */
  crop: Box
  /** Page-coordinate clip for the live screenshot, logical px. */
  clip: Box
  /**
   * Hex color composited under the crop. Standalone component frames (e.g. the
   * mega-menu) render with transparent surroundings; on the page those pixels are
   * this background, so the Baseline must be flattened onto it before diffing.
   */
  flattenOnto?: string
  /**
   * The design frame carries a DUOTONE noise effect, so its "flat" areas are a
   * random per-pixel field (sampled: green swinging 22–50 R, and brighter areas
   * further). Reproducing noise cannot reduce a per-pixel diff — two random
   * fields disagree everywhere — so these Baselines are compared on an 8x8
   * average, which cancels the noise while still catching layout, colour, and
   * content errors. Naive diff of this band reads ~13%; averaged it reads ~2%.
   */
  noiseTextured?: boolean
}

/**
 * Every Baseline the Fidelity Gate diffs, keyed by Section and viewport.
 * Crop geometry comes from design/figma/tree-*.txt node boxes, never estimated.
 */
export const targets: FidelityTarget[] = [
  // Navigation — desktop band: 20px frame padding + the 1400x80 floating bar (tree-desktop 'Frame 52').
  {
    id: 'navigation-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 0, width: 1440, height: 120 },
    clip: { x: 0, y: 0, width: 1440, height: 120 },
  },
  // Navigation — open mega-menu: the full 1400x444 panel frame (1:459), which on the
  // page sits at the bar's position (20,20) over the deep-green hero background.
  {
    id: 'navigation-menu-open-desktop',
    source: '1-459.png',
    crop: { x: 0, y: 0, width: 1400, height: 444 },
    clip: { x: 20, y: 20, width: 1400, height: 444 },
    flattenOnto: '#032019',
  },
  // Navigation — mobile band: the 393x76 Header (excluding the 57px iOS status bar
  // above it, which is device chrome we do not build — see EXTRACTION.md Quirks).
  {
    id: 'navigation-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 59, width: 393, height: 76 },
    clip: { x: 0, y: 0, width: 393, height: 76 },
  },
  // Hero — desktop band under the nav: 400 copy row + 80 gap + 1400x571 media
  // (tree-desktop 'Frame 289370', y=120..1171).
  {
    id: 'hero-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 120, width: 1440, height: 1051 },
    clip: { x: 0, y: 120, width: 1440, height: 1051 },
  },
  // Hero — mobile band: 336x512 copy/play column + 20 gap + 380x200 photo card
  // ('Frame 289414', abs y=194.76 in the render — above it sit the excluded status
  // bar AND the foreign gamification banner, do-not-build artifacts per
  // EXTRACTION.md Quirks; rounded to 195 because the slicer crops whole pixels).
  // On the page the band sits 62px below the header — the design's rendered gap
  // (194.76 − 133), preserved even though the foreign banner that overlapped it
  // is excluded (D-026); the crop skips that region because the banner pollutes
  // the render there.
  {
    id: 'hero-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 195, width: 393, height: 732 },
    clip: { x: 0, y: 138, width: 393, height: 732 },
  },
  // Trusted By — desktop band: heading + 4x2 logo wall bottom-pinned in the
  // 1440x320 frame (node 1:79, abs y=1171 — flush under the hero band, flush
  // over We-Are at 1491).
  {
    id: 'trusted-by-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 1171, width: 1440, height: 320 },
    clip: { x: 0, y: 1171, width: 1440, height: 320 },
  },
  // Trusted By — mobile band: 80px headroom + heading + 2x4 wall (node 1:334,
  // abs y=926.76 → crop 927 by the slicer's whole-pixel rule); page clip
  // y = render − 57 (the excluded status bar), contiguous with hero-mobile's
  // clip end 138+732=870.
  {
    id: 'trusted-by-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 927, width: 393, height: 458 },
    clip: { x: 0, y: 870, width: 393, height: 458 },
  },
  // We Are — desktop band: eyebrow + statement row bottom-pinned in the white
  // 1440x345 frame (node 1:101, abs y=1491 — flush under Trusted By's 1171+320).
  {
    id: 'we-are-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 1491, width: 1440, height: 345 },
    clip: { x: 0, y: 1491, width: 1440, height: 345 },
  },
  // We Are — mobile band: 87px headroom + stacked eyebrow/statement (node 1:358,
  // abs y=1384.76 → crop 1385, contiguous with trusted-by-mobile's 927+458);
  // page clip y = render − 57 (the excluded status bar), contiguous with
  // trusted-by-mobile's clip end 870+458=1328.
  {
    id: 'we-are-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 1385, width: 393, height: 370 },
    clip: { x: 0, y: 1328, width: 393, height: 370 },
  },
  // Solutions — desktop: the tab bar (100) + the active panel's intro block
  // (370) on the gray canvas (node 1:105, abs y=1836 — flush under We Are's
  // 1491+345). One panel renders at a time (D-028), so page y ≡ artboard y and
  // clip ≡ crop. The panel continues past this crop into the value-card row at
  // 2306 (MS-7) and the showcase at 2829 (MS-8), each getting its own Baseline.
  {
    id: 'solutions-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 1836, width: 1440, height: 470 },
    clip: { x: 0, y: 1836, width: 1440, height: 470 },
  },
  // Solutions — mobile: tab row (80) + intro block (600), node 1:362 at
  // y=1777 — the artboard leaves a 22.24px white strip under We Are's
  // 1384.76+370 end (render-verified white→gray at exactly 1777), built as
  // 22px; page clip y = render − 57 = we-are-mobile's clip end 1698 + the strip.
  {
    id: 'solutions-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 1777, width: 393, height: 680 },
    clip: { x: 0, y: 1720, width: 393, height: 680 },
  },
  // Solutions value cards — desktop: the row inside the tab panel (node 1:132,
  // y=2306, flush under the intro block's 1936+370). Light/resting state; the
  // hover flip has its own frame (2:36) and no artboard Baseline, so the numeric
  // layer carries it.
  {
    id: 'solution-cards-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 2306, width: 1440, height: 450 },
    clip: { x: 0, y: 2306, width: 1440, height: 450 },
  },
  // Solutions value cards — mobile: block 1:380 at y=2457 (flush under the intro
  // block's 1857+600). The artboard draws ONE already-dark card; ours is the
  // first slide of the D-015 carousel, so the Baseline diffs the resting frame.
  // Page clip y = render − 57 (the excluded status bar).
  {
    id: 'solution-cards-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 2457, width: 393, height: 394 },
    clip: { x: 0, y: 2400, width: 393, height: 394 },
  },
  // Solutions showcase — desktop: the green band closing the tab body (node
  // 1:146, y=2829 after the 73px gray gap under the card row), 1440x700.
  {
    id: 'solution-showcase-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 2829, width: 1440, height: 700 },
    clip: { x: 0, y: 2829, width: 1440, height: 700 },
    noiseTextured: true,
  },
  // Solutions showcase — mobile: node 1:387 at y=2880 (29px gray gap under the
  // card block), 393x900; page clip y = render − 57 (the excluded status bar).
  {
    id: 'solution-showcase-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 2880, width: 393, height: 900 },
    clip: { x: 0, y: 2823, width: 393, height: 900 },
    noiseTextured: true,
  },
  // Tech Stack — desktop: the white band closing the Solutions sticky scope
  // (node 1:166, y=3530..4380 — one artboard px under the showcase's 3529 end,
  // frame 1:143's itemSpacing, reproduced on the page). Copy block over the
  // three marquee rows, which the gate sees static at their drawn phases
  // because reduced motion is forced (D-029.3).
  {
    id: 'tech-stack-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 3530, width: 1440, height: 850 },
    clip: { x: 0, y: 3530, width: 1440, height: 850 },
  },
  // Tech Stack — mobile: heading block 1:410 (350) + marquee 2:37 (360, the
  // rows packed top over 40px of slack) = 710 at y=3780, flush under the
  // showcase's 2880+900; page clip y = render − 57 (the excluded status bar),
  // contiguous with solution-showcase-mobile's clip end 2823+900=3723.
  {
    id: 'tech-stack-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 3780, width: 393, height: 710 },
    clip: { x: 0, y: 3723, width: 393, height: 710 },
  },
  // Footer — desktop: the dark band closing the page (node 1:248, y=4380..4738,
  // flush under Tech Stack's 3530+850 — no itemSpacing here, unlike the seam
  // above it). The link row over the METATECH mark and its scrim (1:264), which
  // has no mobile counterpart.
  {
    id: 'footer-desktop',
    source: '1-34.png',
    crop: { x: 0, y: 4380, width: 1440, height: 358 },
    clip: { x: 0, y: 4380, width: 1440, height: 358 },
  },
  // Footer — mobile: node 1:441 at y=4490, flush under Tech Stack's 3780+710,
  // running to the artboard's 4972 end; page clip y = render − 57 (the excluded
  // status bar), contiguous with tech-stack-mobile's clip end 3723+710=4433.
  // This is the last band: its clip end 4433+482=4915 is the whole page height.
  {
    id: 'footer-mobile',
    source: '1-279.png',
    crop: { x: 0, y: 4490, width: 393, height: 482 },
    clip: { x: 0, y: 4433, width: 393, height: 482 },
  },
]
