/**
 * Content Contract — the compile-time agreement between apps/api and apps/web.
 * Types-only on purpose: `import type` erases at build time, so neither app
 * bundles this package's code (see docs/DECISIONS.md D-011 bundling caution).
 * Shapes follow docs/TRD.md §3; content values come from the Extraction.
 */

export type SolutionId = 'data-ai' | 'custom-software' | 'tech-staffing'

/** Rich text with accent-colored spans, extracted from Figma character overrides. */
export interface RichTextSpan {
  text: string
  accent?: boolean
}

/** Bold-vs-regular statement runs (the We Are Section's typography). */
export interface WeightedTextSpan {
  text: string
  bold?: boolean
}

export interface ImageAsset {
  src: string
  alt: string
}

export interface Cta {
  label: string
  href: string
}

export interface Link {
  label: string
  href: string
}

/** Video source switched by content, not code (D-018). */
export interface VideoSource {
  provider: 'youtube' | 'file'
  src: string
}

export interface HealthPayload {
  status: 'ok'
}

export interface ApiError {
  error: string
}

/* --- Section payloads, one per endpoint (D-007) --- */

export interface MegaMenuTile {
  solution: SolutionId
  title: string
  image: ImageAsset
}

export interface NavigationContent {
  links: Link[]
  cta: Cta
  megaMenu: { tiles: MegaMenuTile[] }
}

export interface HeroContent {
  headline: RichTextSpan[]
  subcopy: string
  cta: Cta
  media: { image: ImageAsset }
  video: VideoSource
}

export interface LogoTile {
  name: string
  image: ImageAsset
}

export interface TrustedByContent {
  heading: RichTextSpan[]
  logos: LogoTile[]
  /**
   * The mobile artboard's own wall order — its designed duplicates differ from
   * desktop's (UiPath/Alteryx twice, Google Cloud once; D-017.4), so one list
   * cannot drive both breakpoints.
   */
  logosMobile: LogoTile[]
}

export interface WeAreContent {
  eyebrow: string
  statement: WeightedTextSpan[]
}

export interface SolutionTab {
  id: SolutionId
  label: string
}

export interface ValueCard {
  heading: string
  /** Revealed by the light→dark hover flip (designer note 2:3). */
  body: string
}

export interface ShowcaseSlide {
  image: ImageAsset
}

export interface ShowcaseContent {
  /**
   * Product mark. Optional because only the designed panel ships an exported
   * logo — Authored panels fall back to a typographic wordmark of `name` (D-028.5).
   */
  logo?: ImageAsset
  name: string
  heading: string
  body: string
  cta: Cta
  slides: ShowcaseSlide[]
}

/**
 * One tab's entire body — intro block, value cards, and product showcase all swap
 * together when the tab changes (D-028). `number` is the tab's index as drawn (01/02/03).
 */
export interface SolutionPanel {
  id: SolutionId
  number: string
  heading: string
  body: string
  cta: Cta
  cards: ValueCard[]
  showcase: ShowcaseContent
  /** True for Authored Content we wrote where the design is silent (D-016). */
  authored?: boolean
}

/** The whole tabbed Section in one payload, so switching tabs never waits on a fetch (D-028.4). */
export interface SolutionsContent {
  tabs: SolutionTab[]
  panels: SolutionPanel[]
}

export type MarqueeDirection = 'left' | 'right'

export interface TechStackRow {
  direction: MarqueeDirection
  logos: LogoTile[]
}

export interface TechStackContent {
  eyebrow: string
  heading: string
  body: string
  rows: TechStackRow[]
}

export interface FooterContent {
  copyright: RichTextSpan[]
  legalLinks: Link[]
  socialLinks: Link[]
  showWordmark: boolean
}
