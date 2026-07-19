import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HeroContent } from '@metatech/shared'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { SectionBoundary } from './SectionBoundary'

const heroContent: HeroContent = {
  headline: [
    { text: 'Building ' },
    { text: 'Intelligence to Power', accent: true },
    { text: ' Scalable Innovation' },
  ],
  subcopy: 'Sub copy.',
  cta: { label: 'Book for Demo', href: '#contact' },
  media: { image: { src: '/images/hero-photo.png', alt: 'Hero' } },
  video: { provider: 'youtube', src: 'https://example.com/embed' },
}

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

function HeroProbe() {
  const query = useSectionQuery('hero')
  return (
    <SectionBoundary query={query} skeleton={<div data-testid="skeleton" />}>
      {(hero) => <h1>{hero.headline.map((s) => s.text).join('')}</h1>}
    </SectionBoundary>
  )
}

const renderProbe = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  return render(
    <QueryClientProvider client={client}>
      <HeroProbe />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSectionQuery + SectionBoundary', () => {
  it('shows the skeleton while loading, then the content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(heroContent))),
    )
    renderProbe()

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        name: 'Building Intelligence to Power Scalable Innovation',
      }),
    ).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/hero', expect.anything())
  })

  it('shows an error state with a working retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(new Response('{"error":"Simulated failure"}', { status: 500 })),
        )
        .mockImplementation(() => Promise.resolve(jsonResponse(heroContent))),
    )
    renderProbe()

    const retry = await screen.findByRole('button', { name: /try again/i })
    await userEvent.click(retry)
    expect(
      await screen.findByRole('heading', {
        name: 'Building Intelligence to Power Scalable Innovation',
      }),
    ).toBeInTheDocument()
  })
})
