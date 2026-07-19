// Trusted By Section (MS-4): the logo wall closing the deep-green intro band,
// verbatim from the Extraction — desktop nodes 1:79..1:100 (4x2 wall beside the
// heading), mobile 1:334..1:357 (2x4 wall below it, with its own designed
// duplicate tiles — D-017.4).
import type { LogoTile, TrustedByContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { TrustedBySkeleton } from './TrustedBySkeleton'

/** The page's Trusted By Section: data-fed accent heading + per-breakpoint logo walls (D-025 slice). */
export function TrustedBy() {
  const query = useSectionQuery('trusted-by')
  return (
    <section className="bg-deep text-white">
      <SectionBoundary query={query} skeleton={<TrustedBySkeleton />}>
        {(trustedBy) => <TrustedByLayout content={trustedBy} />}
      </SectionBoundary>
    </section>
  )
}

/**
 * Display box per logo bitmap, from the Extraction. Desktop: fixed px rect
 * widths inside the capped band (nodes 1:85..1:100; heights follow the bitmaps'
 * intrinsic ratios, which match the design's targetAspectRatio). Mobile:
 * percentages of the tile's 173x68 CONTENT box (175x70 minus the 1px borders —
 * that's what % widths resolve against) so the wall scales fluidly below lg and
 * lands on the design's exact px at 393. UiPath keeps the design's own
 * off-ratio 96x36 STRETCH (node 1:347).
 */
const LOGO_SIZE: Record<string, { desktop: string; mobile: string }> = {
  Databricks: { desktop: 'w-[172px]', mobile: 'w-[83.237%]' },
  'Google Cloud': { desktop: 'w-[172px]', mobile: 'w-[77.4566%]' },
  UiPath: { desktop: 'w-[112px]', mobile: 'h-[52.9412%] w-[55.4913%]' },
  Alteryx: { desktop: 'w-[132px]', mobile: 'w-[57.2254%]' },
  Figma: { desktop: 'w-[132px]', mobile: 'w-[58.3815%]' },
  'Amazon Web Services': { desktop: 'w-[80px]', mobile: 'w-[28.9017%]' },
}

/** The 925x200 desktop wall (node 1:82): two flex rows of 232x100 bordered tiles. */
function DesktopWall({ logos }: { logos: LogoTile[] }) {
  return (
    <div data-testid="trusted-by-wall-desktop" className="hidden w-[925px] lg:block">
      {[logos.slice(0, 4), logos.slice(4)].map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((logo, index) => (
            // Columns overlap by -1px (row itemSpacing=-1) so adjacent inside
            // borders share one line, exactly as the design composites them.
            <div
              key={index}
              className={`flex h-[100px] w-[232px] shrink-0 items-center justify-center border border-[rgba(255,255,255,0.25)] ${
                index > 0 ? '-ml-px' : ''
              }`}
            >
              {/* An unmapped name renders at intrinsic size — loud in the Fidelity Gate. */}
              <img
                src={logo.image.src}
                alt={logo.image.alt}
                className={LOGO_SIZE[logo.name]?.desktop ?? ''}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/** The mobile wall (node 1:337): a 2-col grid of aspect-scaled bordered tiles, gap 0. */
function MobileWall({ logos }: { logos: LogoTile[] }) {
  return (
    <div data-testid="trusted-by-wall-mobile" className="mt-[30px] grid grid-cols-2 lg:hidden">
      {logos.map((logo, index) => (
        <div
          key={index}
          className="flex aspect-[175/70] items-center justify-center border border-[rgba(255,255,255,0.25)]"
        >
          <img
            src={logo.image.src}
            alt={logo.image.alt}
            className={LOGO_SIZE[logo.name]?.mobile ?? ''}
          />
        </div>
      ))}
    </div>
  )
}

/** Loaded-state Trusted By: accent heading beside (1440) or above (mobile) its wall. */
function TrustedByLayout({ content }: { content: TrustedByContent }) {
  return (
    // The band caps at the design's 1440 and centers on wider viewports — the
    // page convention. At lg the content row pins to the band bottom (node 1:79
    // primaryAxis=MAX: 100px above the 200px row inside the 320 band). Below lg
    // the design's 21.5px side margins and 80px headroom hold while the wall
    // scales fluidly (node 1:334: 350 wide at exactly 393 — never a hard cap).
    <div className="mx-auto px-[21.5px] pt-20 pb-5 lg:flex lg:h-[320px] lg:max-w-[1440px] lg:flex-col lg:justify-end lg:p-5">
      <div className="lg:flex lg:items-start lg:justify-between">
        {/* Every character is override-styled in the design: Bricolage 600 18/24
            on mobile (1:336) but Manrope 600 18/20 on desktop (1:81) — hence the
            font swap at lg. Slash-form sizes so the paired line-heights win. */}
        <h2 className="w-[218px] font-display text-[18px]/[24px] font-semibold tracking-[-0.9px] lg:w-[192px] lg:font-sans lg:text-[18px]/[20px]">
          {content.heading.map((span, index) => (
            // Spans have no identity beyond position, so the index is the honest key.
            <span key={index} className={span.accent ? 'text-accent' : undefined}>
              {span.text}
            </span>
          ))}
        </h2>
        <MobileWall logos={content.logosMobile} />
        <DesktopWall logos={content.logos} />
      </div>
    </div>
  )
}
