import { Hero } from '../sections/Hero/Hero'

/* Page composition: Sections stack in design order (MS-2+ adds the rest). */
export function LandingPage() {
  return (
    <main className="min-h-screen bg-deep">
      <Hero />
    </main>
  )
}
