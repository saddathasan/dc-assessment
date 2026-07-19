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
    <section className="bg-white text-ink">
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[400px]">
        {/* Eyebrow swaps family per breakpoint like the Trusted By heading:
            Bricolage 600 18/24 on mobile (1:360), Manrope 600 18/30 at lg
            (1:103). Slash-form sizes so the paired line-heights win. */}
        <h2 className="font-display text-[18px]/[24px] font-semibold tracking-[-0.9px] lg:shrink-0 lg:font-sans lg:text-[18px]/[30px] lg:whitespace-nowrap">
          {content.eyebrow}
        </h2>
        {/* One text node in the design, weight-split by characterStyleOverrides
            (w800 run then w400, nodes 1:104/1:361) — here data-driven spans on a
            regular-weight base. 680px fixed at lg (layoutSizingHorizontal FIXED),
            fluid below. */}
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
