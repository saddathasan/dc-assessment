# MetaTech Landing (dc-assessment)

Pixel-faithful build of the MetaTech marketing page: a React SPA fed entirely by a typed Express
content API. Live: **https://metatech.saddathasan.dev**

> Interim README — the full write-up (assumptions, future improvements, technology rationale)
> lands with MS-12 (Ship). What follows is enough to run the project and to find the answer to
> almost any question about it.

## Run locally

Requires **Node ≥ 24** and **pnpm 10** (`corepack enable` if you don't have it).

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5173** — Vite serves the app and proxies `/api` to Express on **:3001**.
Both start together; `pnpm dev` runs them in parallel.

Demo the per-section loading and error states straight from the URL — the params are forwarded
from the page URL to every section fetch:

- `http://localhost:5173/?delay=2000` — every fetch delayed → skeletons (capped at 10s)
- `http://localhost:5173/?fail=true` — every fetch 500s → error + retry button

## Checks

```sh
pnpm test        # unit + contract suites (web 56, api 22)
pnpm fidelity    # Fidelity Gate — Playwright, 83 tests at 1440 and 393
pnpm typecheck   # both apps against the shared Content Contract
pnpm build       # production build
pnpm lint        # oxlint (web only)
```

`pnpm fidelity` starts its own dev servers, or reuses yours if `pnpm dev` is already running.

> **Known flake:** root `pnpm lint` intermittently exits with *"Linter process terminated
> abnormally (possibly out of memory)"* under parallel workspace execution. Use
> `pnpm -r --workspace-concurrency=1 run lint` — same result, reliably.

## Deploy

One Cloudflare Worker serves everything: the built SPA as static assets, plus Express on
`/api/*` via `httpServerHandler` (see `apps/api/wrangler.jsonc`).

```sh
pnpm --filter web build && pnpm --filter api exec wrangler deploy
```

Needs `CLOUDFLARE_API_TOKEN` in the environment. The web build must run first — the Worker
uploads `apps/web/dist` as its asset directory.

---

## Where to look

**Start here: every source file opens with a header saying what it is and why it exists, and
every export carries a one-line docblock** (this is enforced, D-024). Decision IDs like `D-029`
are cited inline wherever a decision shapes the code — grep the ID in `docs/DECISIONS.md` for the
full reasoning. In practice, reading the file you landed on is usually faster than reading docs
about it.

| Question | Where |
|---|---|
| *Why is it built this way?* | **[docs/DECISIONS.md](docs/DECISIONS.md)** — 31 numbered ADRs: what was chosen, what over, and why. The primary reference. |
| *What does this term mean?* | [CONTEXT.md](CONTEXT.md) — project vocabulary (Section, Slice, Extraction, Authored Content…). Words are used precisely here. |
| *What does the design actually say?* | `design/figma/` — the one-shot API pull. `file.json` (node tree with geometry, fills, text styles), `renders/` (@2x artboard PNGs), `tree-*.txt` (readable outlines). Audited in [design/EXTRACTION.md](design/EXTRACTION.md). **This is the only design source — never the live Figma file.** |
| *What's built, what's next?* | [docs/plans/metatech-landing.md](docs/plans/metatech-landing.md) — milestone tracker with per-task status and acceptance criteria. |
| *What was the technical design?* | [docs/TRD.md](docs/TRD.md) |
| *What was actually asked for?* | [docs/Assessment_Senior_Frontend_Engineer.md](docs/Assessment_Senior_Frontend_Engineer.md) — the brief whose rubric drives all scope decisions. |

### Repo map

```
apps/web/                     React 19 + Vite 8 + Tailwind v4 + TanStack Router/Query
  src/components/
    LandingPage.tsx           page composition — all 7 Sections in design order, with
                              the seams and spacers the artboards require
    ui/SectionBoundary.tsx    the only shared primitive: loading/error/content switch
  src/sections/<Name>/        one folder per Section (see the pattern below)
  src/hooks/useSectionQuery.ts   one typed React Query call per Section
  src/lib/sections.ts         slug → payload type map, fetch, demo params
  src/styles/index.css        ALL design tokens — colours, fonts, type scale, radii,
                              keyframes. Tailwind v4 has no JS config; this is it.
  tests/fidelity/             the Fidelity Gate (below)

apps/api/                     Express 5 on Node 24
  src/data/*.json             every word of page copy lives here, one file per Section
  src/routes/content.ts       slug → payload, generated from one map
  src/middleware/             ?delay / ?fail demo affordances, JSON 404s and errors
  src/worker.ts               Cloudflare entry — wraps the same app
  test/content.test.ts        contract tests: pins the exact copy and structure

packages/shared/src/index.ts  the Content Contract — types only, shared by both apps
```

### How a Section is built

All seven follow the same shape, so learning one teaches the rest. `TechStack/` and `Footer/`
are the clearest examples:

```
sections/<Name>/
  <Name>.tsx            entry: useSectionQuery(slug) → SectionBoundary → private Layout
  <Name>Skeleton.tsx    layout-matched placeholder, holding the same band height
  <Name>.test.tsx       data contract + interaction rules (never pixels)
  <Name><Part>.tsx      sub-components for non-trivial regions
```

Two conventions worth knowing before reading any of them:

- **No copy is hardcoded.** Every string comes from `/api/<slug>`. A literal in a Section is a
  Tailwind class or a design-note comment, never content.
- **Geometry is transcribed, not approximated.** Arbitrary Tailwind values carry the exact px
  from the Figma node (`h-[850px]`, `tracking-[-0.7px]`, `text-[18px]/[24px]`), and the comment
  beside an odd number explains which node it came from and why it is load-bearing.

### The Fidelity Gate

How "pixel-faithful" is kept honest, and the first place to look if a visual change breaks.

```sh
pnpm fidelity                       # run it
pnpm --filter web fidelity:slice    # regenerate Baselines from the design renders
```

- **Baselines are cut from the Figma renders**, not from previous builds — so the gate measures
  drift from the *design*, not from yesterday's screenshot. Never auto-recorded.
- **Two widths**, the two the artboards specify: 1440 and 393.
- **Two layers per Section:** a screenshot diff with a ≤5% budget (absorbing Figma-vs-Chromium
  antialiasing), plus zero-tolerance numeric asserts on computed styles and geometry. The numeric
  layer is the authoritative one — the 5% budget is wide enough to hide a real defect, which is
  why `tests/fidelity/sections.ts` carries every crop box with its source node id.

---

## Design and status snapshot

Seven Sections, complete top-to-bottom: Navigation · Hero · Trusted By · We Are · Solutions
(tabbed) · Tech Stack · Footer. The build lands on the artboard end to end — the page measures
**4738px** at 1440 and **4915px** at 393, which the gate asserts.

Current state and remaining work (page polish, then ship) are tracked in
[docs/plans/metatech-landing.md](docs/plans/metatech-landing.md).
