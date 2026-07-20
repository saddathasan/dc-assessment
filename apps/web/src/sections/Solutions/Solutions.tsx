// Solutions Section (MS-6): sticky tab-bar anchor-nav over the stacked solution
// blocks — block 01 verbatim from Figma nodes 1:110..1:131 / 1:363..1:379,
// blocks 02/03 Authored Content reusing the 01 layout (D-016, D-017.1 heading).
// The bar pins for the whole Solutions→Tech-Stack scope (note 1:277) via the
// sticky-scope wrapper in LandingPage.
import { useEffect, useRef, useState } from 'react'
import type { SolutionBlock, SolutionId, SolutionTab, SolutionsContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { SolutionsSkeleton } from './SolutionsSkeleton'

/** The page's Solutions Section: tab bar + blocks 01–03 from /api/solutions (D-025 slice). */
export function Solutions() {
  const query = useSectionQuery('solutions')
  return (
    <SectionBoundary query={query} skeleton={<SolutionsSkeleton />}>
      {(solutions) => <SolutionsLayout content={solutions} />}
    </SectionBoundary>
  )
}

/** Loaded-state Solutions: scroll-spied tab bar over the block stack, both direct children of the sticky scope. */
function SolutionsLayout({ content }: { content: SolutionsContent }) {
  const [activeId, setActiveId] = useState<SolutionId | undefined>(content.tabs[0]?.id)
  const stackRef = useRef<HTMLElement>(null)
  // A clicked tab pins the highlight: the click's programmatic scroll sweeps
  // the spy line through other blocks (and clamps short of the target while
  // the page tail is short), and those passing entries must not steal it.
  // The pin lifts when the spy reaches the clicked block or the user scrolls.
  const clickedRef = useRef<SolutionId | null>(null)

  useEffect(() => {
    const blocks = stackRef.current?.querySelectorAll('article[id^="solution-"]')
    if (!blocks?.length) return
    // Spy line just under the pinned bar (~15% viewport, percentage-based so no
    // resize re-wiring): the block crossing it owns the highlight. Leaving
    // entries never clear it, so the last passed block stays active in the
    // gaps and beyond the stack (note 1:277).
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.id.replace('solution-', '') as SolutionId
          if (clickedRef.current && clickedRef.current !== id) continue
          clickedRef.current = null
          setActiveId(id)
        }
      },
      { rootMargin: '-15% 0px -84% 0px' },
    )
    for (const block of blocks) spy.observe(block)

    const releasePin = () => {
      clickedRef.current = null
    }
    window.addEventListener('wheel', releasePin, { passive: true })
    window.addEventListener('touchmove', releasePin, { passive: true })
    return () => {
      spy.disconnect()
      window.removeEventListener('wheel', releasePin)
      window.removeEventListener('touchmove', releasePin)
    }
  }, [])

  const select = (id: SolutionId) => {
    clickedRef.current = id
    setActiveId(id)
  }

  return (
    <>
      <SolutionsTabBar tabs={content.tabs} activeId={activeId} onSelect={select} />
      <section id="solutions" ref={stackRef} aria-label="Solutions" className="scroll-mt-20 lg:scroll-mt-[100px]">
        {content.blocks.map((block) => (
          <SolutionBlockView key={block.id} block={block} />
        ))}
      </section>
    </>
  )
}

/**
 * Per-tab fixed widths from the design: desktop uniform 200 (1:114/116/118);
 * mobile 110/160 verbatim (1:365/1:367) and 145 extrapolated for the third —
 * the artboard draws it cut off at 93 with the label truncated to «Tech Staf»,
 * so at rest the full chip clips at the viewport edge exactly like the render.
 * Widths travel by position because that is all the design gives them.
 */
const CHIP_WIDTHS = ['w-[110px]', 'w-[160px]', 'w-[145px]']

