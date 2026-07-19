# MetaTech Landing (dc-assessment)

Pixel-faithful build of the MetaTech marketing page: a React SPA fed entirely by a typed Express
content API. Live: https://metatech.saddathasan.dev

> Interim README — the full write-up (structure, technologies, assumptions, decisions) lands with
> MS-7. Vocabulary: [CONTEXT.md](CONTEXT.md) · decisions: [docs/DECISIONS.md](docs/DECISIONS.md).

## Run locally

Requires Node ≥ 24 and pnpm 10 (`corepack enable` if you don't have it).

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5173** — Vite serves the app and proxies `/api` to Express on :3001.

Demo the per-section loading/error states straight from the URL:

- `http://localhost:5173/?delay=2000` — every section fetch is delayed → skeletons
- `http://localhost:5173/?fail=true` — every section fetch fails → error + retry

## Checks

```sh
pnpm test        # all workspace test suites
pnpm typecheck   # both apps against the shared Content Contract
pnpm lint        # oxlint (web)
```
