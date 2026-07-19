import { Hero } from '../sections/Hero/Hero'
import { Navigation } from '../sections/Navigation/Navigation'
import { TrustedBy } from '../sections/TrustedBy/TrustedBy'

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
      </main>
    </div>
  )
}
