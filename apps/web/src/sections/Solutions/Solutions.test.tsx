// Behaviour contract for the Solutions Section (MS-6, D-028): the tab bar is a
// real content switcher — one panel on screen at a time, swapped by pointer or
// keyboard under the WAI-ARIA tabs pattern. Panel content comes from
// /api/solutions (01 heading per D-017.1, panels 02/03 Authored per D-016).
// Geometry, typography, and sticky fidelity live in tests/fidelity/solutions.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SolutionsContent } from '@metatech/shared'
import { Solutions } from './Solutions'

/** Mirrors apps/api/src/data/solutions.json — the real payload shape and values. */
const solutionsContent: SolutionsContent = {
  tabs: [
    { id: 'data-ai', label: 'Data + AI' },
    { id: 'custom-software', label: 'Custom Software' },
    { id: 'tech-staffing', label: 'Tech Staffing' },
  ],
  panels: [
    {
      id: 'data-ai',
      number: '01',
      heading: 'Data + AI Driven Innovation',
      body: 'Our Data and AI services combine engineering, analytics, and applied AI to help organizations understand data, predict outcomes, and automate decisions.',
      cta: { label: 'Book a consultation', href: '#contact' },
      cards: [
        { heading: 'Data Integrity First', body: 'AI outputs are only as reliable as the data feeding them.' },
        { heading: 'Workflows Before Automation', body: 'Before we build anything, we map your business workflows end to end.' },
        { heading: 'Governance With Same Standard', body: 'We implement data governance frameworks that carry the same accountability.' },
      ],
      showcase: {
        logo: { src: '/images/amicredible-logo.png', alt: 'AmiCredible' },
        name: 'AmiCredible',
        heading: 'An AI-powered credibility checking platform',
        body: 'that helps users verify claims, analyze sources, and make informed decisions.',
        cta: { label: 'Explore more →', href: '#showcase' },
        slides: [{ image: { src: '/images/showcase-device.jpg', alt: 'AmiCredible running on a tablet — view 1' } }],
      },
    },
    {
      id: 'custom-software',
      number: '02',
      heading: 'Custom Software Development',
      body: 'Our engineering teams design, build, and ship software shaped around the way your business actually works.',
      cta: { label: 'Book a consultation', href: '#contact' },
      authored: true,
      cards: [
        { heading: 'Discovery Is Engineering', body: 'Most failed builds were scoped in one meeting.' },
        { heading: 'Architecture Outlives Features', body: 'Features get replaced every quarter.' },
        { heading: 'Built For Handover', body: 'We write code your team can own without us.' },
      ],
      showcase: {
        name: 'Fieldmark',
        heading: 'An offline-first field operations platform',
        body: 'that helps supervisors dispatch crews and capture site evidence.',
        cta: { label: 'Explore more →', href: '#showcase' },
        slides: [{ image: { src: '/images/showcase-device.jpg', alt: 'Fieldmark running on a tablet — view 1' } }],
      },
    },
    {
      id: 'tech-staffing',
      number: '03',
      heading: 'Tech Staff Augmentation',
      body: 'We embed senior engineers, data specialists, and delivery leads directly into your teams.',
      cta: { label: 'Book a consultation', href: '#contact' },
      authored: true,
      cards: [
        { heading: 'Engineers Screen Engineers', body: 'A recruiter can match keywords.' },
        { heading: 'Teammates Not Resources', body: 'Our engineers join your standups.' },
        { heading: 'Retention Is Our Problem', body: 'Cheap placements leave in four months.' },
      ],
      showcase: {
        name: 'Rampline',
        heading: 'A vetting-first engineering talent platform',
        body: 'that helps hiring leads review verified skill profiles.',
        cta: { label: 'Explore more →', href: '#showcase' },
        slides: [{ image: { src: '/images/showcase-device.jpg', alt: 'Rampline running on a tablet — view 1' } }],
      },
    },
  ],
}

