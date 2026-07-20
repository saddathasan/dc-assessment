// Data contract for the Hero Section (MS-3): payload-driven accent headline, copy,
// CTA, and the play-button → video-modal wiring (note 1:510). Geometry and color
// fidelity live in tests/fidelity/hero.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HeroContent } from '@metatech/shared'
import { Hero } from './Hero'

/** Mirrors apps/api/src/data/hero.json — the real payload shape and values. */
const heroContent: HeroContent = {
  headline: [
    { text: 'Building ' },
    { text: 'Intelligence to Power', accent: true },
    { text: ' Scalable Innovation' },
  ],
  subcopy:
    'MetaTech integrates custom software engineering, advanced data and AI systems, and strategic staff augmentation to power scalable, high impact digital transformation.',
  cta: { label: 'Book for Demo', href: '#contact' },
  media: {
    image: { src: '/images/hero-photo.png', alt: 'MetaTech team working together in the office' },
  },
  video: { provider: 'youtube', src: 'https://www.youtube.com/embed/aqz-KE-bpKQ' },
}

function renderHero() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(heroContent), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  )
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  return render(
    <QueryClientProvider client={client}>
      <Hero />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.style.overflow = ''
})

describe('Hero', () => {
  it('renders the headline from /api/hero with its accent spans styled', async () => {
    renderHero()

    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Building Intelligence to Power Scalable Innovation')
    // The green run is data (RichTextSpan.accent), not markup baked into the component.
    expect(screen.getByText('Intelligence to Power')).toHaveClass('text-accent')
    expect(screen.getByText(/^Building/)).not.toHaveClass('text-accent')
  })

  it('renders the sub-copy, CTA, and photo from the payload', async () => {
    renderHero()

    expect(await screen.findByText(heroContent.subcopy)).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: 'Book for Demo' })
    expect(cta).toHaveAttribute('href', '#contact')
    expect(screen.getByAltText(heroContent.media.image.alt)).toBeInTheDocument()
  })

  it('offers a play button per viewport layout, wired to the payload video (note 1:510)', async () => {
    renderHero()

    // Two placements — in the notch (desktop) and above the photo (mobile); CSS
    // shows exactly one at a time, which the fidelity spec verifies per width.
    const buttons = await screen.findAllByRole('button', { name: /play the metatech video/i })
    expect(buttons).toHaveLength(2)

    await userEvent.click(buttons[0])
    const iframe = screen.getByTitle('MetaTech video')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
