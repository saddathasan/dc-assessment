// Tech Stack Section (MS-9): the white band that closes the Solutions Section's
// sticky scope and runs to the Footer — desktop node 1:166 (1440x850 at y=3530),
// mobile 1:410 + 2:37 (393x710 at y=3780). Heading block over three scrolling
// logo rows (D-029).
import type { TechStackContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { TechStackMarquee } from './TechStackMarquee'
import { TechStackSkeleton } from './TechStackSkeleton'

/** The page's Tech Stack Section: heading block + logo marquee from /api/tech-stack (D-025 slice). */
export function TechStack() {
  const query = useSectionQuery('tech-stack')
  return (
    <section id="tech-stack" aria-label="Technology stack" className="bg-white text-ink">
      <SectionBoundary query={query} skeleton={<TechStackSkeleton />}>
        {(techStack) => <TechStackLayout content={techStack} />}
      </SectionBoundary>
    </section>
  )
}

/** Loaded-state Tech Stack: copy block centred in the desktop band, marquee bleeding full-width. */
function TechStackLayout({ content }: { content: TechStackContent }) {
  return (
    // At lg the 850 band centres its 767 of content, leaving the design's 41.5
    // above and below (node 1:166 primaryAxis=CENTER). Mobile stacks to exactly
    // 350 + 360 = 710, so it needs no such slack.
    <div className="flex flex-col justify-center lg:h-[850px]">
      {/* Copy caps at the design's 1440 and centres on wider viewports — the
          page convention — while the marquee below bleeds the full width, as
          the rows do in the design (layoutSizingHorizontal FILL). The block is
          bottom-pinned inside its own frame (primaryAxis=MAX): 50px under the
          copy leaves 100px of headroom at lg (node 1:167) and 88px on mobile
          (node 1:410). */}
      {/* pr-[26px] below lg is not a stray value: the mobile copy child is 347
          wide inside a 353 content box (node 1:411 does not stretch), and those
          6px are load-bearing — at 353 Chromium pulls "and" up onto line 1 and
          the body stops matching the render's four lines. Encoded as padding
          rather than a fixed 347 so the column still fills tablet widths. */}
      <div className="mx-auto flex h-[350px] w-full max-w-[1440px] flex-col justify-end pb-[50px] pl-5 pr-[26px] lg:h-[297px] lg:pr-5">
        {/* items-start at lg: the eyebrow is a 24-tall label beside the 147-tall
            copy column, not a stretched sibling of it. */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-0">
          {/* Eyebrow swaps family per breakpoint like every other Section's:
              Bricolage 600 18/24 on mobile (1:413), Manrope 600 18/24 at lg
              (1:169). Fixed at 115 wide at lg so the copy column lands on the
              design's x=493 (20 + 115 + 358) whatever Chromium measures. */}
          <p className="font-display text-[18px]/[24px] font-semibold tracking-[-0.9px] lg:w-[115px] lg:shrink-0 lg:font-sans lg:whitespace-nowrap">
            {content.eyebrow}
          </p>
          {/* The 358px gutter as a shrinkable spacer (see WeAre for the rationale):
              rigid, it pushed the 681px copy column off the right edge between
              1024 and 1440. Basis 358, shrink to 0 — at 1440 it holds 358 so the
              copy stays at x=493; below, it collapses instead of clipping the body. */}
          <div aria-hidden className="hidden lg:block lg:w-[358px] lg:shrink" />
          <div className="flex flex-col gap-5 lg:w-[681px] lg:shrink-0 lg:gap-[30px]">
            {/* 28/34 over two lines on mobile (1:414), 32/36 on one at lg (1:171). */}
            <h2 className="font-display text-[28px]/[34px] font-extrabold tracking-[-1.4px] lg:text-[32px]/[36px] lg:tracking-[-1.6px]">
              {content.heading}
            </h2>
            {/* Manrope 14/20 over four lines on mobile (1:415), 18/27 over three at lg (1:172). */}
            <p className="text-[14px]/[20px] tracking-[-0.42px] lg:text-[18px]/[27px] lg:tracking-[-0.54px]">
              {content.body}
            </p>
          </div>
        </div>
      </div>
      <TechStackMarquee rows={content.rows} />
    </div>
  )
}
