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
]
