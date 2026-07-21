// Navigation Section (MS-2): the floating rounded bar at both design widths, the
// Solutions mega-menu (notes 1:512/1:514), and the Authored hamburger overlay.
// Geometry and fills come verbatim from Figma nodes 1:40..1:53 and 1:301..1:305.
import { useEffect, useRef, useState } from 'react'
import type { NavigationContent, SolutionId } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { selectSolution } from '../../lib/solutionDeepLink'
import { HamburgerOverlay } from './HamburgerOverlay'
import { MegaMenuPanel } from './MegaMenu'
import { NavigationSkeleton } from './NavigationSkeleton'

/** The page's Navigation Section: data-fed bar, mega-menu, and mobile overlay (D-025 slice). */
export function Navigation() {
  const query = useSectionQuery('navigation')
  return (
    // The band behind the bar is the hero's deep green at both widths.
    <header className="relative z-40 bg-deep p-2.5 lg:p-5">
      <SectionBoundary query={query} skeleton={<NavigationSkeleton />}>
        {(nav) => <NavigationBar content={nav} />}
      </SectionBoundary>
    </header>
  )
}

/** Loaded-state bar: hover/focus/tap-first mega-menu state machine + overlay toggle. */
function NavigationBar({ content }: { content: NavigationContent }) {
  const [megaOpen, setMegaOpen] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  // Esc refocuses the trigger; without this latch that programmatic focus would
  // hit the focus-open handler and immediately reopen the menu.
  const suppressFocusOpen = useRef(false)

  // Esc must work wherever focus sits (note 1:512 a11y commitments), so the
  // listener is document-wide for exactly as long as the menu is open.
  useEffect(() => {
    if (!megaOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        suppressFocusOpen.current = true
        setMegaOpen(false)
        triggerRef.current?.focus()
        // The latch is only for the synchronous refocus above; drop it right after
        // so it can't swallow a later genuine Tab-in (e.g. Esc pressed while the
        // trigger already held focus, where no focus event fires at all).
        window.setTimeout(() => {
          suppressFocusOpen.current = false
        }, 0)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [megaOpen])

  const closeOverlay = () => {
    setOverlayOpen(false)
    hamburgerRef.current?.focus()
  }

  return (
    <>
      {/* Hover/focus containment surface: the menu stays open while the pointer or
          focus is anywhere over the bar or panel, and closes on the way out. */}
      <div
        onMouseLeave={() => setMegaOpen(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setMegaOpen(false)
        }}
      >
        {megaOpen && (
          <MegaMenuPanel
            tiles={content.megaMenu.tiles}
            onSelect={(id: SolutionId) => {
              setMegaOpen(false)
              selectSolution(id)
            }}
          />
        )}
        {/* Bar: white @25% pill (1:41/1:302); its fill yields to the open panel below it. */}
        <div
          data-testid="nav-bar"
          className={`relative z-10 mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-[5px] p-4 transition-colors duration-200 lg:h-20 lg:rounded-bar lg:px-5 lg:py-[15px] ${
            megaOpen ? 'bg-transparent' : 'bg-[rgba(255,255,255,0.25)]'
          }`}
        >
          <div className="flex items-center lg:gap-[420px]">
            <a href="/" aria-label="MetaTech home" className="shrink-0">
              <img
                src="/images/metatech-logo.svg"
                alt=""
                className="h-5 w-[126px] lg:h-[25px] lg:w-[155px]"
              />
            </a>
            <nav aria-label="Primary">
              <ul data-testid="nav-links" className="hidden items-center gap-[25px] lg:flex">
                {content.links.map((link) => {
                  const isTrigger = link.href === '#solutions'
                  return (
                    <li
                      key={link.href}
                      data-testid={isTrigger ? 'mega-menu-item' : undefined}
                      onMouseEnter={() => {
                        // Touch taps emit compatibility mouseenter right before
                        // click; ungated, that would defeat the tap-first fallback.
                        if (window.matchMedia('(hover: hover)').matches) setMegaOpen(isTrigger)
                      }}
                    >
                      <a
                        ref={isTrigger ? triggerRef : undefined}
                        href={link.href}
                        aria-expanded={isTrigger ? megaOpen : undefined}
                        aria-controls={isTrigger ? 'mega-menu-panel' : undefined}
                        onFocus={
                          isTrigger
                            ? () => {
                                if (suppressFocusOpen.current) {
                                  suppressFocusOpen.current = false
                                  return
                                }
                                // Focus-open serves keyboard flow on hover-capable
                                // devices; on touch, tap focuses first and would
                                // defeat the tap-first fallback below.
                                if (window.matchMedia('(hover: hover)').matches) setMegaOpen(true)
                              }
                            : undefined
                        }
                        onClick={
                          isTrigger
                            ? (event) => {
                                // Tap-first fallback: without hover, the first
                                // activation opens the menu instead of navigating.
                                if (!window.matchMedia('(hover: hover)').matches && !megaOpen) {
                                  event.preventDefault()
                                  setMegaOpen(true)
                                }
                              }
                            : undefined
                        }
                        className={`font-sans text-ui font-bold tracking-[-0.05em] transition-colors hover:text-accent ${
                          isTrigger && megaOpen ? 'text-accent' : 'text-white'
                        }`}
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
          <a
            href={content.cta.href}
            className="hidden h-[50px] items-center rounded-card bg-[rgba(0,0,0,0.32)] px-[25px] py-[10px] font-sans text-ui font-extrabold tracking-[-0.05em] text-white transition-colors hover:bg-[rgba(0,0,0,0.45)] lg:inline-flex"
          >
            {content.cta.label}
          </a>
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={overlayOpen}
            onClick={() => setOverlayOpen(true)}
            className="flex h-6 w-6 items-center justify-center lg:hidden"
          >
            {/* Icon strokes reconstructed from vector 1:305: 12/16/8 lines, round caps. */}
            <svg viewBox="0 0 16 14" width="16" height="14" fill="none" className="overflow-visible" aria-hidden="true">
              <path d="M0 0h12M0 7h16M0 14h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {overlayOpen && <HamburgerOverlay content={content} onClose={closeOverlay} />}
    </>
  )
}
