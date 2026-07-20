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
        {/* The tabbed Solutions Section (D-028) on its gray canvas (nodes
            1:105/1:280). This element is also the sticky scope: the tab bar
            pins for the panel's whole height and releases where the Section
            ends — Tech Stack (note 1:277), whose exact seam MS-9 verifies. */}
        <section id="solutions" aria-label="Solutions" className="bg-surface-2">
          <Solutions />
        </section>
      </main>
    </div>
  )
}
