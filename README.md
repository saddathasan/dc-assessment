# MetaTech Landing (dc-assessment)

A pixel-faithful build of the MetaTech marketing page: a React SPA fed entirely by a typed Express
content API, reconstructed from a one-shot Figma extraction and held to a visual-regression gate at
the design's own artboard widths.

**Live: https://metatech.saddathasan.dev**

## Run locally

Requires **Node ≥ 24** and **pnpm 10** (`corepack enable` if you don't have it).

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5173** — Vite serves the app and proxies `/api` to Express on **:3001**.
Both start together; `pnpm dev` runs them in parallel.

Demo the per-section loading and error states straight from the URL — the params are forwarded from
the page URL to every section fetch (these also work on the live site):

- `…/?delay=2000` — every fetch delayed → skeletons (capped at 10s)
- `…/?fail=true` — every fetch 500s → error state + a working "Try again"

## Checks

```sh
pnpm test        # unit + contract suites (web 56, api 22)
pnpm fidelity    # Fidelity Gate — Playwright, 92 tests at 1440 and 393
pnpm typecheck   # both apps against the shared Content Contract
pnpm build       # production build
pnpm lint        # oxlint (web)
```

`pnpm fidelity` starts its own dev servers, or reuses yours if `pnpm dev` is already running.

> **Known flake:** root `pnpm lint` intermittently exits with *"Linter process terminated abnormally
> (possibly out of memory)"* under parallel workspace execution. Use
> `pnpm -r --workspace-concurrency=1 run lint` — same result, reliably.

## Deploy

One Cloudflare Worker serves everything: the built SPA as static assets, plus Express on `/api/*`
via `httpServerHandler` (see `apps/api/wrangler.jsonc`).

```sh
pnpm --filter web build && pnpm --filter api exec wrangler deploy
```

Needs `CLOUDFLARE_API_TOKEN` in the environment. The web build must run first — the Worker uploads
`apps/web/dist` as its asset directory.

---

## Technologies, and why

Every choice is defended at length in [docs/DECISIONS.md](docs/DECISIONS.md); the short version:

| Choice | Why (over the alternative) |
|---|---|
| **TypeScript everywhere** (D-002) | One language lets the API's content contract be typed **once** in `packages/shared` and imported by both apps — compile-time proof the frontend and backend agree on every JSON shape. |
| **Vite 8** (D-003) | CRA is deprecated; Vite is the current standard — instant HMR, first-class TS. |
| **React 19** | The brief's framework. |
| **Tailwind CSS v4, CSS-first** (D-005) | `@theme` maps the extracted Figma tokens 1:1 into named design tokens — a real, inspectable token system, and the fastest path to pixel-fidelity. No JS config; the whole theme is `apps/web/src/styles/index.css`. |
| **TanStack Router + Query** (D-008/D-014) | Type-safe routing; Query owns the server-cache layer (retry/caching) while React Context owns UI state — the brief asked for Context/hooks state management, and this split honours that (Query is a data cache, not a client-state manager). |
| **Express 5 on Node 24** (D-004) | One language across the repo; Express 5 auto-forwards async rejections to error middleware. The content is static JSON on disk, one file per section. |
| **Cloudflare Worker** (D-011) | A single Worker serves the SPA's static assets *and* Express on `/api/*` (via `nodejs_compat` + `httpServerHandler`) — same-origin, no CORS, mirroring the local dev topology exactly. |
| **Playwright Fidelity Gate** (D-021) | "Pixel-faithful" is a claim that needs a test. Baselines are sliced from the Figma renders, so the gate measures drift from the *design*, not from a prior build. |

---

## Where to look

**Every source file opens with a header saying what it is and why it exists, and every export
carries a one-line docblock** (enforced, D-024). Decision IDs like `D-029` are cited inline wherever
a decision shapes the code — grep the ID in `docs/DECISIONS.md` for the reasoning. Reading the file
you landed on is usually faster than reading docs about it.

| Question | Where |
|---|---|
| *Why is it built this way?* | **[docs/DECISIONS.md](docs/DECISIONS.md)** — 35 numbered ADRs: what was chosen, what over, and why. The primary reference. |
| *What does this term mean?* | [CONTEXT.md](CONTEXT.md) — project vocabulary (Section, Slice, Extraction, Authored Content…). |
| *What does the design actually say?* | `design/figma/` — the one-shot API pull: `file.json` (node tree with geometry, fills, text styles), `renders/` (@2x artboard PNGs), `tree-*.txt` (readable outlines). Audited in [design/EXTRACTION.md](design/EXTRACTION.md). **The only design source — never the live Figma file.** |
| *What's built / decided?* | [docs/plans/metatech-landing.md](docs/plans/metatech-landing.md) — milestone tracker. |
| *What was the technical design?* | [docs/TRD.md](docs/TRD.md) |
| *What was actually asked for?* | [docs/Assessment_Senior_Frontend_Engineer.md](docs/Assessment_Senior_Frontend_Engineer.md) — the brief. |

### Repo map

```
apps/web/                     React 19 + Vite 8 + Tailwind v4 + TanStack Router/Query
  src/components/
    LandingPage.tsx           page composition — all 7 Sections in design order
    ui/SectionBoundary.tsx    the only shared primitive: loading/error/content switch
  src/sections/<Name>/        one folder per Section (see the pattern below)
  src/hooks/useSectionQuery.ts   one typed React Query call per Section
  src/lib/sections.ts         slug → payload type map, fetch, demo params
  src/lib/solutionDeepLink.ts  mega-menu tile → Solutions tab channel (D-033)
  src/styles/index.css        ALL design tokens (Tailwind v4 has no JS config)
  tests/fidelity/             the Fidelity Gate (below)

apps/api/                     Express 5 on Node 24
  src/data/*.json             every word of page copy, one file per Section
  src/routes/content.ts       slug → payload, generated from one map
  src/middleware/             ?delay / ?fail demo affordances, JSON 404s and errors
  src/worker.ts               Cloudflare entry — wraps the same app
  test/content.test.ts        contract tests: pin the exact copy and structure

packages/shared/src/index.ts  the Content Contract — types only, shared by both apps
```

### How a Section is built

All seven follow the same shape (`TechStack/` and `Footer/` are the clearest):

```
sections/<Name>/
  <Name>.tsx            entry: useSectionQuery(slug) → SectionBoundary → private Layout
  <Name>Skeleton.tsx    layout-matched placeholder, holding the same band height
  <Name>.test.tsx       data contract + interaction rules (never pixels)
  <Name><Part>.tsx      sub-components for non-trivial regions
```

- **No copy is hardcoded.** Every string comes from `/api/<slug>`. A literal in a Section is a
  Tailwind class or a design-note comment, never content.
- **Geometry is transcribed, not approximated.** Arbitrary Tailwind values carry the exact px from
  the Figma node (`h-[850px]`, `tracking-[-0.7px]`), and the comment beside an odd number says which
  node it came from and why it is load-bearing.

### The Fidelity Gate

```sh
pnpm fidelity                       # run it
pnpm --filter web fidelity:slice    # regenerate Baselines from the design renders
```

- **Baselines are cut from the Figma renders**, not from previous builds — the gate measures drift
  from the *design*. Never auto-recorded.
- **Two widths**, the two the artboards specify: 1440 and 393.
- **Two layers per Section:** a screenshot diff (≤5%, absorbing Figma-vs-Chromium antialiasing) plus
  zero-tolerance numeric asserts on computed styles and geometry. The numeric layer is authoritative.
- **Deviations** from the design (footer padding, AA contrast) carry a `deviated` flag and a
  build-sourced baseline, so an intentional departure is explicit rather than silent drift.

---

## Assumptions

Where the brief or the design left a gap, these are the calls made (each traceable to an ADR):

- **Authored content** (D-016, D-023). The artboard fully specifies only the first Solutions tab
  (Custom Software). The other two tabs' copy — headings, value cards, and the **Fieldmark** /
  **Rampline** product spotlights — is authored to match the brand voice; `authored: true` marks it
  in the payload. The Tech Staffing showcase is a category shift (a platform MetaTech runs for
  itself, vs. products built for a client), authored as such.
- **Solutions is one tabbed Section** (D-028). The design reads as one tabbed region — the value
  cards and product showcase are per-tab *panel content*, not standalone sections. So the page has
  **7** top-level Sections, and `/api/solutions` carries `tabs` + `panels` (there is no
  `/api/value-cards` or `/api/showcase`).
- **Copy corrections** (D-017). The rendered text wins over stale layer names: the footer reads
  "MetaTech LLC" (the layer was named "DataCrunch LLC") and "©2022-2026" (drawn as "@2022-2026").
- **Undesigned states, built on a documented recommendation:** the mobile hamburger's open state
  (a full-screen brand-green overlay with a staggered reveal) and the motion system (200–300ms
  ease-out, all motion `prefers-reduced-motion`-gated).
- **The Tech Stack rows are marquees** (D-029). The artboard shows one *frame* of a scrolling strip;
  the row directions ship in the content layer and are pinned by a contract test.
- **Placeholder links.** `#privacy` / `#terms` and the four socials point at real destinations;
  `#contact` (and the "Book a meeting" / "Book for Demo" CTAs) and the mega-menu deep-links resolve
  in-page or are documented placeholders — there is no contact section in the brief.
- **Intentional deviations from the artboard**, for reasons the artboard couldn't foresee:
  mobile footer breathing room (D-032), WCAG-AA colour changes to the showcase green and nav CTA
  (D-034), and the 1024–1440 responsive clamp (D-035). Each is documented and gate-tracked.

## Future improvements

- **Contact + real CTAs.** The `#contact` targets are placeholders; a contact section or form is the
  obvious next slice.
- **A designed mid-width.** 1024–1440 is currently *clamped* to avoid clipping (D-035); a real
  designed breakpoint (or a stacked Solutions layout) would be better than shrink-to-fit.
- **Responsive images.** The hero is a single WebP; per-width `srcset` variants and a CMS-driven
  image pipeline would trim mobile bytes further.
- **Content source.** Copy is static JSON on disk; a headless CMS (or even MDX) would let non-devs
  edit without a deploy.
- **The video modal** eagerly builds its YouTube iframe on open; a facade (poster + click-to-load)
  would avoid the third-party cost entirely for users who never play it.
- **Deeper a11y polish** (a skip link, richer live-region messaging) beyond the axe-clean baseline.

---

## Status

Seven Sections, complete and polished top-to-bottom: Navigation · Hero · Trusted By · We Are ·
Solutions (tabbed) · Tech Stack · Footer. The build lands on the artboard end to end (**4738px** at
1440, **4945px** at 393) and holds cleanly across the 1024–1440 laptop band and down to mobile.

- Fidelity Gate **92/92** · web **56/56** · api **22/22** · typecheck / lint / build clean.
- Lighthouse (production): **desktop 94/96/100/92 · mobile 92/100/100/92** — every category ≥90,
  accessibility 100, LCP 2.7s, CLS 0.
- Cross-browser verified on Chromium, WebKit (Safari), and Firefox — desktop and mobile.
