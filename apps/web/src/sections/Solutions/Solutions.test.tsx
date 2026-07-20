// Data contract + interaction tests for the Solutions Section (MS-6): tabs and
// blocks 01–03 from /api/solutions (01 heading per D-017.1, 02/03 Authored per
// D-016), anchor-nav tab switching, and the IntersectionObserver scroll-spy.
// Geometry, typography, and sticky fidelity live in tests/fidelity/solutions.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SolutionsContent } from '@metatech/shared'
import { Solutions } from './Solutions'

/** Mirrors apps/api/src/data/solutions.json — the real payload shape and values. */
const solutionsContent: SolutionsContent = {
  tabs: [
    { id: 'data-ai', label: 'Data + AI' },
    { id: 'custom-software', label: 'Custom Software' },
    { id: 'tech-staffing', label: 'Tech Staffing' },
  ],
  blocks: [
    {
      id: 'data-ai',
      number: '01',
      heading: 'Data + AI Driven Innovation',
      body: 'Our Data and AI services combine engineering, analytics, and applied AI to help organizations understand data, predict outcomes, and automate decisions. From trusted analytics to production grade AI systems, we deliver intelligence that works in the real world.',
      cta: { label: 'Book a consultation', href: '#contact' },
    },
    {
      id: 'custom-software',
      number: '02',
      heading: 'Custom Software Development',
      body: 'Our engineering teams design, build, and ship software shaped around the way your business actually works. From rapid prototypes to enterprise platforms, we deliver secure, scalable systems that hold up in production and keep evolving with you.',
      cta: { label: 'Book a consultation', href: '#contact' },
      authored: true,
    },
    {
      id: 'tech-staffing',
      number: '03',
      heading: 'Tech Staff Augmentation',
      body: 'We embed senior engineers, data specialists, and delivery leads directly into your teams. From a single expert to a full squad, we provide elite talent that ramps up fast, raises the bar, and accelerates your roadmap without the overhead of hiring.',
      cta: { label: 'Book a consultation', href: '#contact' },
      authored: true,
    },
  ],
}

/** Capturing IntersectionObserver stub: happy-dom has no layout, so the spy is driven by hand. */
class ObserverStub {
  static instances: ObserverStub[] = []
  readonly observed: Element[] = []
  readonly callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    ObserverStub.instances.push(this)
  }
  observe(element: Element) {
    this.observed.push(element)
  }
  unobserve() {}
  disconnect() {}
}

/** Fires the scroll-spy observer with hand-built entries, as the browser would on scroll. */
function intersect(entries: Array<{ target: Element; isIntersecting: boolean }>) {
  const spy = ObserverStub.instances.at(-1)
  if (!spy) throw new Error('no IntersectionObserver was constructed')
  act(() => spy.callback(entries as IntersectionObserverEntry[], spy as unknown as IntersectionObserver))
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
  vi.stubGlobal('IntersectionObserver', ObserverStub)
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  return render(
    <QueryClientProvider client={client}>
      <Solutions />
    </QueryClientProvider>,
  )
}

const tab = (name: string) => screen.getByRole('link', { name })

beforeEach(() => {
  ObserverStub.instances.length = 0
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Solutions', () => {
  it('renders the three tabs from /api/solutions as anchors to their blocks', async () => {
    renderSolutions()

    const nav = await screen.findByRole('navigation', { name: 'Solutions' })
    expect(nav).toBeInTheDocument()
    expect(tab('Data + AI')).toHaveAttribute('href', '#solution-data-ai')
    expect(tab('Custom Software')).toHaveAttribute('href', '#solution-custom-software')
    expect(tab('Tech Staffing')).toHaveAttribute('href', '#solution-tech-staffing')

    // The design's rest state: the first tab is the active one (node 1:114).
    expect(tab('Data + AI')).toHaveAttribute('aria-current', 'true')
    expect(tab('Custom Software')).not.toHaveAttribute('aria-current')
    expect(tab('Tech Staffing')).not.toHaveAttribute('aria-current')
  })

  it('renders blocks 01–03 with numbers, headings, bodies, and CTAs', async () => {
    renderSolutions()

    // Block 01 is the designed block (D-017.1 heading fix); 02/03 are Authored (D-016).
    const headings = await screen.findAllByRole('heading', { level: 2 })
    expect(headings.map((h) => h.textContent)).toEqual([
      'Data + AI Driven Innovation',
      'Custom Software Development',
      'Tech Staff Augmentation',
    ])

    for (const block of solutionsContent.blocks) {
      const article = document.getElementById(`solution-${block.id}`)
      expect(article).not.toBeNull()
      expect(article).toHaveTextContent(block.number)
      expect(article).toHaveTextContent(block.body)
    }

    const ctas = screen.getAllByRole('link', { name: 'Book a consultation' })
    expect(ctas).toHaveLength(3)
    for (const cta of ctas) expect(cta).toHaveAttribute('href', '#contact')
  })

  it('moves the active tab on click without waiting for the scroll to settle', async () => {
    renderSolutions()
    await screen.findByRole('navigation', { name: 'Solutions' })

    await userEvent.click(tab('Tech Staffing'))

    expect(tab('Tech Staffing')).toHaveAttribute('aria-current', 'true')
    expect(tab('Data + AI')).not.toHaveAttribute('aria-current')
  })

  it('keeps a clicked tab active until the spy reaches its block', async () => {
    renderSolutions()
    await screen.findByRole('navigation', { name: 'Solutions' })

    await userEvent.click(tab('Tech Staffing'))

    // The click's programmatic scroll sweeps the spy line through other blocks
    // (and clamps short of the target while Solutions is the page tail) —
    // their entries must not steal the clicked highlight.
    intersect([{ target: document.getElementById('solution-data-ai')!, isIntersecting: true }])
    expect(tab('Tech Staffing')).toHaveAttribute('aria-current', 'true')

    // Once the spy sees the clicked block itself, normal spying resumes.
    intersect([{ target: document.getElementById('solution-tech-staffing')!, isIntersecting: true }])
    intersect([{ target: document.getElementById('solution-data-ai')!, isIntersecting: true }])
    expect(tab('Data + AI')).toHaveAttribute('aria-current', 'true')
  })

  it('follows the scroll-spy: the intersecting block drives the active tab', async () => {
    renderSolutions()
    await screen.findByRole('navigation', { name: 'Solutions' })

    // The spy watches all three blocks (note 1:277 scroll-spy over the block stack).
    const spy = ObserverStub.instances.at(-1)!
    expect(spy.observed.map((el) => el.id)).toEqual([
      'solution-data-ai',
      'solution-custom-software',
      'solution-tech-staffing',
    ])

    intersect([{ target: document.getElementById('solution-custom-software')!, isIntersecting: true }])
    expect(tab('Custom Software')).toHaveAttribute('aria-current', 'true')

    // Leaving entries (isIntersecting: false) must not steal the highlight —
    // the last block seen at the spy line stays active between blocks.
    intersect([{ target: document.getElementById('solution-custom-software')!, isIntersecting: false }])
    expect(tab('Custom Software')).toHaveAttribute('aria-current', 'true')
  })
})
