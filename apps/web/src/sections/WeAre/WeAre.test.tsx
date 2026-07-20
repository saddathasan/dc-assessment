// Data contract for the We Are Section (MS-5): eyebrow heading plus the
// statement's bold→regular weighted runs, all from /api/we-are (D-017.3 colon
// included). Geometry and typography fidelity live in tests/fidelity/we-are.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WeAreContent } from '@metatech/shared'
import { WeAre } from './WeAre'

/** Mirrors apps/api/src/data/we-are.json — the real payload shape and values. */
const weAreContent: WeAreContent = {
  eyebrow: 'We Are />',
  statement: [
    { text: 'Engineering business solutions through three strategic pillars: ', bold: true },
    {
      text: 'AI powered delivery combining intelligent software engineering, data driven insight, and elite talent to accelerate scale, quality, and competitive advantage.',
    },
  ],
}

function renderWeAre() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(weAreContent), {
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
      <WeAre />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('WeAre', () => {
  it('renders the eyebrow from /api/we-are as the section heading', async () => {
    renderWeAre()

    const heading = await screen.findByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('We Are />')
  })

  it('renders the statement runs with data-driven weights (D-017.3 colon kept)', async () => {
    renderWeAre()

    // The bold→regular split is payload data (WeightedTextSpan.bold), not markup
    // baked into the component — the design's styleOverrideTable made w800/w400
    // character runs of one text node (1:104/1:361).
    const bold = await screen.findByText(/three strategic pillars:/)
    expect(bold).toHaveClass('font-extrabold')
    const regular = screen.getByText(/AI powered delivery/)
    expect(regular).not.toHaveClass('font-extrabold')

    // One continuous statement: the runs join without markup-injected whitespace.
    expect(bold.parentElement).toHaveTextContent(
      'Engineering business solutions through three strategic pillars: AI powered delivery combining intelligent software engineering, data driven insight, and elite talent to accelerate scale, quality, and competitive advantage.',
    )
  })
})
