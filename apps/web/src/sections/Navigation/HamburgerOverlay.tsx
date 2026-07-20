// Authored hamburger open state (open Q1 default, DECISIONS.md): the mobile design
// leaves it blank, so this is our brand-styled full-screen deep-green overlay with a
// staggered link reveal. Flagged as Authored Content in the README assumptions.
import { useEffect, useRef } from 'react'
import type { NavigationContent } from '@metatech/shared'

interface HamburgerOverlayProps {
  content: NavigationContent
  /** Close request (Esc / close button); the caller restores focus to the hamburger. */
  onClose: () => void
}

/** Full-screen mobile menu dialog: scroll lock, focus trap, Esc — mounted only while open. */
export function HamburgerOverlay({ content, onClose }: HamburgerOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Lock page scroll for the overlay's lifetime and start focus on the close
  // button so keyboard flow begins inside the dialog.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    rootRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Manual trap: native <dialog> is reserved for the video modal (D-010); this
  // overlay is a plain fixed sheet, so Tab wraps at both ends by hand.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab' || !rootRef.current) return
    const focusables = rootRef.current.querySelectorAll<HTMLElement>('a[href], button')
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 flex flex-col bg-deep p-2.5"
    >
      {/* Top row mirrors the closed pill so the overlay reads as the bar unfolding. */}
      <div className="flex h-14 shrink-0 items-center justify-between p-4">
        <img src="/images/metatech-logo.svg" alt="MetaTech" className="h-5 w-[126px]" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" className="overflow-visible" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav aria-label="Menu" className="flex grow flex-col justify-between px-4 pb-8 pt-12">
        <ul className="flex flex-col gap-7">
          {content.links.map((link, index) => (
            <li
              key={link.href}
              className="motion-safe:animate-rise-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <a
                href={link.href}
                onClick={onClose}
                className="font-display text-[32px] font-extrabold leading-9 tracking-[-0.05em] text-white transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div
          className="motion-safe:animate-rise-in"
          style={{ animationDelay: `${content.links.length * 80}ms` }}
        >
          <a
            href={content.cta.href}
            onClick={onClose}
            className="inline-flex items-center rounded-card bg-accent px-[35px] py-[10px] font-sans text-ui font-bold tracking-[-0.05em] text-ink"
          >
            {content.cta.label}
          </a>
        </div>
      </nav>
    </div>
  )
}
