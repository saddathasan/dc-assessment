// Data contract for the Footer Section (MS-10): the accent-span copyright, the
// legal and social links in each artboard's own order (D-030), and the wordmark
// gated by showWordmark. Geometry and colour fidelity live in
// tests/fidelity/footer.spec.ts.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FooterContent } from '@metatech/shared'
import { Footer } from './Footer'

/** Mirrors apps/api/src/data/footer.json — the real payload shape and values. */
const footerContent: FooterContent = {
  copyright: [
    { text: '©2022-2026 ' },
    { text: 'MetaTech LLC ', accent: true },
    { text: '// All Rights Reserved' },
  ],
  legalLinks: [
    { label: 'Terms of Use', href: '#terms' },
    { label: 'Privacy Policy', href: '#privacy' },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Linkedin', href: 'https://linkedin.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Youtube', href: 'https://youtube.com' },
  ],
  socialLinksMobile: [
    { label: 'Linkedin', href: 'https://linkedin.com' },
    { label: 'Youtube', href: 'https://youtube.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
  ],
  showWordmark: true,
}

function renderFooter(content: FooterContent = footerContent) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(content), {
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
      <Footer />
    </QueryClientProvider>,
  )
}

const labels = (list: HTMLElement) =>
  within(list)
    .getAllByRole('link')
    .map((link) => link.textContent)

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Footer', () => {
  it('renders the copyright as one line with only the company name accented', async () => {
    renderFooter()
    const copyright = await screen.findByTestId('footer-copyright-desktop')
    expect(copyright).toHaveTextContent('©2022-2026 MetaTech LLC // All Rights Reserved')
    // The accent is a span inside the line, not a separate line (nodes 1:252/1:456).
    expect(within(copyright).getByText('MetaTech LLC')).toHaveClass('text-accent')
  })

  it('lists the legal links in artboard order, Terms of Use first (D-030)', async () => {
    renderFooter()
    const legal = await screen.findByTestId('footer-legal-desktop')
    expect(labels(legal)).toEqual(['Terms of Use', 'Privacy Policy'])
    expect(within(legal).getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      '#terms',
    )
  })

  it('orders the socials per breakpoint from their own payload lists (D-030)', async () => {
    renderFooter()
    // Desktop draws Facebook first (1:258); mobile starts at Linkedin (1:450).
    expect(labels(await screen.findByTestId('footer-social-desktop'))).toEqual([
      'Facebook',
      'Linkedin',
      'Instagram',
      'Youtube',
    ])
    expect(labels(await screen.findByTestId('footer-social-mobile'))).toEqual([
      'Linkedin',
      'Youtube',
      'Instagram',
      'Facebook',
    ])
  })

  it('renders the wordmark as decoration, not as a second reading of the brand', async () => {
    renderFooter()
    const wordmark = await screen.findByTestId('footer-wordmark')
    // "MetaTech" is already announced by the nav logo and the copyright line;
    // the giant mark is the same word a third time, so it stays out of the tree.
    expect(wordmark).toHaveAttribute('aria-hidden', 'true')
  })

  it('drops the wordmark when the payload turns it off', async () => {
    renderFooter({ ...footerContent, showWordmark: false })
    await screen.findByTestId('footer-copyright-desktop')
    expect(screen.queryByTestId('footer-wordmark')).toBeNull()
  })

  it('exposes one footer landmark', async () => {
    renderFooter()
    await screen.findByTestId('footer-copyright-desktop')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