function renderSolutions() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(solutionsContent), {
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
      <Solutions />
    </QueryClientProvider>,
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })
const panel = () => screen.getByRole('tabpanel')

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Solutions', () => {
  it('renders the three tabs from /api/solutions, first one selected', async () => {
    renderSolutions()

    const tablist = await screen.findByRole('tablist')
    expect(within(tablist).getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Data + AI',
      'Custom Software',
      'Tech Staffing',
    ])
    expect(tab('Data + AI')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Custom Software')).toHaveAttribute('aria-selected', 'false')
    expect(tab('Tech Staffing')).toHaveAttribute('aria-selected', 'false')
  })

  it('shows only the selected tab’s panel', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    // The panel is the tab's whole body; at rest that is panel 01 (D-028.2).
    expect(panel()).toHaveTextContent('01')
    expect(panel()).toHaveTextContent('Data + AI Driven Innovation')
    // The other panels' content must not be in the document at all.
    expect(screen.queryByText('Custom Software Development')).not.toBeInTheDocument()
    expect(screen.queryByText('Tech Staff Augmentation')).not.toBeInTheDocument()
  })

  it('wires each tab to its panel for assistive tech', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    const selected = tab('Data + AI')
    expect(selected).toHaveAttribute('aria-controls', panel().id)
    expect(panel()).toHaveAttribute('aria-labelledby', selected.id)
  })

  it('swaps the whole panel when another tab is clicked', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    await userEvent.click(tab('Tech Staffing'))

    expect(tab('Tech Staffing')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Data + AI')).toHaveAttribute('aria-selected', 'false')
    expect(panel()).toHaveTextContent('03')
    expect(panel()).toHaveTextContent('Tech Staff Augmentation')
    expect(panel()).toHaveTextContent('We embed senior engineers')
    expect(screen.queryByText('Data + AI Driven Innovation')).not.toBeInTheDocument()
  })

  it('moves between tabs with the arrow keys, wrapping at both ends', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    // Roving tabindex: only the selected tab is in the tab sequence.
    expect(tab('Data + AI')).toHaveAttribute('tabindex', '0')
    expect(tab('Custom Software')).toHaveAttribute('tabindex', '-1')

    await userEvent.tab()
    expect(tab('Data + AI')).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Custom Software')).toHaveFocus()
    expect(panel()).toHaveTextContent('Custom Software Development')

    // Wraps forward past the end…
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(tab('Data + AI')).toHaveFocus()
    // …and backward past the start.
    await userEvent.keyboard('{ArrowLeft}')
    expect(tab('Tech Staffing')).toHaveFocus()
    expect(panel()).toHaveTextContent('Tech Staff Augmentation')
  })

  it('jumps to the first and last tab with Home and End', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    await userEvent.tab()
    await userEvent.keyboard('{End}')
    expect(tab('Tech Staffing')).toHaveFocus()
    expect(panel()).toHaveTextContent('03')

    await userEvent.keyboard('{Home}')
    expect(tab('Data + AI')).toHaveFocus()
    expect(panel()).toHaveTextContent('01')
  })

  it('renders the panel’s CTA from the payload', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    const cta = within(panel()).getByRole('link', { name: 'Book a consultation' })
    expect(cta).toHaveAttribute('href', '#contact')
  })

  it('renders the panel’s three value cards, heading and body both present', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    const cards = within(panel()).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    expect(cards.map((c) => within(c).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Data Integrity First',
      'Workflows Before Automation',
      'Governance With Same Standard',
    ])
    // The body is in the DOM at rest — the hover flip reveals it visually
    // (note 2:3), so it must stay readable to search and assistive tech.
    expect(cards[0]).toHaveTextContent('AI outputs are only as reliable as the data feeding them.')
  })

  it('swaps the cards with the tab', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    await userEvent.click(tab('Tech Staffing'))

    const cards = within(panel()).getAllByRole('listitem')
    expect(cards.map((c) => within(c).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Engineers Screen Engineers',
      'Teammates Not Resources',
      'Retention Is Our Problem',
    ])
    expect(screen.queryByText('Data Integrity First')).not.toBeInTheDocument()
  })

  it('makes each card keyboard-reachable so the hover reveal has a focus equivalent', async () => {
    renderSolutions()
    await screen.findByRole('tablist')

    // D-010's a11y commitment: hover-only reveals need :focus-visible parity,
    // which requires the card itself to be focusable.
    for (const card of within(panel()).getAllByRole('listitem')) {
      expect(card).toHaveAttribute('tabindex', '0')
    }
  })
})
