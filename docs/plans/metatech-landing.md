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

**Solutions is one tabbed Section (D-028), not three.** Its sticky tab bar switches a panel
whose body is intro + value cards + showcase — desktop y 1836→3530, mobile 1777→3780, the exact
span note 1:277 pins the bar to. The card row and the showcase are *layers of that panel*, so
they keep their own milestones (a slice each, per D-025) but are not standalone Sections.

| # | Slice | Milestone | Issue | Status |
|---|-------|-----------|-------|--------|
| — | Foundation | MS-0 | #1 | ✅ PR #9 |
| — | Content API + data layer | MS-1 | #2 | ✅ PR #10/#11 |
| 1 | Navigation (+ fidelity harness) | MS-2 | #3 | ✅ PR #20 |
| 2 | Hero (incl. video modal) | MS-3 | #4 | ✅ PR #22 |
| 3 | Trusted By | MS-4 | #5 | ✅ PR #27 |
| 4 | We Are | MS-5 | #6 | ✅ PR #29 |
| 5 | **Solutions (tabbed region)** — shell: contract + switcher + intro | MS-6 | #7 | ✅ PR #33 (rebuild; PR #31 shipped the wrong model, D-028) |
| 5a | ↳ per-tab Value Cards (hover + carousel) | MS-7 | #8 | ✅ PR #35 (+ #39 flip fix) |
| 5b | ↳ per-tab Showcase (carousel) | MS-8 | #13 | ✅ PR #37 |
| 6 | Tech Stack (marquee) — sticky releases here | MS-9 | #14 | ✅ PR #41 |
| 7 | Footer (two-colour VECTOR mark + tilted scrim, D-031) | MS-10 | #15 | ✅ PR #43 |
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

## MS-5 — We Are slice (~0.5h) · `ms/5-we-are` · Issue #6 — ✅ DONE (PR #29, 2026-07-20)

- [x] T5.1 Statement with bold→regular runs from `/api/we-are`
- [x] T5.2 Fidelity Gate @1440 + @393

**AC:** gate green.

## MS-6 — Solutions tabbed shell (~3h) · `ms/6-solutions-tabbed` · Issue #7 — ✅ DONE (PR #33, 2026-07-20)

> **Superseded first attempt:** PR #31 (merged 2026-07-20) built the tab bar as scroll-spy
> anchor navigation over three stacked intro blocks — the model D-016 and EXTRACTION.md open
> question 2 had already rejected. **D-028** records the corrected model and this rebuild;
> the fix lands as a forward-fix PR, not a revert (user call, merge-commit history stands).

→ skills: `superpowers:tdd`, `frontend-design`

- [x] T6.1 **Contract:** `SolutionsContent` = `tabs` + one `panels` entry per tab (intro fields
      + `cards` + `showcase`); retire `/api/value-cards` and `/api/showcase` into it; update
      `data/index.ts`, `routes/content.ts`, `SectionPayloads`, api contract tests (D-028.4)
- [x] T6.2 **Content:** author the Custom Software and Tech Staffing panels' cards + showcase
      (`authored: true`, README assumptions; wordmark fallback for the un-exported logos)
- [x] T6.3 **Tests first:** tab switch swaps the panel, ARIA tab semantics, keyboard roving
      focus, sticky pin, default tab
- [x] T6.4 Sticky tab bar as a **real switcher** (`tablist`/`tab`/`tabpanel`, `aria-selected`,
      arrow/Home/End) over one intro block bound to the active tab — delete the scroll-spy,
      the stacked articles, and the click-priority pin
- [x] T6.5 Mobile: overflow-scroll tab row
- [x] T6.6 Fidelity Gate @1440 + @393 (tab-bar + intro band; Baselines from PR #31 stay valid —
      page geometry now matches the artboard 1:1)

**AC:** gate + tests green · tabs switch the panel · a11y tab pattern verified.

## MS-7 — Per-tab Value Cards (~1.5h) · `ms/7-value-cards` · Issue #8 — ✅ DONE (PR #35, 2026-07-20)

The card row *inside* the tab panel (design y 2306–2756 / mobile 2457–2851): it swaps with the
tab and re-renders from `panels[active].cards`.

→ skills: `superpowers:tdd`, `frontend-design`

