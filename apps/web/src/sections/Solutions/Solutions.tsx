// Solutions Section (MS-6): the tabbed region. One sticky tab bar switches a
// panel whose body is intro + value cards + showcase (D-028) — Figma nodes
// 1:110..1:131 desktop / 1:363..1:379 mobile for the parts built here. The bar
// pins for the panel's whole height and releases at Tech Stack (note 1:277);
// the sticky scope is the <section> wrapper in LandingPage.
import { useRef, useState } from 'react'
import type { SolutionId, SolutionPanel, SolutionTab, SolutionsContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { SolutionsSkeleton } from './SolutionsSkeleton'

/** The page's Solutions Section: tab bar + the active tab's panel from /api/solutions (D-025 slice). */
export function Solutions() {
  const query = useSectionQuery('solutions')
  return (
    <SectionBoundary query={query} skeleton={<SolutionsSkeleton />}>
      {(solutions) => <SolutionsTabs content={solutions} />}
    </SectionBoundary>
  )
}

const tabId = (id: SolutionId) => `solution-tab-${id}`
const panelId = (id: SolutionId) => `solution-panel-${id}`

/** WAI-ARIA tabs over the panel stack: pointer or keyboard selects, one panel renders at a time. */
function SolutionsTabs({ content }: { content: SolutionsContent }) {
  const [activeId, setActiveId] = useState<SolutionId>(content.tabs[0].id)
  const tabRefs = useRef(new Map<SolutionId, HTMLButtonElement>())
  const active = content.panels.find((panel) => panel.id === activeId) ?? content.panels[0]

  /**
   * Automatic activation (the APG's default): arrows move focus and select in one
   * step. Safe here because a panel is already-fetched content — no request, no
   * spinner, nothing to debounce.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const order = content.tabs.map((tab) => tab.id)
    const from = order.indexOf(activeId)
    const to = {
      ArrowRight: (from + 1) % order.length,
      ArrowLeft: (from - 1 + order.length) % order.length,
      Home: 0,
      End: order.length - 1,
    }[event.key]
    if (to === undefined) return
    event.preventDefault()
    setActiveId(order[to])
    tabRefs.current.get(order[to])?.focus()
  }

  return (
    <>
      {/* Band 1:110/1:363: transparent so the white pill floats free once pinned;
          pointer-events split so the band can overlay the panel scrolling under
          it while only the row itself takes clicks. z-30 stays under the nav's z-40. */}
      <div
        data-testid="solutions-tab-bar"
        className="pointer-events-none sticky top-0 z-30 h-20 lg:h-[100px]"
      >
        <div className="mx-auto h-full max-w-[1440px] pt-5 lg:pt-[30px]">
          {/* Desktop: the white 612x70 r15 pill at x=490 (1:111/1:112 — deliberately
              off the 1440 center); side padding nets to 6px because the 3x200 tab
              row overflows the design's 592 inner frame by 4px per side. Mobile:
              no pill — chips ride the gray directly (1:364) and the row
              overflow-scrolls, scrollbar hidden since the cut third chip is the
              design's own scroll affordance. */}
          <div
            role="tablist"
            aria-label="Solution categories"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="pointer-events-auto flex h-10 items-center gap-[5px] overflow-x-auto px-5 [scrollbar-width:none] lg:ml-[490px] lg:h-[70px] lg:w-[612px] lg:gap-0 lg:overflow-visible lg:rounded-[15px] lg:bg-white lg:px-[6px] [&::-webkit-scrollbar]:hidden"
          >
            {content.tabs.map((tab, index) => (
              <SolutionsTab
                key={tab.id}
                tab={tab}
                index={index}
                selected={tab.id === activeId}
                onSelect={setActiveId}
                register={(node) => {
                  if (node) tabRefs.current.set(tab.id, node)
                  else tabRefs.current.delete(tab.id)
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div id={panelId(active.id)} role="tabpanel" aria-labelledby={tabId(active.id)} tabIndex={-1}>
        <SolutionIntro panel={active} />
      </div>
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

/** One tab control: a button, not a link — it switches content in place rather than navigating. */
function SolutionsTab({
  tab,
  index,
  selected,
  onSelect,
  register,
}: {
  tab: SolutionTab
  index: number
  selected: boolean
  onSelect: (id: SolutionId) => void
  register: (node: HTMLButtonElement | null) => void
}) {
  return (
    <button
      ref={register}
      type="button"
      role="tab"
      id={tabId(tab.id)}
      aria-selected={selected}
      aria-controls={panelId(tab.id)}
      // Roving tabindex: the tablist is one stop, arrows move within it.
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(tab.id)}
      className={`flex h-10 shrink-0 items-center justify-center rounded-[5px] font-sans text-[16px]/[30px] font-bold tracking-[-0.8px] transition-colors lg:h-[60px] lg:w-[200px] lg:rounded-[10px] lg:text-[18px]/[30px] lg:tracking-[-0.9px] ${CHIP_WIDTHS[index] ?? 'px-6'} ${
        selected ? 'bg-ink text-[#06ff70]' : 'bg-white text-ink lg:bg-transparent'
      }`}
    >
      {tab.label}
    </button>
  )
}

/** The panel's intro block (nodes 1:120/1:371): numeral beside (1440) or above (mobile) the copy. */
function SolutionIntro({ panel }: { panel: SolutionPanel }) {
  return (
    // Band 1:120/1:371: mobile centers the 342 column in the 600 frame; the
    // 1440 band bottom-pins its content 50px up (primaryAxis=MAX), so authored
    // copy of a different length grows upward, never reflows below.
    <div className="mx-auto flex h-[600px] max-w-[1440px] items-center justify-center px-5 lg:h-[370px] lg:items-end lg:justify-start lg:pb-[50px]">
      <div className="flex w-full max-w-[342px] flex-col gap-5 lg:w-auto lg:max-w-none lg:flex-row lg:items-start lg:gap-[320px]">
        {/* Desktop numeral: the design flattened it to a 147.2x116.79 vector
            (1:124), which back-solves to Bricolage w800 @~170.7px with the
            -5% tracking (ratios measured from the mobile 120px numeral's
            render paint). Fixed box keeps the copy column at x=487.2; the
            absolute offsets pin Chromium's glyph paint onto the vector box. */}
        <div aria-hidden className="relative hidden h-[116.79px] w-[147.2px] shrink-0 lg:block">
          <span className="absolute -top-[26.2px] -left-[7.8px] font-display text-[170.7px] leading-none font-extrabold tracking-[-8.53px] text-black">
            {panel.number}
          </span>
        </div>
        {/* Mobile numeral is real text (1:374). */}
        <div className="font-display text-[120px]/[120px] font-extrabold tracking-[-6px] text-black lg:hidden">
          {panel.number}
        </div>
        {/* display: contents below lg — the copy joins the mobile column's
            uniform 20px rhythm (1:373) without an extra box. */}
        <div className="contents lg:flex lg:w-[610px] lg:shrink-0 lg:flex-col lg:gap-5">
          <h2 className="font-display text-[24px]/[36px] font-extrabold tracking-[-1.2px] text-ink lg:text-[32px]/[36px] lg:tracking-[-1.6px]">
            {panel.heading}
          </h2>
          <p className="font-sans text-[18px]/[24px] tracking-[-0.54px] text-ink lg:text-[18px]/[27px]">
            {panel.body}
          </p>
          {/* CTA 1:130/1:378: fixed 192x50 r15 at lg, 170x40 r10 below — the
              design centers the label in a fixed box, not padding-hugged. */}
          <a
            href={panel.cta.href}
            className="inline-flex h-10 w-[170px] items-center justify-center rounded-[10px] bg-ink font-sans text-[14px]/[24px] font-bold tracking-[-0.7px] text-[#efefef] lg:h-[50px] lg:w-[192px] lg:rounded-[15px]"
          >
            {panel.cta.label}
          </a>
        </div>
      </div>
    </div>
  )
}
