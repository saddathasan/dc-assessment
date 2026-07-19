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
  ShowcaseContent,
  SolutionsContent,
  TechStackContent,
  TrustedByContent,
  ValueCardsContent,
  WeAreContent,
} from '@metatech/shared'
import navigationJson from './navigation.json' with { type: 'json' }
import heroJson from './hero.json' with { type: 'json' }
import trustedByJson from './trusted-by.json' with { type: 'json' }
import weAreJson from './we-are.json' with { type: 'json' }
import solutionsJson from './solutions.json' with { type: 'json' }
import valueCardsJson from './value-cards.json' with { type: 'json' }
import showcaseJson from './showcase.json' with { type: 'json' }
import techStackJson from './tech-stack.json' with { type: 'json' }
import footerJson from './footer.json' with { type: 'json' }

export const navigation: NavigationContent = navigationJson as NavigationContent
export const hero: HeroContent = heroJson as HeroContent
export const trustedBy: TrustedByContent = trustedByJson
export const weAre: WeAreContent = weAreJson
export const solutions: SolutionsContent = solutionsJson as SolutionsContent
export const valueCards: ValueCardsContent = valueCardsJson
export const showcase: ShowcaseContent = showcaseJson
export const techStack: TechStackContent = techStackJson as TechStackContent
export const footer: FooterContent = footerJson
