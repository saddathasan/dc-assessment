// Cross-island channel for opening the Solutions Section on a specific tab
// (D-033). The mega-menu tiles (Navigation) and the tab bar (Solutions) render
// in separate SectionBoundary islands with no shared React state, so a tile
// reaches its tab through the URL — a `?solution=<id>` param that is shareable
// and survives reload — plus a custom event, because history.pushState is silent
// (it fires no popstate, so the already-mounted tab bar needs an explicit nudge).
import type { SolutionId } from '@metatech/shared'

export const SOLUTION_PARAM = 'solution'
export const SOLUTION_EVENT = 'metatech:select-solution'

/** The deep-link tab id from the URL, for hydrating the tab bar on load/reload. */
export function readSolutionParam(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(SOLUTION_PARAM)
}

/** Opens Solutions on `id`: records it in the URL (shareable), nudges the tab bar, scrolls. */
export function selectSolution(id: SolutionId): void {
  const url = new URL(window.location.href)
  url.searchParams.set(SOLUTION_PARAM, id)
  url.hash = 'solutions'
  window.history.pushState(null, '', url)
  window.dispatchEvent(new CustomEvent(SOLUTION_EVENT, { detail: id }))
  document.getElementById('solutions')?.scrollIntoView()
}