- [x] T7.1 **Tests first:** hover/focus flip, carousel swipe/dots, cards swap on tab change
- [x] T7.2 Desktop: hover flip per frame 2:36 (bg/heading/body reveal), `:focus-visible` parity
- [x] T7.3 Mobile: swipe carousel of permanently-dark cards, dots + animated arrow hint (D-015)
- [x] T7.4 Fidelity Gate @1440 + @393

**AC:** gate + tests green · cards follow the active tab.

## MS-8 — Per-tab Showcase (~1.5h) · `ms/8-showcase` · Issue #13 — ✅ DONE (PR #37, 2026-07-20)

The showcase *inside* the tab panel (design y 2829–3530 / mobile 2880–3780), swapping with the
tab from `panels[active].showcase`; closes the tab body — Tech Stack begins immediately after.

→ skills: `superpowers:tdd`, `frontend-design`

- [x] T8.1 **Tests first:** carousel nav + dots, showcase swaps on tab change
- [x] T8.2 Green section, device carousel (scroll-snap), elongated-active dots
      (verify exact section green vs the mobile-sampled token); wordmark fallback where an
      authored panel has no logo asset (D-028.5)
- [x] T8.3 Fidelity Gate @1440 + @393

**AC:** gate + tests green · showcase follows the active tab · tab body ends flush at Tech Stack.

## MS-9 — Tech Stack slice (~1.5h) · `ms/9-tech-stack` · Issue #14 — ✅ DONE (PR #41, 2026-07-20)

> **Axis settled first:** note 2:5's "vertically" contradicts its own row language and the
> artboard. **D-029** decodes the three rows as one uniform 260-pitch strip sampled at phases
> 36/76/34 (mobile 42/82/40) and ratifies horizontal travel — the model `tech-stack.json` had
> already shipped as `direction: left/right/left` since MS-1.

→ skills: `superpowers:tdd`, `frontend-design`

- [x] T9.1 **Tests first:** marquee pause control, reduced-motion behavior
- [x] T9.2 Heading block + 3-row marquee (top/bottom same direction, middle opposite — note
      2:5), hover pause + keyboard-operable pause control (visually hidden until focused —
      the design draws no pause chrome, D-029.5), `prefers-reduced-motion` static **at the
      drawn phase**, mobile edge-bleed
- [x] T9.3 Verify the Tab Bar releases after this Section (closes the MS-6 coupling) —
      `extendPageTail` deleted, release re-derived against the real 850px tail, seam asserted
      at 1px desktop (frame 1:143 itemSpacing) / flush mobile
- [x] T9.4 Fidelity Gate @1440 + @393

**AC:** gate + tests green ×3 stable runs · WCAG 2.2.2 pause verified · sticky release exact.
**Carried into MS-10 and closed there:** the bar now fully leaves the viewport (desktop max
scroll 3838 against a Section ending at 3529, clearing by 309px), and mobile's release is
reachable (4063 against 3683). Both assertions were verified load-bearing by removing the
Footer — `solutions.spec.ts` fails on exactly the 49px it used to record.

## MS-10 — Footer slice · `ms/10-footer` · Issue #15 — ✅ DONE (PR #43)

- [x] T10.0 Footer link order from the artboards + `socialLinksMobile` (D-030, unplanned:
      the shipped payload carried Figma's child order, which is reversed from the drawn one)
- [x] T10.1 Copyright accent spans, legal + socials, and the METATECH mark — a two-colour
      VECTOR under a desktop-only tilted scrim, neither gradient type nor bleeding (D-031)
- [x] T10.2 Fidelity Gate @1440 + @393
- [x] T10.3 Resolve MS-9's two conditional sticky-release claims

**AC:** gate green ✅ 83/83 stable ×3 · **page complete top-to-bottom** ✅ 4738 desktop /
4915 mobile, flush under Tech Stack at both widths. Independent render-diff desktop 0.72%
(mark region 0.07%), mobile 1.74%; web 56/56, api 22/22; typecheck/lint/build clean.

**Carries into MS-11:** `--container-page: 1400px` is dead and misleading — every Section uses
the literal `max-w-[1440px]`, so a Section trusting the token would sit 40px narrow. The repo
has no focus-visible treatment anywhere (the Footer relies on the UA ring rather than
introducing a one-off convention in a slice). Root `pnpm lint` intermittently OOMs;
`--workspace-concurrency=1` is clean. The artboards specify only 1440 and 393 — the Footer is
now proportional through 1024..1440, but that band has no design truth anywhere on the page.

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
