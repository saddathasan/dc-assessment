# Architectural Decision Log

Sequential record of every significant decision: what was chosen, what it was chosen **over**, and
the reasoning that makes it defensible. Written to be spoken aloud in a review. Statuses:
**Accepted** (locked), **Proposed** (recommendation awaiting confirmation), **Open** (undecided).

---

## D-001 — Design acquisition: one-shot Figma REST API pull

**Chosen over:** manual viewer-panel extraction; screenshot-and-eyedropper; requesting Dev Mode access.
**Context:** view-only access to the Figma file; no Dev Mode seat; since Nov 2025 Figma caps
view-seat Tier-1 API calls at ~6/month, so extraction had to be one-shot, not iterative.
**Decision:** pull the complete node tree (`geometry=paths`), all bitmap fills, and 5 frame renders
@2x in 3 budgeted requests using a personal access token (view access is an API gate, Dev Mode is
only a UI gate). Save everything to disk; answer all later design questions offline.
**Why superior:** exact values (px, hex, font metrics, auto-layout padding) instead of estimates —
the difference between pixel-perfect and pixel-approximate; repeatable reference (renders become
visual-diff baselines); zero ongoing dependency on Figma availability or rate limits.
**Trade-off accepted:** 3 of ~6 monthly requests consumed; mitigated by 3-request reserve and UI
fallback. Evidence: `design/EXTRACTION.md` (11/11 frames, 29/29 image refs, 0 comment pins).
**Status:** Accepted (executed 2026-07-19).

## D-002 — Language: TypeScript everywhere (both apps + shared package)

**Chosen over:** JavaScript everywhere; TS frontend with JS backend.
**Why superior:** the evaluation rubric names "proper TypeScript typing" as a scoring criterion and
"TypeScript implementation" as bonus; a single language lets the API content contract be typed
**once** in a shared package and imported by both sides — compile-time proof that frontend and
backend agree on the JSON shapes. A JS backend would break that chain exactly where reviewers look.
**Trade-off accepted:** small build-tooling overhead on the API (tsx dev runner + tsc build).
**Status:** Accepted.

## D-003 — Build tool: Vite

**Chosen over:** Create React App (the only other option the brief allows).
**Why superior:** CRA was officially deprecated by the React team (early 2025) and is unmaintained —
choosing it would itself be a poor engineering decision needing defense. Vite is the community
standard: instant HMR, first-class TS, modern output.
**2026 reality check (research-verified):** current Vite is v8 (Rolldown/Oxc-based). Note: the
react-ts template pins TypeScript ~6.x because TypeScript 7.0 (GA July 2026) has no stable compiler
API yet and crashes typescript-eslint — we deliberately stay on the template's TS 6.x pin. Template
now ships Oxlint instead of ESLint; strict tsconfig out of the box.
**Status:** Accepted.

## D-004 — Backend: Express 5 + TypeScript on Node 24 LTS

