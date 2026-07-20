# TRD — MetaTech Landing

Technical design for the assessment build. Vocabulary: [[../CONTEXT.md]] · Decisions: [[DECISIONS.md]]
· Design truth: [[../design/EXTRACTION.md]] · Plan: [[plans/metatech-landing.md]]

## 1. Goals

Implement the extracted MetaTech design pixel-faithfully (Fidelity Gate, D-021) as a responsive
React SPA fed entirely by a typed Express content API, scoring against the Assessment Brief's
rubric: UI accuracy, code quality (TS), functionality (dynamic data), responsiveness, React best
practices, backend implementation, problem-solving — plus every bonus line (deploy, tests,
animations, TS, performance, SEO).

## 2. System architecture

```
dc-assessment (pnpm workspaces, D-009)
├── apps/web        Vite 8 · React 19 · TS · Tailwind v4 · TanStack Router + Query
├── apps/api        Express 5 · TS · Node 24 (tsx dev / tsc build)
│   └── src/{app.ts, server.ts, worker.ts}   ← shared app; local listener; CF wrapper
├── packages/shared Content Contract (plain TS source — no build step, D-011 caution)
├── design/         Extraction (committed, D-019) — renders double as test Baselines
└── docs/           DECISIONS.md · TRD.md · plans/ · assessment brief
```

Dev: Vite proxies `/api` → Express :3001 (same-origin, no CORS anywhere, D-012).
Prod: one Cloudflare Worker — Express via `httpServerHandler`, SPA via static assets (D-011).

## 3. Content Contract (packages/shared)

9 Section payloads + health, one type per endpoint (denormalized; `SolutionId =
'data-ai' | 'custom-software' | 'tech-staffing'` is the only shared identity):

| Endpoint | Type | Notable content |
|---|---|---|
| `/api/navigation` | `NavigationContent` | links, CTA, mega-menu tiles ×3 (SolutionId, title, image) |
| `/api/hero` | `HeroContent` | headline with accent-span markup, sub-copy, CTA, media, `video: {provider: 'youtube'\|'file', src}` (D-018) |
| `/api/trusted-by` | `TrustedByContent` | heading (accent spans), 8 logo tiles (incl. designed duplicates) |
| `/api/we-are` | `WeAreContent` | eyebrow, bold+regular statement runs |
| `/api/solutions` | `SolutionsContent` | tabs ×3 + one panel per tab — intro (01 extracted; 02/03 authored, D-016), 3 cards with hover bodies, product showcase (D-028) |
| `/api/tech-stack` | `TechStackContent` | heading block, 3 marquee rows × 6 logos with directions |
| `/api/footer` | `FooterContent` | copyright (accent spans), legal + social links, wordmark flag |

Rich text (accent-colored spans inside headlines) is modeled as
`Array<{text: string; accent?: boolean}>` — extracted from Figma's character style overrides.
Content JSON lives in `apps/api/src/data/*.json`, imported (never `fs`-read — Workers, D-011).

## 4. Frontend architecture

- **Routing (D-008):** TanStack Router, file-based: `/` (landing) + `$404`. Nav links are anchor
  scrolls (`scroll-margin-top` compensates the sticky header). ⚠ Router↔Vite 8 plugin
  compatibility is the one unverified integration — MS-0 proves it first.
- **Data (D-014):** TanStack Query, one `useQuery` per Section (`staleTime: Infinity` — static
  content), all mounted in parallel. Per-Section `<SectionBoundary>` renders skeleton (layout-
  matched) / error (retry button) / content. Demo affordances: `?delay=&fail=` forwarded to the API.
- **State (D-006):** Context for cross-component UI state only (`UIProvider`: mega-menu open,
  modal open, active tab); everything else is local component state.
- **Components:** `src/sections/<Section>/` (one folder per Section, colocated hooks/tests),
  `src/components/ui/` (Button, SectionBoundary, Dialog, Carousel, Marquee primitives),
  `src/lib/` (query client, motion tokens, a11y utils).
- **Styling (D-005):** `@theme` tokens generated from the Extraction (colors #33F987/#161616/
  #032019/#F8F8F8/#E9EDF0; Bricolage Grotesque Variable + Manrope Variable via @fontsource;
  radii 25/20/15; text scale with paired line-heights taken verbatim from the Extraction —
  e.g. 72/72, 48/54, 32/36, 30/30, 18/27, 16/23, 14/24; the full scale is generated from
  `design/figma/tree-*.txt` values during MS-0, never estimated). Hero-weight woff2 preloaded
  (LCP). One-offs use arbitrary values; 2+ uses promote to tokens.

### Interaction systems (all CSS-first, D-010)

