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
]