**Chosen over:** Django (the brief's other allowed option).
**Why superior:** one language across the repo (see D-002); no second toolchain eating the 24h
budget; simplest deploy story (Vercel supports Express zero-config). Express 5.1 has been the npm
default since March 2025 — async handlers auto-forward rejections to error middleware, removing
try/catch boilerplate; that's a visible code-quality win in a small API.
**Toolchain (research-verified):** Node 24 Active LTS; `tsx watch` for dev; plain `tsc` for prod
build; `tsc --noEmit` as the type gate. No bundler — right-sized for a content API.
**Trade-off accepted:** shows no Python range; irrelevant to a frontend-senior assessment.
**Status:** Accepted.

## D-005 — Styling: Tailwind CSS v4 (CSS-first)

**Chosen over:** CSS Modules + SCSS; styled-components.
**Why superior:** v4's `@theme` maps the extracted Figma tokens 1:1 into named design tokens
(`--color-accent: #33F987`, `--font-display: Bricolage Grotesque`, `--radius-lg: 25px`, text sizes
with paired line-heights) — a real, inspectable token system, not utility soup; fastest iteration
speed toward pixel-perfection within the time budget. styled-components rejected: runtime CSS-in-JS
is declining and costs performance on a static marketing page. CSS Modules rejected: manual token
discipline and slower iteration, for no rubric gain.
**Implementation notes (research-verified):** `@tailwindcss/vite` plugin, no config file; fonts
self-hosted via `@fontsource-variable/bricolage-grotesque` + `@fontsource-variable/manrope`
(self-hosting beats Google CDN in 2026: no third-party handshake, no cross-site cache benefit
anymore, privacy); preload the hero-weight woff2 (it's the LCP element); `font-display: swap`.
Policy: one-off values use arbitrary utilities (`w-[457px]`); values reused 2+ times get promoted
to `@theme`.
**Status:** Accepted.

## D-006 — State management: React Context + hooks

**Chosen over:** Redux Toolkit (the brief's only other allowed option).
**Why superior:** the app's state is (a) fetched content per section and (b) five islands of local
UI state (menu open, active tab, modal, carousel index, marquee pause). None of it is shared,
frequently-mutated client state — Redux's use case. Context providers + custom hooks
(`useContent(section)` exposing `loading / error / data`) express this with zero dependencies and
full typing. In review, "why didn't you need Redux" is a stronger senior answer than "I added Redux
to a landing page."
**Trade-off accepted:** if the app grew heavy client-side mutation, this would be revisited — and
the decision log is where that revisit would be recorded.
**Division of labor (see D-014):** Context owns client/UI state (satisfying the brief's constraint);
TanStack Query owns the server-cache layer for API data. The constraint governs *state management*;
Query is a data-fetching cache, not a client state manager — that distinction is the review defense.
**Status:** Accepted.

## D-007 — API shape: fine-grained per-section endpoints (8–9)

**Chosen over:** 5 grouped domain endpoints; a single `/api/content`.
**Decision (user call):** one endpoint per visual section, including nav and footer:
`/api/navigation`, `/api/hero`, `/api/trusted-by`, `/api/we-are`, `/api/solutions`,
`/api/value-cards`, `/api/showcase`, `/api/tech-stack`, `/api/footer` (+ `/api/health`) —
9 content endpoints, one per section in `design/EXTRACTION.md`'s inventory. (Correction logged
2026-07-19: `/api/we-are` was initially omitted; caught in the docs cross-reference pass.)
**Why superior:** maximally demonstrates the rubric's asks — per-section dynamic data, per-section
loading states, per-section graceful errors; mirrors and exceeds the brief's own example granularity
(`/api/home`, `/api/features`, `/api/testimonials`); each section is independently demo-able
(latency/failure simulation per endpoint).
**Trade-off accepted:** more fetches on first paint (nav/footer could pop in) — mitigated by firing
all fetches in parallel on mount and skeleton states matched to each section's layout.
**Amended by [[#D-028]]:** Value Cards and Showcase are not Sections — their content ships
inside `/api/solutions`, so the endpoint list is seven, not nine.
**Status:** Accepted.

## D-008 — Routing: TanStack Router

**Chosen over:** no router (anchor scrolling only); React Router.
**Decision (user call):** adopt TanStack Router; preference to use the TanStack ecosystem wherever
it genuinely fits.
**Why superior:** fully type-safe routes (typed params/links checked at compile time — coherent with
the TS-everywhere story), modern file-based routing, first-class Vite integration; answers the
brief's "configure routing if applicable" line with current best-in-class tooling rather than
either skipping it or reaching for the legacy default.
**Trade-off accepted:** a dependency and route plumbing for what is currently a single-page design —
justified as forward structure (e.g., `/` + 404, potential future pages) and by explicit preference.
**Status:** Accepted (Router). Query adoption resolved in D-014.

## D-009 — Repository: pnpm workspaces monorepo

**Chosen over:** npm workspaces; plain client/server folders; separate repos.
**Decision (user call):** pnpm as the package manager, workspaces monorepo:
`apps/web` (Vite React), `apps/api` (Express), `packages/shared` (content types).
**Why superior:** pnpm's strict, content-addressed node_modules is faster and prevents phantom
dependencies (an honest correctness argument, not just speed); workspaces give the shared-types
contract a first-class home both apps import — the architecture decision reviewers can trace in one
glance at the tree.
**Trade-off accepted:** reviewers must have pnpm (`corepack enable` one-liner in README); deployment
config must be pnpm-aware.
**Status:** Accepted.

## D-010 — Animation stack: CSS-only + native `<dialog>` (no animation library)

**Chosen over:** Motion for React (Framer Motion); GSAP; scroll-driven `animation-timeline` CSS.
**Why superior (research-verified):** every required interaction has a native/CSS-first standard
pattern in 2026 — marquee (duplicated track, `translateX(0→-50%)`, `linear infinite`, middle row
`animation-direction: reverse`), sticky tabs (`position: sticky` + IntersectionObserver scroll-spy),
card hover (`group-hover` + grid-rows text reveal), mega-menu (`group`/`peer` + small React state
for touch/keyboard/Escape), modal (native `<dialog>.showModal()`: backdrop, ESC, top-layer free).
Motion's ~5–15kb (lazy) buys nothing here — a measured case showed removing it cut LCP ~280ms.
`animation-timeline` rejected: still flagged in Firefox stable (cross-browser is a rubric line).
**A11y commitments recorded:** `prefers-reduced-motion` disables marquees + a visible pause
affordance (WCAG 2.2.2); hover interactions gated by `@media (hover: hover)` with tap-first
fallbacks; manual focus trap in the dialog (spec deliberately doesn't trap; YouTube iframe needs a
sentinel); Safari dialog-close transition workaround (`transitionend` → `.close()`).
**Mechanisms revised in build (the CSS-only ruling stands, two of its examples do not):**
- *Sticky tabs* — no IntersectionObserver scroll-spy. The tab bar is a content switcher, not
  anchor navigation ([[#D-028]]); it is `position: sticky` plus WAI-ARIA tabs with roving focus.
- *Card hover* — no grid-rows text reveal. `text-align` and `justify-content` do not animate, so
  mutating them snapped the heading into its dark-state position on the first frame while the
  colours eased (measured: alignment flipped at t=30ms with the background still near white).
  The two states are now separately-laid-out layers that cross-fade on opacity, matching the
  mega-menu tiles' reveal, staggered so the heading is never legible in two places at once.

**Status:** Accepted.

## D-011 — Deployment: Cloudflare (custom domain) first, Vercel as fallback

**Chosen over:** Vercel-only (recommended baseline); Render (15-min sleep + ~1min wake, 5 GB
bandwidth since Apr 2026); Railway (trial credits expire — dead link risk); Fly.io (no free tier).
**Decision (user call):** deploy to Cloudflare using the user's existing domain for a custom URL.
Research confirms viability: Express runs natively on Workers via `nodejs_compat` +
`httpServerHandler` (2025/2026 capability); free tier 100k requests/day; V8 isolates ≈ no cold
starts — the best possible "reviewer opens cold weeks later" story, plus a professional custom URL.
**Fallback:** Vercel Hobby single-project (no sleep, zero-config Express) stays documented and
ready if Cloudflare's monorepo/Express path costs more setup time than budgeted.
**Architecture (research-confirmed):** one Worker deployed from `apps/api`: Express 5 wrapped by
`httpServerHandler` (`nodejs_compat`, compat date ≥ 2025-08-15, Wrangler ≥ 4.28), `assets.directory`
→ `../web/dist` with `not_found_handling: single-page-application` and
`run_worker_first: ["/api/*"]` (assets unmetered; only API calls touch the 100k/day budget).
Custom domain = `routes: [{pattern, custom_domain: true}]` — zone already on Cloudflare, TLS auto.
Implementation cautions recorded: JSON content via `import` not `fs`; separate entries
(`app.ts` / `server.ts` local / `worker.ts` deploy); Express 5 named wildcards (`/*splat`); drop
`compression` (edge compresses); keep `packages/shared` as plain TS source (esbuild `workspace:*`
bundling gotcha); MS-0 does a scratch deploy to de-risk all of this on day one.
**Status:** Accepted (config-ready).

## D-012 — Dev/prod serving topology

**Decision:** dev = Vite dev server proxying `/api` → Express on a local port (same-origin, no CORS
package at all); prod = per D-011 (same-origin on Vercel, still no CORS). Error-handling middleware
+ 404 handler in Express 5 style; `helmet` + `compression` included (one-liners that signal
production hygiene). Loading/error demos via query-param middleware (`?delay=2000`, `?fail=true`) —
hand-rolled, dependency-free, self-explanatory to reviewers.
**Status:** Accepted (topology follows D-011 confirmation).

## D-013 — Testing: Vitest 4.1 + React Testing Library (+ happy-dom)

**Context:** tests are optional in the brief but listed as bonus; Vitest 4.1 is the Vite-8-native
runner; happy-dom is the current faster default environment.
**Decision (user call):** comprehensive suite + visual regression. Vitest+RTL across hooks, API
contract tests per endpoint, interaction tests (tabs, modal, menu, carousel), PLUS Playwright
screenshot comparison using the extracted Figma renders (`design/figma/renders/`) as baselines —
the extraction (D-001) makes true design-fidelity regression testing possible, not just
build-over-build drift detection.
**Why superior:** strongest possible bonus-points story; the visual-regression harness doubles as
the pixel-perfection verification tool during development (measure, fix, re-shoot loop).
**Trade-off accepted:** ~5–6h of the 24h budget; scheduled as its own milestone so slippage is
visible early, and scope-cuttable to targeted tests if the clock demands (cut recorded here if so).
**Status:** Accepted.

## D-014 — Data fetching: TanStack Query alongside Context

**Chosen over:** hand-rolled fetch layer in Context providers (constraint-safest); Router-loader-only.
**Decision (user call):** TanStack Query manages the 9 per-section API queries (caching, retries,
`isLoading`/`isError` per section); React Context remains the state-management choice per the brief.
**Why superior:** Query is the 2026 industry standard for server-cache concerns and pairs naturally
with D-007's fine-grained endpoints — each section component gets typed `useQuery` with per-section
loading/error UI nearly for free, plus retry/stale behavior we'd otherwise hand-build.
**Review defense (documented deliberately):** the brief constrains *state management* — we chose
Context for client state. Server-response caching is a data-fetching concern, the same category as
`fetch` itself; Query never stores client state here.
**Trade-off accepted:** a reviewer may still read it as constraint-adjacent; mitigated by this entry
and a README note. **Status:** Accepted.

## D-015 — Mobile value cards: swipeable carousel with explicit affordances

**Chosen over:** stacking all 3 (recommended for content parity); faithful single card.
**Decision (user call):** horizontal swipe carousel of all three cards on mobile, with dot
indicators at the bottom and an animated arrow hint that complements the overall UI design, so
swipeability is unmistakable.
**Why superior:** preserves all three value propositions (content parity) while matching mobile
interaction idiom; the explicit affordances answer the discoverability objection to invented swipe
patterns. Note: the mobile design shows cards in their *dark* (hover-state) styling — mobile cards
render permanently dark with body copy, which also cleanly sidesteps hover-on-touch.
**Trade-off accepted:** invents an interaction absent from the design — documented as an assumption
with this rationale. **Status:** Accepted.

## D-016 — Tab content: author 02/03 blocks

**Chosen over:** visual-only tabs; disabled tabs.
**Decision:** real tab switcher; write "02 Custom Software" and "03 Tech Staffing" content blocks
reusing the 01 layout, copy adapted from the mega-menu tiles and established brand voice.
**Why superior:** reviewers click tabs — a dead interaction reads as broken; authored content
demonstrates dynamic data + state handling (rubric) and ships a complete-feeling product.
**Trade-off accepted:** two blocks of non-designer copy, flagged as authored in the README.
**Extended by [[#D-028]]:** "real tab switcher" is confirmed as decided here; what a tab
switches is the *whole panel* (intro + cards + showcase), not an intro block alone.
**Status:** Accepted.

## D-017 — Copy policy: fix oddities, document every change

**Chosen over:** faithful reproduction (recommended for strict pixel-accuracy).
**Decision (user call):** correct clear content defects, each with a logged reason:
1. "Data + AI Settings Innovation" → "Data + AI Setting Innovation"? — no: treat as typo for
   **"Data + AI Driven Innovation"?** — the fix wording is decided at build time; the *policy* is:
   obvious typos are corrected, each listed in README ("changed X → Y because Z").
2. "@2022-2026" → "©2022-2026" (correct copyright symbol).
3. We-Are heading/body run-on → punctuated properly.
4. Duplicated Alteryx/UiPath/GCloud logo tiles → kept (visual rhythm may be intentional filler;
   layout fidelity outweighs content logic here).
**Trade-off accepted:** each fix is a deviation from "as accurately as possible" — mitigated by the
documented reasoning; visual/layout fidelity is never sacrificed, only glyph/wording defects.
**Status:** Accepted. **Finalized during MS-1 content authoring:**
1. "Data + AI Settings Innovation" → **"Data + AI Driven Innovation"** ("Settings" is a clear typo;
   "Driven" matches the block's body copy and the brand voice of the mega-menu tile "Data+AI First
   Innovation").
2. "@2022-2026" → **"©2022-2026"** (as decided).
3. We-Are run-on → **colon inserted after "pillars"** ("…three strategic pillars: AI powered
   delivery…") — minimal punctuation at the bold/regular run boundary; no wording changed.
4. Duplicated Alteryx/Google-Cloud logo tiles → **kept** (as decided).
5. Showcase CTA "Explore more  →" (double space in the design text) → **"Explore more →"**
   (single space; obvious glyph defect).

## D-018 — Video modal: content-driven dual source (YouTube now, self-hosted later)

**Chosen over:** YouTube-only; self-hosted-only (recommended for focus-trap simplicity).
**Decision (user call):** the modal supports both providers, selected by the API content payload
(`video: { provider: 'youtube' | 'file', src }`). Ships with a YouTube embed; switching to an
uploaded file later is a content change, not a code change.
**Why superior:** turns a hard-coded asset into demonstrated dynamic content (rubric win); future-
proofs the swap the user already anticipates.
**Trade-off accepted:** must implement the iframe focus-trap sentinel for the YouTube case (research-
flagged hazard) AND the native `<video>` path — slightly more work than either alone.
**Status:** Accepted.

## D-019 — Design artifacts: commit everything to the public repo

**Chosen over:** gitignoring the raw pull and committing only process docs (recommended as the IP-
cautious default).
**Decision (user call):** commit `design/figma/` in full (node JSON, images, renders, tree dumps)
alongside `EXTRACTION.md` and this log.
**Why superior:** maximum process transparency — reviewers can trace every pixel decision to its
extracted source; the visual-regression baselines (D-013) live in-repo where the tests need them.
**Trade-off accepted:** publicly re-hosts the assessment design's contents (~32 MB) — the user owns
that call as the party in relationship with the company; repo size noted in README.
**Status:** Accepted.

## D-020 — Execution transparency: sequential GitHub issues per milestone

**Decision (user call):** every milestone becomes a GitHub issue (MS-0…MS-7) created up front with
its acceptance criteria and explicit dependency on the previous issue; work proceeds only when the
predecessor is resolved; each milestone closes via its PR ("Closes #N") with substantive comments;
**merge commits only — squash merging is prohibited** (preserves the honest per-task history).
**Why superior:** reviewers see the entire engineering process — planned criteria, sequenced
execution, and traceable commits per decision — turning process itself into assessment evidence.
**Status:** Accepted.

## D-022 — Git topology: full workflow model (ms → feat → dev → main)

**Chosen over:** per-milestone PRs straight to main (recommended for reviewer-visible increments);
middle form (ms → feat → main).
**Decision (user call):** strict adherence to the standing workflow: milestone branches
(`ms/0-foundation` … `ms/7-ship`) self-merge into `feat/metatech-landing` on green tests via PRs
that close their GitHub issues (D-020); `feat → dev` is the human review gate; `dev → main` ships
the submission. Merge commits everywhere; no squashing, ever.
**Why superior:** one consistent discipline across all projects beats a per-project exception;
the GitHub issues chain (D-020) already provides reviewer-facing sequencing transparency, so the
milestone PRs against `feat` lose nothing.
**Trade-off accepted:** the final `feat → dev` PR is far larger than the usual ~400-line gate —
accepted knowingly because the feature is the entire deliverable; reviewed milestone-by-milestone
via the issue PRs instead.
**Status:** Accepted.

## D-021 — Fidelity gate: hybrid visual + numeric

**Chosen over:** strict 2% pixel-diff only; numeric-only with manual screenshots.
**Decision:** per-section Playwright screenshot diff ≤ 5% against the Figma render baselines at
1440px and 393px (absorbs unavoidable font-antialiasing noise) **plus** exact numeric assertions on
computed styles (font-size, line-height, color, radius, padding, gap) for each section's key
elements with zero tolerance. Numeric layer proves pixel-perfection; visual layer catches layout
regressions.
**Status:** Accepted.

## D-023 — MS-1 content-authoring calls (Authored Content inventory)

**Context:** serving every Section's content (D-007) required filling gaps the design leaves open;
each call below is flagged `authored` where the Content Contract allows and listed in the README
assumptions.
**Decisions:**
1. **Showcase slides ×4:** the design shows one captured device image but 4 carousel dots on
   mobile (3 on desktop — an internal design inconsistency). Resolved to 4 slides reusing the one
   captured image so the carousel demonstrably works; noted as assumption.
2. **Hero video placeholder:** `provider: 'youtube'`, Blender's Big Buck Bunny official embed —
   neutral, embeddable, swappable by content alone (D-018).
3. **Link targets:** section anchors (`#solutions`, `#showcase`, `#contact`) and root social
   domains — no real destinations exist in the brief; placeholder policy documented in README.
4. **Solution Blocks 02/03** copy authored per D-016, `authored: true` in the payload — the flag
   travels with the content so provenance survives any future CMS move.
**Extended by [[#D-028]]:** the Authored inventory grows by the Custom Software and Tech
Staffing panels' cards and showcases (six cards, two product spotlights).
**Status:** Accepted.

## D-024 — Commenting standard: mandatory, merge-gating

**Decision (user call, 2026-07-20):** every source file opens with a 1–2 line header stating its
role in the system; every exported function/component/type carries one concise, definitive line on
what it does and why it exists (citing decision IDs where they shape the code); non-obvious logic
gets a why-comment. Prohibited: restating what code plainly shows, narrating changes, comment noise.
A PR is not mergeable until its files comply.
**Why:** the codebase must be readable cold — by a reviewer, or by the author months later —
without reconstructing context from git history or the docs. Comments carry the orientation layer;
the decision log carries the reasoning layer; they link via D-IDs.
**Status:** Accepted (applied retroactively to MS-0/MS-1 code in the same change that records it).

## D-025 — Build order: full section slices in viewport order

**Chosen over:** the original hybrid (static page frame first, interaction layers after — MS-2/MS-3
split); an all-sections static sweep followed by an interactions pass.
**Decision (user call, 2026-07-20):** from MS-2 onward, work proceeds one Section at a time in
viewport order — Navigation → Hero → Trusted By → We Are → Solutions → Value Cards → Showcase →
Tech Stack → Footer. A Section's slice includes its statics at both widths, **all** of its
interactions/animations/functionality, its tests, and its Fidelity Gate — complete before the next
Section starts. Rationale: the user follows progress on localhost; each Section must land finished,
once, giving a real visual progress indicator.
**Mechanics:** the Playwright fidelity harness still precedes everything (it is the instrument that
proves "pixel perfect" — first task of MS-2); the sticky Tab Bar's release-after-Tech-Stack
coupling is asserted provisionally in the Solutions slice and re-verified when Tech Stack lands;
page-wide properties (breakpoint sweep, a11y audit, perf, SEO, x-browser) stay a final polish
milestone because no single Section owns them. Milestones re-cut to MS-2…MS-12; issues #3–#8
re-scoped, #13–#17 created, dependency chain preserved.
**Trade-off accepted:** under deadline pressure a slice order risks a missing page tail (worse for
a fidelity-scored assessment than missing interactions). Mitigations: the user has granted schedule
flexibility (the 36h hard deadline stands), and a pre-agreed valve — if the window tightens,
remaining Sections drop to static-first with interactions in a closing pass, recorded here if used.
**Amended by [[#D-028]]:** the slice order stands, but Value Cards (MS-7) and Showcase (MS-8)
are layers of the Solutions panel rather than standalone Sections.
**Status:** Accepted.

## D-026 — Excluded artifacts leave their space behind

**Context:** the mobile design's hero column sits at y=194.76 while the header ends at 133;
the 62px between them is where the foreign gamification banner (a do-not-build artifact,
EXTRACTION.md Quirks) overlapped. MS-3 first shipped the hero flush under the header —
deleting the design's spacing along with the artifact (caught by the user, fixed same day).
**Decision:** when a do-not-build artifact is excluded, only its pixels are dropped — the
absolute positions of everything we DO build come verbatim from `file.json`
absoluteBoundingBox values, so the space the artifact occupied persists as design geometry
(here: a 62px top gap on the mobile hero, rounded from 61.76).
**Why superior:** the alternative (reflowing content to fill the hole) fabricates a layout
the designer never drew; rendered positions are the only ground truth the Extraction offers.
**Status:** Accepted.

## D-027 — Cross-engine text wrap divergence: accept the browser's break, pin the line count

**Context:** the We Are desktop statement (node 1:104, fixed 680px box) wraps differently in
Chromium than in the Figma render: Chromium fits "three" at the end of line 1 where the design
breaks before it. MS-5's independent render-diff measured the constraint window: matching the
design's line-1 break needs a content width < 679.78px while keeping the design's line-3 break
needs ≥ 678.06px — under 2px of total slack, i.e. sub-pixel margins on both sides. The engines'
static-vs-variable font instances genuinely disagree by <2px in opposite directions on different
lines; no uniform CSS transform (padding, letter-spacing, stretch) can reproduce all five breaks
robustly, and per-glyph hacks or content mutations (nbsp) poison the data layer.
**Decision:** when Figma's rendered wrap and the browser's wrap of the *same specification*
(box, family, size, spacing) diverge inside a ~2px advance window, the browser's break stands.
The numeric layer pins the block box and the design's line count (so any cascade reflow fails
loudly), plus an explicit divergence pin marking the known differing break; the ≤5% visual layer
absorbs the shifted words.
**Why superior:** a sub-2px-slack pixel hack flakes on any font-rendering change and asserts
nothing real; the spec-faithful rendering is stable, and the divergence stays visible in an
executable assert instead of silently absorbed.
**Status:** Accepted (MS-5).

---

## D-028 — Solutions is one tabbed region; the cards and showcase are per-tab panel content

**Context:** the 1440 artboard stacks tab bar (y=1836) → numbered intro block (1936–2306) →
value-card row (2306–2756) → product showcase (2829–3530) → Tech Stack (3530); the 393 artboard
stacks the same parts 1777 → 3780. Only the Data + AI tab is drawn — the file contains a block
"01" and no "02"/"03" anywhere. MS-6 read that stack as four independent Sections and built the
tab bar as scroll-spy anchor navigation over three stacked intro blocks, i.e. the "keep only 01
and treat tabs as anchors" option that EXTRACTION.md open question 2 had already rejected and
D-016 had already decided against ("real tab switcher"). The design owner confirmed the intended
flow: selecting a tab reveals that tab's entire body — intro + cards + showcase — and switching
tabs swaps all of it; the design is identical per tab, only the content differs.

**Decision:**
1. Solutions is a single tabbed Section. The sticky tab bar is a real content switcher
   (WAI-ARIA tabs: `tablist`/`tab`/`tabpanel`, `aria-selected`, arrow-key roving focus).
2. A tab's panel = numbered intro block (the number is the tab's index) + 3 value cards
   (light→dark on individual hover, note 2:3) + product showcase. They swap together.
3. Value Cards and Showcase stop being independent page Sections. The page's top-level Sections
   become Navigation, Hero, Trusted By, We Are, **Solutions (tabbed)**, Tech Stack, Footer.
4. `/api/value-cards` and `/api/showcase` fold into `/api/solutions`, which returns `tabs` plus
   one `panels` entry per tab (amends D-007's endpoint list: the tabbed region is one Section,
   so it is one endpoint — and one payload makes tab switching instant, with no per-panel
   loading flash on a control the reviewer will click repeatedly).
5. Cards and showcase content for the Custom Software and Tech Staffing panels is Authored
   Content (D-016/D-023): flagged in the payload, listed in the README assumptions. Authored
   panels have no exported product logo, so the showcase mark falls back to a typographic
   wordmark of the product name.
6. Milestones re-sliced against the corrected model — MS-6 rebuilt as contract + content +
   tabbed shell + intro; MS-7 = the per-tab card row; MS-8 = the per-tab showcase; MS-9
   unchanged and still closes the sticky-release coupling (note 1:277).

**Why superior:** the artboard's own coordinates only reconcile with the switcher. Note 1:277
scopes the sticky bar to "this section (until the Tech Stack section)", which parses only if the
cards and showcase sit inside the Section — and they do, exactly filling 1836→3530. Under the
stacked model every Section below Solutions shifts ~740px off its design y, which would have
mis-mapped every remaining Fidelity Baseline; under the switcher the rendered page matches the
artboard 1:1. The absent "02"/"03" nodes are evidence *for* the switcher (one intro block exists
because only one is ever on screen), not evidence that 02/03 need inventing as siblings.

**Trade-off accepted:** two endpoints disappear from MS-1's nine-endpoint design, and the whole
tab payload loads up front rather than per Section. MS-6 shipped wrong and is corrected by a
forward-fix PR rather than a revert (user call) — merge-commit-only history keeps both, and the
wrong model never reaches the `feat → dev` human gate.

**Status:** Accepted (MS-6 rebuild, 2026-07-20). Resolves EXTRACTION.md open question 2.

---

## D-029 — The Tech Stack marquee scrolls horizontally; the artboard is one frame of it

**Context:** designer note 2:5 reads "The Logo Blocks will be scrolling **vertically**. top & bottom
row will scroll from same direction & the middle row will scroll from opposite direction." The axis
word contradicts the rest of its own sentence ("top & bottom row", "middle row") and contradicts the
artboard, which draws three 1440x150 strips. EXTRACTION.md open question 2 proposed horizontal rows
but was never ratified; MS-9 cannot be built without settling it.

A first reading of the geometry appears to *refute* the marquee: every row's tiles sum to exactly
1440 (mobile 393), `clipsContent` is false everywhere, and no node in the region is wider than the
artboard. There is no overflowing strip and no mask.

**The geometry actually proves the opposite.** Interior tiles are all exactly 250x150; only the
first and last of each row deviate, and they decode as a single uniform strip sampled at three
different phases:

| Row | End tiles | Phase | Reconstruction (tile 250, gap 10, pitch 260) |
|-----|-----------|-------|-----------------------------------------------|
| 1 (top) | 214 … 176 | 36 | 214, 250, 250, 250, 250, 176 ✓ |
| 2 (middle) | 174 … 216 | 76 | 174, 250, 250, 250, 250, 216 ✓ |
| 3 (bottom) | 216 … 174 | 34 | 216, 250, 250, 250, 250, 174 ✓ |

Three independent confirmations: (a) every interior logo is centred in its 250px tile to the pixel;
(b) the *trimmed* tiles' logos are centred on the reconstructed 250px tile, not the visible remnant
— React's optical centre is x=89 and a phase-36 tile centres at exactly 89, mobile React at x=83
against a phase-42 centre of 83; (c) the trimmed tiles carry asymmetric `rectangleCornerRadii`
(`[0,15,15,0]`), squared on the cut side only — a tile deliberately drawn as clipped. Rows 1 and 3
sit at near-identical phases (36/34) while row 2 is displaced (76): the note's direction contrast,
frozen mid-animation.

**Decision:**
1. The three logo rows are horizontal marquees. Rows 1 and 3 travel one way, row 2 the opposite,
   per note 2:5's direction contrast. The note's word "vertically" is treated as loose phrasing for
   scrolling with the page, and is superseded by its own row language plus the geometry above.
2. The rendered strip is a uniform repeat of 250x150 tiles (mobile 250x100), `#f8f8f8`, radius 15,
   gap 10, each logo centred at its design box. Zero tiles are hand-trimmed in the build — the
   artboard's trimmed tiles are reproduced by clipping the row, which is what they depict.
3. Under `prefers-reduced-motion` the rows render static **at the artboard's phases** (36/76/34
   desktop, 42/82/40 mobile). This is what makes the Fidelity Gate possible at all: the gate forces
   `reducedMotion: 'reduce'`, so the Baseline it diffs is the settled state, and the settled state
   must be the drawn frame.
4. Overflow is clipped per row at build time. The design has no mask node, so the marquee viewport
   is ours to add; it stays inside the Tech Stack Section so it cannot become a scroll container for
   the Solutions sticky scope (which `overflow-x-clip` on the page root already protects).
5. WCAG 2.2.2 is met by hover/focus pause plus a visually-hidden pause control that reveals on
   focus. The design draws no pause affordance and the design owner declined visible pause chrome;
   a focus-revealed control keeps the mechanism reachable by keyboard and AT at zero cost to the
   Baseline.

**Why superior:** the vertical reading cannot be built without contradicting the artboard — three
rows sliding vertically past one another would break the row grid into overlaps and gaps, and it
leaves the mobile edge-bleed (T9.2) unexplained, since bleed only exists on X. The horizontal
reading is also already load-bearing elsewhere: `apps/api/src/data/tech-stack.json` has shipped
`direction: left/right/left` since MS-1, and `apps/api/test/content.test.ts` has been pinning the
invariant `top === bottom && middle !== top` green ever since. This ADR ratifies the model the
content layer already asserts rather than introducing a new one.

**Trade-off accepted:** the six end tiles the artboards draw are hand-composed — their logos are
positioned by eye rather than centred, and mobile logo scales are inconsistent (React and Go at
1.0, Python 0.94, Next.js/Django/Laravel ~0.8165). The build centres every logo uniformly and
pins the six mobile sizes the artboard fixes, deriving the other twelve at 0.8165. Small diffs
against the hand-placed end tiles are accepted rather than special-casing positions that only
exist in one frame of a moving strip.

**Status:** Accepted (MS-9, 2026-07-20). Resolves EXTRACTION.md open question 2; takes the
marquee half of open question 3 (30s linear).

---

## D-030 — Footer link order comes from the artboards; the mobile socials get their own list

**Chosen over:** keeping the shipped payload order and reversing/reordering in the Footer's JSX.
**Context:** `/api/footer` has shipped since MS-1 with `legalLinks: [Privacy Policy, Terms of Use]`
and one `socialLinks` list, pinned green by `content.test.ts`. Building MS-10 against the artboards
showed both disagree with what is drawn. Desktop draws Terms of Use at x=625 and Privacy Policy at
x=733; mobile draws Terms at y=0 and Privacy at y=44 — Terms first at **both** widths. The payload
had captured Figma's child order, which for node 1:254 is the reverse of its drawn order. Separately
the socials are ordered `Facebook, Linkedin, Instagram, Youtube` on desktop (1:258..1:261) but
`Linkedin, Youtube, Instagram, Facebook` on mobile (1:450..1:453) — a permutation, same four links.

**Decision:**
1. `legalLinks` is stored in drawn order (Terms of Use, Privacy Policy). The artboard is the
   authority on order, as it already is on text — the same reasoning that made the rendered
   characters beat the stale "DataCrunch LLC" layer name (D-017.2).
2. `FooterContent` gains `socialLinksMobile`, carrying the mobile artboard's permutation. The
   contract test asserts both orders **and** that the two are permutations of one another, so a
   future edit cannot quietly diverge the sets while keeping the orders green.

**Why superior:** the Fidelity Gate cannot pass without reproducing both orders, so the only real
question was where the knowledge lives. In the payload it is one declarative list per breakpoint,
pinned by a contract test and visible to anyone reading the content; in JSX it would be a
`.reverse()` and an index map (`[1,3,2,0]`) whose only justification is a comment. `logosMobile`
already set this precedent for Trusted By (D-017.4), whose docstring says the same thing: one list
cannot drive both breakpoints.

**Trade-off accepted:** MS-10 was scoped as a web-only slice and this reaches into
`packages/shared`, `apps/api/src/data`, and the API contract test. Taken deliberately — the
alternative hides design truth in the presentation layer, and the API half of the Footer was
otherwise complete.

**Status:** Accepted (MS-10, 2026-07-20). Confirmed by the design owner before implementation.

---

## D-031 — The Footer wordmark is a two-colour VECTOR under a tilted scrim, not gradient type

**Chosen over:** rendering it as text and back-solving a font size (the MS-6 approach for the
Solutions numeral); treating the mark as a gradient fill; treating the scrim as a vertical fade.
**Context:** the plan and `EXTRACTION.md:75` both describe "a giant gradient METATECH wordmark
bleeding off the bottom". Three parts of that are wrong, and the node tree alone does not correct
them — the render is what settles it.

**Decision:**
1. The mark is a `VECTOR` at both widths (1:262 desktop, 1:457 mobile), so its eight glyph subpaths
   ship as `fillGeometry` verbatim and there is no font to match. `targetAspectRatio` is 164:26 on
   both and mobile reconstructs as desktop x 0.273045 to the pixel, so **one viewBox drives both
   breakpoints**.
2. It is **not** a gradient. The node's `fills` reads solid white; the per-glyph colour lives in
   `fillOverrideTable`, which paints subpaths 0..3 (META) `--color-accent` and leaves 4..7 (TECH)
   white. Reading `fills` alone yields an all-white mark that still passes a careless review.
3. It does **not** bleed. Desktop 131+227 = 358 and mobile 420+62 = 482 both land flush on the
   band's bottom edge, and the glyphs are complete. The impression of bleeding is the scrim.
4. The scrim (1:264) is **desktop-only** — the mobile artboard draws none, which is why its mark
   stays crisp — and it is **tilted**. Its handles read (0.534,1.0) → (0.535,0.128); denormalised as
   (dx·W, dy·H) that is a 1px lean over 198px, i.e. vertical. Denormalising a direction out of
   Figma's unit square needs the box aspect, so the horizontal term carries a further W/H = 6.34 and
   the true axis is (6.40, −198.0). Over a 1432-wide mark that swings alpha by ~0.2 across the band.
5. The mark is decorative (`aria-hidden`): the nav logo and the copyright line already say the name.

**Why superior:** every part is falsifiable against the committed render rather than the node dump.
Recovering alpha from the glyphs (`a = (255 − observed)/233` on the white half, `(249 − observed)/227`
on the green) reproduces the model to within 0.007 across the full width, and correcting the tilt
took the mark region from 9.82% to **0.07%** against the design render.

**Trade-off accepted:** the tilt is invisible at a glance and the gate's 5% budget absorbed it
comfortably — it was only caught because the per-slice independent diff is run every milestone.
The CSS carries three derived constants (181.85deg, 50.45px, 248.56px) that cannot be read back off
the node, so the derivation is written out where they are used.

**Status:** Accepted (MS-10, 2026-07-20). Corrects the "gradient wordmark bleeding off bottom"
phrasing in the plan and `EXTRACTION.md:75`.

---

## D-032 — The mobile footer deviates from the artboard by 30px, so its Baseline is build-sourced

**Chosen over:** staying pixel-faithful (flush, as the artboard draws it); removing the deviation's
gate coverage entirely.
**Context:** on mobile the design owner found the footer cramped — "Terms of Use" jams against the
Tech Stack seam above it. Investigation (file.json + the design render) confirmed this is faithful:
the mobile footer frame (node 1:442) starts at y=4490, the footer band's exact top edge, with zero
top padding, while the **desktop** footer breathes at 68px (node 1:250 at y=4448). So the mobile
artboard genuinely draws it flush; the cramping is a real design inconsistency, not a build bug.

The same investigation cleared the adjacent suspicion: the mobile `h-[22px]` strip between We Are
and Solutions is **not** a stray spacer. We Are (1:358) ends at y=1754.76 and the Solutions gray
(1:280) starts at y=1777.00, a genuine 22.24px white gap the artboard draws. It was kept; removing
it would shift every mobile Section below up 22px and diverge from the render.

**Decision:** add 30px of top padding to the mobile footer column (`FooterStack`, `pt-[30px]`,
mobile-only), giving the dark band the breathing room desktop already has. This is a deliberate
deviation from the artboard, ratified by the design owner.

Because the deviation has no render pixel to slice against, the footer-mobile Baseline is captured
from the **build**, not the render: `FidelityTarget` gains a `deviated` flag (the decision ID), the
slicer skips flagged targets, and `pnpm --filter web fidelity:baseline:build` regenerates them
through the gate's exact screenshot path. The numeric layer carries the intended geometry (links at
4433+30, band 512, page 4945), so the deviation is pinned, not merely tolerated.

**Why superior:** the artboard is authoritative on what the design *is*, but the design owner is
authoritative on what ships, and here the two differ by a defensible 30px that also brings mobile
into line with desktop. Sourcing just this one Baseline from the build — rather than dropping its
visual test or globally trusting build screenshots — keeps a real regression guard (the wordmark
render included) while being explicit that this region no longer tracks the render.

**Trade-off accepted:** one Baseline is now build-sourced, a documented exception to D-021's
"Baselines from design, never build-over-build drift." Contained by the `deviated` flag (so the
slicer can never silently overwrite it) and the numeric asserts (which fail loudly if the geometry
drifts). Everything else in the gate stays render-sourced.

**Status:** Accepted (MS-11 polish, 2026-07-21). Design owner's call; the flush-footer and
kept-22px-strip alternatives were both presented and declined/confirmed respectively.

---

## Open questions (tracked; each resolves into a numbered decision)

1. Hamburger menu open state (undesigned) — proposed: full-screen dark-green overlay in brand style,
   staggered link reveal; proceeding on this documented recommendation unless vetoed.
2. ~~Marquee axis~~ — **resolved by [[#D-029]]**: horizontal rows, alternating direction.
3. Motion system (durations/easings unspecified) — proposed: 200–300ms ease-out standard, documented
   as the motion scale. The marquee's 30s linear is settled by [[#D-029]]; the rest stands open.
4. Cloudflare deployment specifics (Workers static assets vs Pages, monorepo config, custom domain)
   — research in flight; resolves into D-011 config notes.