| System | Mechanics | A11y commitments |
|---|---|---|
| Mega-menu | panel from header; tile image fades in + heading green→white per-tile on hover | tap-first fallback (`hover:hover` gate), `:focus-within`, Esc, `aria-expanded` |
| Hamburger (authored) | full-screen deep-green overlay, staggered link reveal | focus trap, Esc, scroll lock |
| Video modal | native `<dialog>.showModal()`, provider-switched content (D-018) | manual focus trap + iframe sentinel; Safari close via `transitionend` |
| Tab Bar | `position: sticky` within Solutions→Tech Stack range wrapper; IntersectionObserver scroll-spy | tabs are buttons, arrow-key navigation, `aria-selected` |
| Value Cards (in panel) | `group-hover` bg/heading flip + grid-rows body reveal; mobile: scroll-snap carousel, dots + animated arrow hint | cards keyboard-focusable (`:focus-visible` = hover state); carousel swipe + button nav |
| Showcase carousel (in panel) | scroll-snap slides, dot indicators (elongated active) | buttons + `aria-label` per slide |
| Marquee | duplicated track, `translateX(0→-50%)` linear infinite; rows alternate `animation-direction`; pause on hover/focus | `prefers-reduced-motion` → static; visible pause control (WCAG 2.2.2) |

Motion scale (proposed default, open Q3): 200ms/300ms ease-out interactions; marquee 30s linear;
carousel snap native.

## 5. API architecture

Express 5.1 on Node 24: `app.ts` (routes + middleware, shared), `server.ts` (local `listen`),
`worker.ts` (`httpServerHandler` wrapper). Middleware: `helmet`, `simulateNetwork`
(`?delay=&fail=` — hand-rolled), 404 handler, error handler (v5 async auto-forwarding). No
`compression` (Cloudflare edge compresses; local dev doesn't need it). Routes: 9 content GETs +
`/api/health`. Named wildcards only (`/*splat`) — Express 5 / path-to-regexp v8.

## 6. Deployment (D-011)

Cloudflare Worker from `apps/api`: `wrangler.jsonc` with `nodejs_compat`, compat date 2026-07-19,
`assets.directory: ../web/dist`, `not_found_handling: single-page-application`,
`run_worker_first: ["/api/*"]`, custom domain route on the user's existing zone (TLS auto).
Deploy: `pnpm --filter web build && pnpm --filter api exec wrangler deploy`. MS-0 ships a scratch
deploy to flush the three flagged risks (workspace bundling, Express shim, domain). Fallback:
Vercel single-project (documented in D-011); second fallback: rewrite 10 GET handlers as native
Worker fetch (trivial, same config).

## 7. Testing (D-013, D-021)

| Layer | Tool | Gate |
|---|---|---|
| Content Contract | Vitest (api): each endpoint returns 200 + type-valid payload (zod or type-assert) | all endpoints |
| Hooks/data | Vitest+RTL (web): loading→data, loading→error→retry per Section | all Sections |
| Interactions | Vitest+RTL: tabs, modal open/close+focus, mega-menu, carousel, menu | all systems |
| Fidelity | Playwright: per-Section screenshot ≤5% diff vs Baseline @1440+@393 **and** exact computed-style assertions (fonts, colors, radii, spacing) | every Section |
| Quality | Lighthouse ≥90 across categories; axe clean | MS-11 |

Visual harness stands up in MS-2 and serves as the dev-time measure-fix loop, not just CI.

## 8. Performance / SEO / a11y budgets

LCP: preloaded hero font + optimized hero image (responsive `srcset`, below-fold images lazy).
Assets: logos as optimized PNG/SVG from the Extraction (vector logos reconstructed from
`fillGeometry` where crisper). SEO: title/meta/OG/favicon + semantic landmarks
(`header/nav/main/section/footer`, one `h1`). A11y: reduced-motion audit, focus management per
system table, color-contrast check (#33F987-on-dark passes; verify small-text cases).

## 9. Risks

| Risk | Mitigation |
|---|---|
| TanStack Router plugin vs Vite 8 (unverified) | MS-0 first task; fallback: code-based routes (no plugin) — Router still used |
| Express-on-Workers shim edge case | MS-0 scratch deploy; fallback chain in §6 |
| pnpm `workspace:*` bundling on Wrangler | shared = plain TS source; `--dry-run` in MS-0 |
| Font antialiasing vs Baselines | hybrid gate absorbs it (D-021); numeric layer is authoritative |
| The Window | scope-cut order pre-agreed: D-013 comprehensive→targeted tests first, then MS-11 x-browser depth; D-025 valve: remaining Sections drop to static-first; never the Fidelity Gate |

## 10. Milestones

Re-cut per D-025 into full Section slices in viewport order: MS-0 Foundation → MS-1 Content API →
MS-2 Navigation (+ fidelity harness) → MS-3 Hero → MS-4 Trusted By → MS-5 We Are → MS-6 Solutions
→ MS-7 per-tab Value Cards → MS-8 per-tab Showcase → MS-9 Tech Stack → MS-10 Footer → MS-11 Page polish → MS-12
Ship. Each slice = statics + all of the Section's interactions/animations + tests + Fidelity Gate,
complete before the next Section. Full acceptance criteria + task lists + Section tracker:
[[plans/metatech-landing.md]]. Execution: D-020 GitHub issues + D-022 topology (`ms/N` →
`feat/metatech-landing` → `dev` → `main`).
