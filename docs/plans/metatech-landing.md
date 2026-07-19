# Plan — MetaTech Landing

Feature plan. Spec: [[../TRD.md]] · Decisions: [[../DECISIONS.md]] · Vocabulary: [[../../CONTEXT.md]]
· Design truth: [[../../design/EXTRACTION.md]]

**Topology (D-022):** `ms/N-<slug>` → PR (Closes #N, merge commit, never squash) →
`feat/metatech-landing` → human-gated PR → `dev` → `main` at submission.
**Issues (D-020):** one GitHub issue per Milestone, created up front, each blocked-by its
predecessor. **TDD:** each Milestone's tests are its first task. **Standing skills every task:**
`karpathy-guidelines` (surgical simplicity), `superpowers:verification-before-completion` +
screenshot self-check before any milestone closes.

**The Window:** 36h hard from 2026-07-19 ~19:00 (+06) · 24h target · estimates below total ~19h.
**Pre-agreed scope-cut order (TRD §9):** comprehensive→targeted tests, then x-browser depth.
Never the Fidelity Gate.
**Status ritual:** this file is the plan of record — at each milestone close, tick its task
boxes and mark the heading `✅ DONE (PR #N, date)` in the same session that merges the PR.
Live narrative status stays in the hub README; issues #1–#8 mirror the milestones on GitHub.

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

## MS-2 — Static sections + visual harness (~3.5h) · `ms/2-static-sections` · Issue #3

Goal: the page's frame pixel-true at both widths; the Fidelity Gate machinery alive.
→ skills: `frontend-design:frontend-design` (all UI tasks), `superpowers:tdd` (harness)

- [ ] T2.1 **Harness first:** Playwright fidelity lib — Baseline slicing from
      `design/figma/renders/`, per-Section screenshot ≤5% diff, computed-style numeric asserts
- [ ] T2.2 Navigation bar (static shell, both widths; menus in MS-3)
- [ ] T2.3 Hero: headline accent spans, media block w/ notch + play button (visual), watermark
- [ ] T2.4 Trusted By grid (2×4 ↔ 2-col×4-row)
- [ ] T2.5 We Are statement
- [ ] T2.6 Footer + gradient wordmark

**AC:** Fidelity Gate green for Navigation/Hero/TrustedBy/WeAre/Footer @1440 + @393.

## MS-3 — Nav interactions (~2.5h) · `ms/3-nav-interactions` · Issue #4

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T3.1 **Tests first:** mega-menu open/close/tile-hover, hamburger, modal focus lifecycle
- [ ] T3.2 Mega-menu: panel + tiles, per-tile image reveal, tap-first + `:focus-within` + Esc
- [ ] T3.3 Hamburger overlay (Authored design, open Q1 default) + scroll lock + trap
- [ ] T3.4 Video modal: `<dialog>`, provider union (YouTube iframe sentinel / `<video>`),
      Safari close workaround

**AC:** interaction tests green · manual a11y pass (tab order, Esc everywhere, `aria-expanded`).

## MS-4 — Solutions systems (~3h) · `ms/4-solutions` · Issue #5

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T4.1 **Tests first:** tab switching, sticky-range spy, carousel swipe/dots
- [ ] T4.2 Tab Bar: sticky within Solutions→TechStack wrapper, release after (Designer Note),
      IntersectionObserver scroll-spy
- [ ] T4.3 Solution Blocks 01–03 wired to tabs
- [ ] T4.4 Value Cards desktop: hover flip (bg/heading/body reveal), `:focus-visible` parity
- [ ] T4.5 Mobile carousel: scroll-snap, dots, animated arrow hint (D-015)

**AC:** Fidelity Gate (Solutions, ValueCards) · sticky pins and releases at the exact section
boundaries · tests green.

## MS-5 — Showcase + marquee (~2h) · `ms/5-showcase-marquee` · Issue #6

→ skills: `superpowers:tdd`, `frontend-design`

- [ ] T5.1 **Tests first:** carousel nav, marquee pause control, reduced-motion behavior
- [ ] T5.2 Showcase: green section, device image carousel, elongated-active dots
- [ ] T5.3 Tech Stack: heading block + 3-row marquee (top/bottom vs middle direction,
      hover/focus pause + visible pause control, `prefers-reduced-motion` static)

**AC:** Fidelity Gate (Showcase, TechStack) · WCAG 2.2.2 pause verified · tests green.

## MS-6 — Responsive, a11y, perf (~2.5h) · `ms/6-polish` · Issue #7

→ skills: `superpowers:verification-before-completion`, `code-review` (pre-merge pass)

- [ ] T6.1 Breakpoint sweep: fluid behavior 393→1440 (containers, type, grids at mid-widths)
- [ ] T6.2 A11y audit: axe clean, focus visible everywhere, reduced-motion sweep, contrast checks
- [ ] T6.3 SEO: title/meta/OG/favicon, semantic landmarks, single h1
- [ ] T6.4 Perf: responsive images + lazy below-fold, preloads, Lighthouse ≥90 ×4 recorded in repo
- [ ] T6.5 Cross-browser pass: Chrome/Safari/Firefox/Edge current — issues fixed or logged

**AC:** recorded Lighthouse ≥90 all categories · axe clean · sweep findings closed.

## MS-7 — Ship (~2h) · `ms/7-ship` · Issue #8

- [ ] T7.1 Production deploy: final wrangler deploy, custom domain, prod smoke incl. `?delay/?fail`
- [ ] T7.2 README: setup (pnpm/corepack), structure, technologies, **assumptions** (Authored
      Content, D-017 copy fixes, D-015 carousel, hamburger), future improvements, live URL,
      decision-log pointer
- [ ] T7.3 Full regression: fidelity + unit + interaction + contract suites; results recorded
- [ ] T7.4 `feat → dev` PR (human gate — your review) → `dev → main` · submission email draft
      to hr@d4t4crunch.com with repo + live links

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