/** Sticky tab bar (nodes 1:110/1:363): transparent band so the white pill floats free once pinned. */
function SolutionsTabBar({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: SolutionTab[]
  activeId: SolutionId | undefined
  onSelect: (id: SolutionId) => void
}) {
  return (
    // pointer-events split: the band overlays content under it while pinned, so
    // only the tab row itself may swallow clicks. z-30 stays under the
    // Navigation header's z-40.
    <nav aria-label="Solutions" className="pointer-events-none sticky top-0 z-30 h-20 lg:h-[100px]">
      <div className="mx-auto h-full max-w-[1440px] pt-5 lg:pt-[30px]">
        {/* Desktop: the white 612x70 r15 pill at x=490 (1:111/1:112 — deliberately
            off the 1440 center); side padding nets to 6px because the 3x200 tab
            row overflows the design's 592 inner frame by 4px per side. Mobile:
            no pill — chips ride the gray directly (1:364) and the row
            overflow-scrolls (T6.4), scrollbar hidden since the cut third chip is
            the design's own scroll affordance. */}
        <ul className="pointer-events-auto flex h-10 items-center gap-[5px] overflow-x-auto px-5 [scrollbar-width:none] lg:ml-[490px] lg:h-[70px] lg:w-[612px] lg:gap-0 lg:overflow-visible lg:rounded-[15px] lg:bg-white lg:px-[6px] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab, index) => {
            const active = tab.id === activeId
            return (
              <li key={tab.id} className="shrink-0">
                <a
                  href={`#solution-${tab.id}`}
                  aria-current={active ? 'true' : undefined}
                  // Highlight moves on activation, not on scroll arrival — the
                  // spy re-confirms it while the smooth scroll passes through.
                  onClick={() => onSelect(tab.id)}
                  className={`flex h-10 items-center justify-center rounded-[5px] font-sans text-[16px]/[30px] font-bold tracking-[-0.8px] transition-colors lg:h-[60px] lg:w-[200px] lg:rounded-[10px] lg:text-[18px]/[30px] lg:tracking-[-0.9px] ${CHIP_WIDTHS[index] ?? 'px-6'} ${
                    active
                      ? 'bg-ink text-[#06ff70]'
                      : 'bg-white text-ink lg:bg-transparent'
                  }`}
                >
                  {tab.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** One solution block (01 layout for all three, D-016): numeral beside (1440) or above (mobile) the copy. */
function SolutionBlockView({ block }: { block: SolutionBlock }) {
  return (
    // scroll-mt clears the pinned bar so anchor jumps land with the numeral visible.
    <article id={`solution-${block.id}`} className="scroll-mt-20 lg:scroll-mt-[100px]">
      {/* Band 1:120/1:371: mobile centers the 342 column in the 600 frame; the
          1440 band bottom-pins its content 50px up (primaryAxis=MAX), so
          authored copy of a different length grows upward, never reflows below. */}
      <div className="mx-auto flex h-[600px] max-w-[1440px] items-center justify-center px-5 lg:h-[370px] lg:items-end lg:justify-start lg:pb-[50px]">
        <div className="flex w-full max-w-[342px] flex-col gap-5 lg:w-auto lg:max-w-none lg:flex-row lg:items-start lg:gap-[320px]">
          {/* Desktop numeral: the design flattened it to a 147.2x116.79 vector
              (1:124), which back-solves to Bricolage w800 @~170.7px with the
              -5% tracking (ratios measured from the mobile 120px numeral's
              render paint). Fixed box keeps the copy column at x=487.2; the
              absolute offsets pin Chromium's glyph paint onto the vector box. */}
          <div aria-hidden className="relative hidden h-[116.79px] w-[147.2px] shrink-0 lg:block">
            <span className="absolute -top-[26.2px] -left-[7.8px] font-display text-[170.7px] leading-none font-extrabold tracking-[-8.53px] text-black">
              {block.number}
            </span>
          </div>
          {/* Mobile numeral is real text (1:374). */}
          <div className="font-display text-[120px]/[120px] font-extrabold tracking-[-6px] text-black lg:hidden">
            {block.number}
          </div>
          {/* display: contents below lg — the copy joins the mobile column's
              uniform 20px rhythm (1:373) without an extra box. */}
          <div className="contents lg:flex lg:w-[610px] lg:shrink-0 lg:flex-col lg:gap-5">
            <h2 className="font-display text-[24px]/[36px] font-extrabold tracking-[-1.2px] text-ink lg:text-[32px]/[36px] lg:tracking-[-1.6px]">
              {block.heading}
            </h2>
            <p className="font-sans text-[18px]/[24px] tracking-[-0.54px] text-ink lg:text-[18px]/[27px]">
              {block.body}
            </p>
            {/* CTA 1:130/1:378: fixed 192x50 r15 at lg, 170x40 r10 below — the
                design centers the label in a fixed box, not padding-hugged. */}
            <a
              href={block.cta.href}
              className="inline-flex h-10 w-[170px] items-center justify-center rounded-[10px] bg-ink font-sans text-[14px]/[24px] font-bold tracking-[-0.7px] text-[#efefef] lg:h-[50px] lg:w-[192px] lg:rounded-[15px]"
            >
              {block.cta.label}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
