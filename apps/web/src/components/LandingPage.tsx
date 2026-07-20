import { Footer } from '../sections/Footer/Footer'
import { Hero } from '../sections/Hero/Hero'
import { Navigation } from '../sections/Navigation/Navigation'
import { Solutions } from '../sections/Solutions/Solutions'
import { TechStack } from '../sections/TechStack/TechStack'
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
        {/* NOT a stray spacer — this reproduces a real gap the mobile artboard
            draws. We Are (node 1:358) ends at y=1754.76 and the Solutions gray
            (node 1:280) starts at y=1777.00, so 22.24px of the page's white shows
            between the two bands (built as 22px per the slicer's whole-pixel
            rule). It reads as invisible because We Are is white too; removing it
            pulls every mobile Section below up 22px and diverges from the render.
            Desktop is flush. Verified against file.json + the design render. */}
        <div aria-hidden className="h-[22px] bg-white lg:hidden" />
        {/* The tabbed Solutions Section (D-028) on its gray canvas (nodes
            1:105/1:280). This element is also the sticky scope: the tab bar
            pins for the panel's whole height and releases where the Section
            ends — Tech Stack (note 1:277), whose exact seam MS-9 verifies. */}
        <section id="solutions" aria-label="Solutions" className="bg-surface-2">
          <Solutions />
        </section>
        {/* The desktop artboard separates the showcase from Tech Stack by
            exactly 1px — frame 1:143 carries itemSpacing=1 over a white fill,
            so the gap is invisible but real. Built rather than dropped so every
            y below stays on the artboard (Tech Stack 3530, Footer 4380); the
            mobile stack has no such spacing and is flush. */}
        <div aria-hidden className="hidden h-px bg-white lg:block" />
        {/* Tech Stack opens exactly where Solutions closes (y=3530 / 3780), and
            that seam is the sticky tab bar's release: the bar is bound by the
            Section above, so this sibling landing here is what ends the pin
            (note 1:277, D-028.6). */}
        <TechStack />
      </main>
      {/* Flush under Tech Stack at both widths (3530 + 850 = 4380 desktop,
          3780 + 710 = 4490 mobile), so unlike the seam above there is no
          spacer here. Outside <main> on purpose: a <footer> nested in main is
          a section footer, not the page's, and silently loses contentinfo. */}
      <Footer />
    </div>
  )
}
