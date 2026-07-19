// Typed fetch layer between the SPA and the content API: maps each Section's
// endpoint slug to its Contract payload so callers get full inference.
import type {
  FooterContent,
  HeroContent,
  NavigationContent,
  ShowcaseContent,
  SolutionsContent,
  TechStackContent,
  TrustedByContent,
  ValueCardsContent,
  WeAreContent,
} from '@metatech/shared'

/** Endpoint slug → payload type, one per Section (D-007). */
export interface SectionPayloads {
  navigation: NavigationContent
  hero: HeroContent
  'trusted-by': TrustedByContent
  'we-are': WeAreContent
  solutions: SolutionsContent
  'value-cards': ValueCardsContent
  showcase: ShowcaseContent
  'tech-stack': TechStackContent
  footer: FooterContent
}

export type SectionKey = keyof SectionPayloads

/** Keeps only the demo affordances (?delay, ?fail) from the page URL (D-012). */
export function demoQueryString(search: string): string {
  const params = new URLSearchParams(search)
  const demo = new URLSearchParams()
  for (const key of ['delay', 'fail']) {
    const value = params.get(key)
    if (value !== null) demo.set(key, value)
  }
  const qs = demo.toString()
  return qs ? `?${qs}` : ''
}

/** Fetches one Section's payload, carrying the page's demo params through; throws on non-2xx so Query can retry. */
export async function fetchSection<K extends SectionKey>(section: K): Promise<SectionPayloads[K]> {
  const res = await fetch(`/api/${section}${demoQueryString(window.location.search)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`GET /api/${section} responded ${res.status}`)
  }
  return res.json() as Promise<SectionPayloads[K]>
}
