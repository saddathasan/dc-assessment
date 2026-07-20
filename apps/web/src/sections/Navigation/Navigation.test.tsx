// Interaction contract for the Navigation Section (MS-2, TDD-first): mega-menu
// open/close/tile-reveal semantics (notes 1:512/1:514) and the Authored hamburger
// overlay's lock/trap/Escape lifecycle. Visual fidelity lives in tests/fidelity/.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NavigationContent } from '@metatech/shared'
import { Navigation } from './Navigation'

/** Mirrors apps/api/src/data/navigation.json — the real payload shape and values. */
const navContent: NavigationContent = {
  links: [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Contact', href: '#contact' },
  ],
  cta: { label: 'Book a meeting', href: '#contact' },
  megaMenu: {
    tiles: [
      {
        solution: 'custom-software',
        title: 'Custom Software Development',
        image: { src: '/images/menu/custom-software.jpg', alt: 'Custom software' },
      },
      {
        solution: 'data-ai',
        title: 'Data+AI First Innovation',
        image: { src: '/images/menu/data-ai.png', alt: 'Data and AI' },
      },
      {
        solution: 'tech-staffing',
        title: 'Tech Staff Augmentation',
        image: { src: '/images/menu/tech-staffing.png', alt: 'Tech staffing' },
      },
    ],
  },
}

/** happy-dom computes no media queries; pin hover capability per test (tap-first fallback, D-010). */
function stubHoverCapability(hoverCapable: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: hover)' ? hoverCapable : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function renderNavigation() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(navContent), {
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
      <Navigation />
    </QueryClientProvider>,
  )
}

/** The bar links live in the nav landmark; overlay copies must not satisfy these queries. */
const barLink = (name: string) =>
  within(screen.getByTestId('nav-links')).getByRole('link', { name })

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.style.overflow = ''
})

describe('Navigation bar', () => {
  it('renders logo, links, and CTA from /api/navigation', async () => {
    stubHoverCapability(true)
    renderNavigation()

    expect(await screen.findByRole('link', { name: /metatech home/i })).toBeInTheDocument()
    for (const label of ['Solutions', 'Showcase', 'Contact']) {
      expect(barLink(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Book a meeting' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/navigation', expect.anything())
  })
})

describe('Mega-menu', () => {
  it('opens on hover with all three tiles, and closes when the pointer leaves', async () => {
    stubHoverCapability(true)
    renderNavigation()
    const trigger = await screen.findByRole('link', { name: 'Solutions' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('mega-menu-panel')).not.toBeInTheDocument()

    await userEvent.hover(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByTestId('mega-menu-panel')
    for (const tile of navContent.megaMenu.tiles) {
      expect(within(panel).getByRole('heading', { name: tile.title })).toBeInTheDocument()
    }

    await userEvent.unhover(screen.getByTestId('mega-menu-item'))
    expect(screen.queryByTestId('mega-menu-panel')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens while keyboard focus is on the trigger (:focus-within contract)', async () => {
    stubHoverCapability(true)
    renderNavigation()
    const trigger = await screen.findByRole('link', { name: 'Solutions' })

    await userEvent.tab() // logo
    await userEvent.tab() // Solutions
    expect(trigger).toHaveFocus()
    expect(screen.getByTestId('mega-menu-panel')).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    stubHoverCapability(true)
    renderNavigation()
    const trigger = await screen.findByRole('link', { name: 'Solutions' })

    await userEvent.hover(trigger)
    expect(screen.getByTestId('mega-menu-panel')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByTestId('mega-menu-panel')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('reveals each tile image individually on hover (note 1:514)', async () => {
    stubHoverCapability(true)
    renderNavigation()
    await userEvent.hover(await screen.findByRole('link', { name: 'Solutions' }))

    const tiles = screen.getAllByTestId('mega-menu-tile')
    expect(tiles).toHaveLength(3)
    await userEvent.hover(tiles[0])
    expect(tiles[0]).toHaveAttribute('data-revealed', 'true')
    expect(tiles[1]).toHaveAttribute('data-revealed', 'false')
    expect(tiles[2]).toHaveAttribute('data-revealed', 'false')
  })

  it('tap-first on touch: the first activation opens the menu instead of navigating', async () => {
    stubHoverCapability(false)
    renderNavigation()
    const trigger = await screen.findByRole('link', { name: 'Solutions' })

    let prevented: boolean | undefined
    document.addEventListener('click', (e) => (prevented = e.defaultPrevented), {
      once: true,
    })
    await userEvent.click(trigger)

    expect(prevented).toBe(true)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('mega-menu-panel')).toBeInTheDocument()
  })
})

describe('Hamburger overlay', () => {
  it('opens a full-screen dialog with the nav links and locks scroll', async () => {
    stubHoverCapability(false)
    renderNavigation()
    const button = await screen.findByRole('button', { name: /open menu/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(button)
    const overlay = screen.getByRole('dialog')
    expect(overlay).toHaveAttribute('aria-modal', 'true')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    for (const link of navContent.links) {
      expect(within(overlay).getByRole('link', { name: link.label })).toBeInTheDocument()
    }
    expect(within(overlay).getByRole('link', { name: 'Book a meeting' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes on Escape, unlocks scroll, and returns focus to the button', async () => {
    stubHoverCapability(false)
    renderNavigation()
    const button = await screen.findByRole('button', { name: /open menu/i })

    await userEvent.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(button).toHaveFocus()
  })

  it('closes from its close button', async () => {
    stubHoverCapability(false)
    renderNavigation()
    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }))

    await userEvent.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('traps Tab focus inside the open overlay', async () => {
    stubHoverCapability(false)
    renderNavigation()
    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }))

    const overlay = screen.getByRole('dialog')
    const close = within(overlay).getByRole('button', { name: /close menu/i })
    const cta = within(overlay).getByRole('link', { name: 'Book a meeting' })

    // Tab past the last focusable wraps to the first; Shift+Tab wraps back.
    cta.focus()
    await userEvent.tab()
    expect(close).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(cta).toHaveFocus()
  })
})
