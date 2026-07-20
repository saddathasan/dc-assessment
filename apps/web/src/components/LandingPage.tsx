import { Hero } from '../sections/Hero/Hero'
import { Navigation } from '../sections/Navigation/Navigation'
import { Solutions } from '../sections/Solutions/Solutions'
import { TrustedBy } from '../sections/TrustedBy/TrustedBy'
import { WeAre } from '../sections/WeAre/WeAre'

/* Page composition: Sections stack in design order (MS-2+ adds the rest). */
export function LandingPage() {
  return (
    // overflow-x-clip: the design bleeds content off both edges (Tech Stack rows,
    // footer wordmark) — clip, not hidden, so no scroll container breaks sticky.
    <div className="min-h-screen overflow-x-clip bg-deep">
      <Navigation />
      <main>
        <Hero />
        <TrustedBy />
        <WeAre />
        {/* The mobile artboard keeps a 22.24px white strip between We Are
            (1:358 ends 1754.76) and the Solutions gray (1:280 starts 1777) —
            built as 22px per the slicer's whole-pixel rule; desktop is flush. */}
        <div aria-hidden className="h-[22px] bg-white lg:hidden" />
        {/* Sticky scope + shared gray canvas (note 1:277, nodes 1:105/1:280):
            the Solutions tab bar pins from here until past Tech Stack. MS-7/8/9
            Sections land inside this wrapper; the release point is provisional
            until MS-9 closes the coupling (T9.3). */}
        <div data-testid="solutions-sticky-scope" className="bg-surface-2">
          <Solutions />
        </div>
      </main>
    </div>
  )
}
