/**
 * Content Contract — the compile-time agreement between apps/api and apps/web.
 * Types-only on purpose: `import type` erases at build time, so neither app
 * bundles this package's code (see docs/DECISIONS.md D-011 bundling caution).
 * Section payloads are stubs here; MS-1 completes them (docs/TRD.md §3).
 */

export type SolutionId = 'data-ai' | 'custom-software' | 'tech-staffing'

/** Rich text with accent-colored spans, extracted from Figma character overrides. */
export interface RichTextSpan {
  text: string
  accent?: boolean
}

export interface HealthPayload {
  status: 'ok'
}

export interface ApiError {
  error: string
}

/* --- Section payload stubs (completed in MS-1) --- */

export interface NavigationContent {
  _stub: true
}
export interface HeroContent {
  _stub: true
}
export interface TrustedByContent {
  _stub: true
}
export interface WeAreContent {
  _stub: true
}
export interface SolutionsContent {
  _stub: true
}
export interface ValueCardsContent {
  _stub: true
}
export interface ShowcaseContent {
  _stub: true
}
export interface TechStackContent {
  _stub: true
}
export interface FooterContent {
  _stub: true
}
