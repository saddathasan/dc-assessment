/**
 * Content barrel: JSON imported (never fs-read — Workers, D-011) and asserted
 * to the Content Contract here, in one place. TS widens JSON literals (e.g.
 * "data-ai" becomes string), so `satisfies` can't prove the union fields; the
 * contract tests pin every exact value at runtime instead.
 */
import type {
  FooterContent,
  HeroContent,
  NavigationContent,
  SolutionsContent,
  TechStackContent,
  TrustedByContent,
  WeAreContent,
} from '@metatech/shared'
import navigationJson from './navigation.json' with { type: 'json' }
import heroJson from './hero.json' with { type: 'json' }
import trustedByJson from './trusted-by.json' with { type: 'json' }
import weAreJson from './we-are.json' with { type: 'json' }
import solutionsJson from './solutions.json' with { type: 'json' }
import techStackJson from './tech-stack.json' with { type: 'json' }
import footerJson from './footer.json' with { type: 'json' }

export const navigation: NavigationContent = navigationJson as NavigationContent
export const hero: HeroContent = heroJson as HeroContent
export const trustedBy: TrustedByContent = trustedByJson
export const weAre: WeAreContent = weAreJson
// Carries the value cards and showcase too: they are per-tab panel content, not
// Sections of their own, so they ship in this one payload (D-028.4).
export const solutions: SolutionsContent = solutionsJson as SolutionsContent
export const techStack: TechStackContent = techStackJson as TechStackContent
export const footer: FooterContent = footerJson
