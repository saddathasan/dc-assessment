import { Hero } from '../sections/Hero/Hero'
import { Navigation } from '../sections/Navigation/Navigation'

/* Page composition: Sections stack in design order (MS-2+ adds the rest). */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-deep">
      <Navigation />
      <main>
        <Hero />
      </main>
    </div>
  )
}
