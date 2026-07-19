// Data contract for the Trusted By Section (MS-4): payload-driven accent heading
// plus the two per-breakpoint logo walls, each in its own designed order
// (D-017.4). Geometry and color fidelity live in tests/fidelity/trusted-by.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LogoTile, TrustedByContent } from '@metatech/shared'
import { TrustedBy } from './TrustedBy'

const tile = (name: string, file: string): LogoTile => ({
  name,
  image: { src: `/images/logos/${file}.png`, alt: name },
})

/** Mirrors apps/api/src/data/trusted-by.json — the real payload shape and values. */
const trustedByContent: TrustedByContent = {
  heading: [
    { text: 'Trusted by', accent: true },
    { text: ' product teams and enterprise ' },
    { text: 'innovators.', accent: true },
  ],
  logos: [
    tile('Databricks', 'databricks'),
    tile('Google Cloud', 'google-cloud'),
    tile('UiPath', 'uipath'),
    tile('Alteryx', 'alteryx'),
    tile('Alteryx', 'alteryx'),
    tile('Figma', 'figma'),
    tile('Amazon Web Services', 'aws'),
    tile('Google Cloud', 'google-cloud'),
  ],
  logosMobile: [
    tile('Databricks', 'databricks'),
    tile('Google Cloud', 'google-cloud'),
    tile('Alteryx', 'alteryx'),
    tile('UiPath', 'uipath'),
    tile('Figma', 'figma'),
    tile('Amazon Web Services', 'aws'),
    tile('Alteryx', 'alteryx'),
    tile('UiPath', 'uipath'),
  ],
}

function renderTrustedBy() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(trustedByContent), {
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
      <TrustedBy />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TrustedBy', () => {
  it('renders the heading from /api/trusted-by with its accent spans styled', async () => {
    renderTrustedBy()

    const heading = await screen.findByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Trusted by product teams and enterprise innovators.')
    // The green runs are data (RichTextSpan.accent), not markup baked into the component.
    expect(screen.getByText('Trusted by')).toHaveClass('text-accent')
    expect(screen.getByText('innovators.')).toHaveClass('text-accent')
    expect(screen.getByText(/product teams/)).not.toHaveClass('text-accent')
  })

  it('renders each breakpoint wall in its own payload order (D-017.4)', async () => {
    renderTrustedBy()

    // Two walls — 4x2 (desktop) and 2x4 (mobile); CSS shows exactly one at a
    // time, which the fidelity spec verifies per width. The duplicate tiles are
    // the design's own, and they differ per breakpoint — hence two lists.
    const desktop = await screen.findByTestId('trusted-by-wall-desktop')
    expect(within(desktop).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(
      trustedByContent.logos.map((logo) => logo.name),
    )

    const mobile = screen.getByTestId('trusted-by-wall-mobile')
    expect(within(mobile).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(
      trustedByContent.logosMobile.map((logo) => logo.name),
    )

    // Bitmaps come from the payload, not the component.
    expect(within(desktop).getAllByRole('img').map((img) => img.getAttribute('src'))).toEqual(
      trustedByContent.logos.map((logo) => logo.image.src),
    )
  })
})
