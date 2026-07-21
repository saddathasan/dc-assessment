// We Are Section (MS-5): the white statement band flush under Trusted By,
// verbatim from the Extraction — desktop node 1:101 (eyebrow beside the 680px
// statement, bottom-pinned in the 1440x345 band), mobile 1:358 (stacked with a
// 20px gap inside the 393x370 band).
import type { WeAreContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { WeAreSkeleton } from './WeAreSkeleton'

/** The page's We Are Section: eyebrow + weighted-run statement from /api/we-are (D-025 slice). */
export function WeAre() {
  const query = useSectionQuery('we-are')
  return (
    <section aria-label="Who we are" className="bg-white text-ink">
      <SectionBoundary query={query} skeleton={<WeAreSkeleton />}>
        {(weAre) => <WeAreLayout content={weAre} />}
      </SectionBoundary>
    </section>
  )
}

/** Loaded-state We Are: eyebrow beside (1440) or above (mobile) the statement. */
function WeAreLayout({ content }: { content: WeAreContent }) {
  return (
    // The band caps at the design's 1440 and centers on wider viewports — the
    // page convention. At lg the content row pins to the band bottom (node 1:101
    // primaryAxis=MAX: 100px above the 195px row inside the 345 band, 50px
    // below). Below lg the band hugs its content: 87px headroom (the mobile
    // frame's 370 − 50 bottom pad − 233 content, node 1:358) over 20px margins.
    <div className="mx-auto px-5 pt-[87px] pb-[50px] lg:flex lg:h-[345px] lg:max-w-[1440px] lg:flex-col lg:justify-end lg:pt-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-0">
        {/* Eyebrow swaps family per breakpoint like the Trusted By heading:
            Bricolage 600 18/24 on mobile (1:360), Manrope 600 18/30 at lg
            (1:103). Slash-form sizes so the paired line-heights win. The design
            hugs it at 76 wide; Chromium measures the glyphs ~1.7px narrower, so
            the box is fixed at 76 to keep the statement's 496 offset exact. */}
        <h2 className="font-display text-[18px]/[24px] font-semibold tracking-[-0.9px] lg:w-[76px] lg:shrink-0 lg:font-sans lg:text-[18px]/[30px] lg:whitespace-nowrap">
          {content.eyebrow}
        </h2>
        {/* The 400px gutter as a shrinkable spacer, not a fixed gap: the artboards
            cover only 1440 (where it holds 400, so the statement stays at x=496)
            and 393; between 1024 and 1440 a rigid gap pushed the 680px statement
            off the right edge under overflow-x-clip (clipped body copy at ~1196
            and below). Basis 400, shrink to 0, so the gutter absorbs the shortfall
            instead of the copy. Same fr-spirit fix the Footer uses (D-032 sibling). */}
        <div aria-hidden className="hidden lg:block lg:w-[400px] lg:shrink" />
        {/* One text node in the design, weight-split by characterStyleOverrides
            (w800 run then w400, nodes 1:104/1:361) — here data-driven spans on a
            regular-weight base. 680px fixed at lg (layoutSizingHorizontal FIXED),
            fluid below. Chromium wraps desktop line 1 one word past the Figma
            render's break — a cross-engine advance divergence with <2px of
            slack, accepted and pinned per D-027. */}
        <p className="font-display text-[21px]/[27px] font-normal tracking-[-0.63px] text-black lg:w-[680px] lg:shrink-0 lg:text-[32px]/[39px] lg:tracking-[-0.96px]">
          {content.statement.map((span, index) => (
            // Spans have no identity beyond position, so the index is the honest key.
            <span key={index} className={span.bold ? 'font-extrabold' : undefined}>
              {span.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
