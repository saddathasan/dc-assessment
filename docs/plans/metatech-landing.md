# Plan — MetaTech Landing

Feature plan. Spec: [[../TRD.md]] · Decisions: [[../DECISIONS.md]] · Vocabulary: [[../../CONTEXT.md]]
· Design truth: [[../../design/EXTRACTION.md]]

**Topology (D-022):** `ms/N-<slug>` → PR (Closes #N, merge commit, never squash) →
`feat/metatech-landing` → human-gated PR → `dev` → `main` at submission.
**Issues (D-020):** one GitHub issue per Milestone, created up front, each blocked-by its
predecessor. **TDD:** each Milestone's tests are its first task. **Standing skills every task:**
`karpathy-guidelines` (surgical simplicity), `superpowers:verification-before-completion` +
screenshot self-check before any milestone closes.

**The Window:** 36h hard from 2026-07-19 ~19:00 (+06) · estimates below total ~22.5h (~19h
remaining after MS-1). User granted schedule flexibility (D-025); the hard deadline stands.
**Pre-agreed scope-cut order (TRD §9 + D-025 valve):** comprehensive→targeted tests, then
x-browser depth; if the window tightens, remaining Sections drop to static-first with
interactions in a closing pass. Never the Fidelity Gate.
**Status ritual:** this file is the plan of record — at each milestone close, tick its task
boxes, mark the heading `✅ DONE (PR #N, date)`, and update the Section tracker below, in the
same session that merges the PR. Live narrative status stays in the hub README; issues mirror
the milestones on GitHub.

## Section tracker (D-025 — full slices, viewport order)

One Section at a time, complete before the next: statics at both widths + **all** of the
Section's interactions/animations/functionality + tests + Fidelity Gate. Watch it land on
localhost (`pnpm dev` → http://localhost:5173).

| # | Slice | Milestone | Issue | Status |
|---|-------|-----------|-------|--------|
| — | Foundation | MS-0 | #1 | ✅ PR #9 |
| — | Content API + data layer | MS-1 | #2 | ✅ PR #10/#11 |
| 1 | Navigation (+ fidelity harness) | MS-2 | #3 | ✅ PR #20 |
| 2 | Hero (incl. video modal) | MS-3 | #4 | ✅ PR #22 |
| 3 | Trusted By | MS-4 | #5 | ✅ PR #27 |
| 4 | We Are | MS-5 | #6 | ⬜ |
| 5 | Solutions (tabs + sticky) | MS-6 | #7 | ⬜ |
| 6 | Value Cards (hover + carousel) | MS-7 | #8 | ⬜ |
| 7 | Showcase (carousel) | MS-8 | #13 | ⬜ |
| 8 | Tech Stack (marquee) | MS-9 | #14 | ⬜ |
| 9 | Footer (gradient wordmark) | MS-10 | #15 | ⬜ |
| — | Page polish (a11y/perf/SEO/x-browser) | MS-11 | #16 | ⬜ |
| — | Ship | MS-12 | #17 | ⬜ |

---

## MS-0 — Foundation (~1.5h) · branch `ms/0-foundation` · Issue #1 — ✅ DONE (PR #9, 2026-07-19)

Goal: running skeleton of the whole system, riskiest integrations proven.

- [x] T0.1 Commit planning + design artifacts (docs/, design/, CONTEXT.md) — first commits on feat
- [x] T0.2 pnpm workspaces root: `pnpm-workspace.yaml`, root scripts, .gitignore, engines
- [x] T0.3 `apps/web`: Vite 8 react-ts + Tailwind v4 `@theme` tokens + @fontsource fonts +
      **TanStack Router (verify Vite 8 plugin compat — riskiest unknown, do first)** + Query +
      `/api` proxy + Vitest/happy-dom/RTL wiring — setup per research notes in
      [[../DECISIONS.md]] D-003/D-005
- [x] T0.4 `apps/api`: Express 5 TS (`app.ts`/`server.ts`), `/api/health`, error + 404 +
      `simulateNetwork` middleware, Vitest wiring
- [x] T0.5 `packages/shared`: `SolutionId` + Section payload type stubs (plain TS source)
- [x] T0.6 Scratch Cloudflare deploy: `worker.ts` + `wrangler.jsonc` + custom domain route +
      `--dry-run` then real deploy (flush D-011 risks)

**AC:** `pnpm dev` runs web+api with proxy (`/api/health` from web origin) · tokens/fonts demo
renders · both Vitest suites green · scratch URL live on the custom domain.

## MS-1 — Content contract & API (~2h) · `ms/1-content-api` · Issue #2 — ✅ DONE (PR #10 + #11, 2026-07-20)

Goal: every Section's real content served, typed, and consumable. → skill: `superpowers:tdd`

- [x] T1.1 **Tests first:** contract tests — 10 endpoints × (200, payload matches Contract)
- [x] T1.2 Complete Content Contract types (rich-text accent spans, all 9 payloads, video union)
- [x] T1.3 Extract content JSON from `design/figma/tree-*.txt` → `data/*.json` (verbatim;
      D-017 fixes applied + logged in README assumptions)
- [x] T1.4 Author Solution Blocks 02/03 copy (D-016; brand voice from mega-menu tiles)
- [x] T1.5 Routes + asset export: section images/logos from Extraction → `apps/web/public`
      (vector logos from `fillGeometry` where crisper)
- [x] T1.6 Web data layer: query client, `useSectionQuery`, `SectionBoundary`
      (layout-matched skeleton / error+retry) — proven on Hero with raw data

**AC:** contract tests green · `?delay=2000` shows skeletons, `?fail=true` shows error+retry on
the proof section.

## MS-2 — Navigation slice + fidelity harness (~3.5h) · `ms/2-navigation` · Issue #3 — ✅ DONE (PR #20, 2026-07-20)

Goal: the measuring instrument alive, then the first Section lands complete.
→ skills: `superpowers:tdd`, `frontend-design`

- [x] T2.1 **Harness first:** Playwright fidelity lib (new dependency — ask before install) —
      Baseline slicing from `design/figma/renders/`, per-Section screenshot ≤5% diff,
      computed-style numeric asserts (D-021)
- [x] T2.2 **Tests first:** mega-menu open/close/tile-hover, hamburger open/trap/Esc
- [x] T2.3 Nav bar static, both widths: floating rounded bar, logo SVG, links, CTA
- [x] T2.4 Mega-menu: panel + 3 tiles, per-tile image reveal, tap-first + `:focus-within` +
      Esc + `aria-expanded` (notes 1:512/1:514)
- [x] T2.5 Hamburger overlay (Authored, open Q1 default): deep-green overlay, staggered link
      reveal, scroll lock + focus trap
- [x] T2.6 Fidelity Gate: Navigation @1440 + @393

**AC:** gate green · interaction tests green · menus fully alive on localhost.

## MS-3 — Hero slice (~2.5h) · `ms/3-hero` · Issue #4 — ✅ DONE (PR #22, 2026-07-20)

→ skills: `superpowers:tdd`, `frontend-design`

- [x] T3.1 **Tests first:** video modal open/close/focus lifecycle, provider switch
- [x] T3.2 Hero static: accent-span headline (data-driven), sub-copy, CTA, media block w/
      notch + play button, watermark (mobile: play button above photo)
- [x] T3.3 Video modal: native `<dialog>`, provider union (YouTube iframe sentinel /
      `<video>`), Safari close workaround (D-018)
- [x] T3.4 Fidelity Gate: Hero @1440 + @393

**AC:** gate green · modal a11y (trap, Esc, focus return) · tests green.

## MS-4 — Trusted By slice (~0.5h) · `ms/4-trusted-by` · Issue #5 — ✅ DONE (PR #27, 2026-07-20)

- [x] T4.1 Logo grid 2×4 ↔ 2-col×4-row from `/api/trusted-by` (designed duplicates kept;
      the mobile artboard's own duplicates differ, so the contract gained `logosMobile`)
- [x] T4.2 Fidelity Gate @1440 + @393

**AC:** gate green.

## MS-5 — We Are slice (~0.5h) · `ms/5-we-are` · Issue #6

- [ ] T5.1 Statement with bold→regular runs from `/api/we-are`
- [ ] T5.2 Fidelity Gate @1440 + @393

**AC:** gate green.

## MS-6 — Solutions slice (~2.5h) · `ms/6-solutions` · Issue #7

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T6.1 **Tests first:** tab switching, scroll-spy, sticky pin
- [ ] T6.2 Tab Bar + Solution Blocks 01–03 wired to `/api/solutions`
- [ ] T6.3 Sticky within the Solutions→TechStack wrapper + IntersectionObserver scroll-spy
      (note 1:277) — release-after-TechStack asserted provisionally, re-verified in MS-9
- [ ] T6.4 Mobile: overflow-scroll tab row
- [ ] T6.5 Fidelity Gate @1440 + @393

**AC:** gate + tests green · tabs alive.

## MS-7 — Value Cards slice (~1.5h) · `ms/7-value-cards` · Issue #8

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T7.1 **Tests first:** hover/focus flip, carousel swipe/dots
- [ ] T7.2 Desktop: hover flip per frame 2:36 (bg/heading/body reveal), `:focus-visible` parity
- [ ] T7.3 Mobile: swipe carousel of permanently-dark cards, dots + animated arrow hint (D-015)
- [ ] T7.4 Fidelity Gate @1440 + @393

**AC:** gate + tests green.

## MS-8 — Showcase slice (~1.5h) · `ms/8-showcase` · Issue #13

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T8.1 **Tests first:** carousel nav + dots
- [ ] T8.2 Green section, device carousel (scroll-snap), elongated-active dots
      (verify exact section green vs the mobile-sampled token)
- [ ] T8.3 Fidelity Gate @1440 + @393

**AC:** gate + tests green.

## MS-9 — Tech Stack slice (~1.5h) · `ms/9-tech-stack` · Issue #14

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T9.1 **Tests first:** marquee pause control, reduced-motion behavior
- [ ] T9.2 Heading block + 3-row marquee (top/bottom same direction, middle opposite — note
      2:5), hover/focus pause + visible pause control, `prefers-reduced-motion` static,
      mobile edge-bleed
- [ ] T9.3 Verify the Tab Bar releases after this Section (closes the MS-6 coupling)
- [ ] T9.4 Fidelity Gate @1440 + @393

**AC:** gate + tests green · WCAG 2.2.2 pause verified · sticky release exact.

## MS-10 — Footer slice (~0.5h) · `ms/10-footer` · Issue #15

- [ ] T10.1 Copyright accent spans, legal + socials, gradient wordmark bleeding off bottom
- [ ] T10.2 Fidelity Gate @1440 + @393

**AC:** gate green · **page complete top-to-bottom.**

## MS-11 — Page polish (~2.5h) · `ms/11-polish` · Issue #16

Page-wide properties no single Section owns.
→ skills: `superpowers:verification-before-completion`, `code-review` (pre-merge pass)

- [ ] T11.1 Breakpoint sweep: fluid behavior 393→1440 (containers, type, grids at mid-widths)
- [ ] T11.2 A11y audit: axe clean, focus visible everywhere, reduced-motion sweep, contrast
- [ ] T11.3 SEO: title/meta/OG/favicon, semantic landmarks, single h1
- [ ] T11.4 Perf: responsive images + lazy below-fold, preloads, Lighthouse ≥90 ×4 recorded
- [ ] T11.5 Cross-browser pass: Chrome/Safari/Firefox/Edge current — issues fixed or logged

**AC:** recorded Lighthouse ≥90 all categories · axe clean · sweep findings closed.

## MS-12 — Ship (~2h) · `ms/12-ship` · Issue #17

- [ ] T12.1 Production deploy: final wrangler deploy, custom domain, prod smoke incl.
      `?delay/?fail`
- [ ] T12.2 README: setup, structure, technologies, **assumptions** (Authored Content, D-017
      fixes, D-015 carousel, hamburger, D-023, D-025), future improvements, live URL,
      decision-log pointer
- [ ] T12.3 Full regression: fidelity + unit + interaction + contract suites; results recorded
- [ ] T12.4 `feat → dev` PR (human gate — your review) → `dev → main` · submission email
      draft to hr@d4t4crunch.com with repo + live links

**AC:** cold-load-fast public URL on custom domain · README complete · all suites green ·
`main` holds the submission state.

---

## Post-approval bootstrap (before MS-0, same session as approval)

1. `git switch -c dev && git push -u origin dev` (GIT_GUARD_ALLOW for branch creation only if
   guard objects; no direct main commits)
2. `git switch -c feat/metatech-landing`
3. Create Issues #MS-0…#MS-7 via `gh issue create` (title `MS-N: <name>`, body = goal + AC +
   `Blocked by #<prev>`); enable merge-commit-only on repo (`gh repo edit` — disallow squash)
4. Mirror this plan's tasks to the live todo panel at each milestone start
