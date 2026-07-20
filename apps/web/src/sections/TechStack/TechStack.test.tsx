// Data contract and interaction rules for the Tech Stack Section (MS-9): the
// heading block, the three horizontal marquee rows with their per-row direction
// and artboard phase (D-029), and the WCAG 2.2.2 pause mechanism. Geometry and
// colour fidelity live in tests/fidelity/tech-stack.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LogoTile, TechStackContent } from '@metatech/shared'
import { TechStack } from './TechStack'

const tile = (name: string, file: string): LogoTile => ({
  name,
  image: { src: `/images/tech/${file}.png`, alt: name },
})

/** Mirrors apps/api/src/data/tech-stack.json — the real payload shape and values. */
const techStackContent: TechStackContent = {
  eyebrow: 'Tech Stacks />',
  heading: 'Built With Modern Technologies',
  body: 'We use modern, reliable technologies to design, build, and scale high-performance software systems.',
  rows: [
    {
      direction: 'left',
      logos: [
        tile('React', 'react'),
        tile('Next.js', 'nextjs'),
        tile('Tailwind CSS', 'tailwind'),
        tile('TypeScript', 'typescript'),
        tile('Angular', 'angular'),
        tile('Vue.js', 'vue'),
      ],
    },
    {
      direction: 'right',
      logos: [
        tile('Go', 'go'),
        tile('Python', 'python'),
        tile('Node.js', 'nodejs'),
        tile('.NET', 'dotnet'),
        tile('Ruby', 'ruby'),
        tile('PHP', 'php'),
      ],
    },
    {
      direction: 'left',
      logos: [
        tile('Django', 'django'),
        tile('Laravel', 'laravel'),
        tile('Flutter', 'flutter'),
        tile('MySQL', 'mysql'),
        tile('MongoDB', 'mongodb'),
        tile('HTML5', 'html5'),
      ],
    },
  ],
}

function renderTechStack() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(techStackContent), {
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
      <TechStack />
    </QueryClientProvider>,
  )
}

const rows = () => screen.getAllByTestId('marquee-row')
const pauseControl = () => screen.getByRole('button', { name: /pause|resume/i })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TechStack heading block', () => {
  it('renders the eyebrow, heading, and body from the payload', async () => {
    renderTechStack()

    expect(await screen.findByText('Tech Stacks />')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Built With Modern Technologies' })).toBeInTheDocument()
    expect(screen.getByText(/We use modern, reliable technologies/)).toBeInTheDocument()
  })
})

describe('TechStack marquee rows', () => {
  it('renders one row per payload row', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    expect(rows()).toHaveLength(3)
  })

  it('carries each row’s scroll direction from the payload — top and bottom agree, middle opposes (note 2:5)', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    const directions = rows().map((row) => row.getAttribute('data-direction'))
    expect(directions).toEqual(['left', 'right', 'left'])
    expect(directions[0]).toBe(directions[2])
    expect(directions[1]).not.toBe(directions[0])
  })

  it('offsets each row to the phase its artboard frame was drawn at (D-029)', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    // The gate screenshots the reduced-motion resting state, so the resting
    // offset must be the drawn one: 36/76/34 desktop, 42/82/40 mobile.
    const phases = rows().map((row) => [
      row.style.getPropertyValue('--phase-desktop'),
      row.style.getPropertyValue('--phase-mobile'),
    ])
    expect(phases).toEqual([
      ['36px', '42px'],
      ['76px', '82px'],
      ['34px', '40px'],
    ])
  })

  it('repeats each row’s tiles so the strip can loop without a visible seam', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    // The repeats are what make the wrap seamless, so the row holds several
    // copies of its six tiles in the DOM — counted as nodes, since the copies
    // are deliberately not exposed as images (see the next test).
    const row = rows()[0]
    expect(row.querySelectorAll('img').length).toBeGreaterThan(6)
    expect(row.querySelectorAll('img').length % 6).toBe(0)
  })

  it('announces each logo once, hiding the loop repeats from assistive tech', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    // 18 logos in the payload; the repeat copies must not be announced again.
    const announced = screen.getAllByRole('img')
    expect(announced).toHaveLength(18)
    expect(announced.map((img) => img.getAttribute('alt'))).toContain('React')
  })
})

describe('TechStack pause control (WCAG 2.2.2)', () => {
  it('exposes a pause button that is off-screen until focused', async () => {
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    const control = pauseControl()
    expect(control).toBeInTheDocument()
    // The design draws no pause chrome (D-029.5): reachable, not visible at rest.
    expect(control.className).toMatch(/sr-only/)
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles the marquee to paused and back when activated', async () => {
    const user = userEvent.setup()
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    const marquee = screen.getByTestId('marquee')
    expect(marquee).toHaveAttribute('data-paused', 'false')

    await user.click(pauseControl())
    expect(marquee).toHaveAttribute('data-paused', 'true')
    expect(pauseControl()).toHaveAttribute('aria-pressed', 'true')

    await user.click(pauseControl())
    expect(marquee).toHaveAttribute('data-paused', 'false')
    expect(pauseControl()).toHaveAttribute('aria-pressed', 'false')
  })

  it('renames itself so the button always says what it will do next', async () => {
    const user = userEvent.setup()
    renderTechStack()
    await screen.findByText('Tech Stacks />')

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    await user.click(pauseControl())
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
  })
})
