# Design Extraction — Findings & Coverage Tracker

Source: Figma file `uraGfsYkol0bQjarrnhhfs` ("Technical Assesment (SFE)", last modified 2026-07-02), view-only access.
Method: one-shot Figma REST API pull (2026-07-19) under the view-seat cap of ~6 Tier-1 requests/month.
All design questions must be answered from the artifacts below — never re-call the API without checking the budget ledger.

## API budget ledger

| # | Endpoint | Purpose | Tier | Status |
|---|----------|---------|------|--------|
| 1 | `GET /v1/files/:key?geometry=paths` | Full node tree + vector geometry | 1 | ✅ 2026-07-19 |
| 2 | `GET /v1/files/:key/images` | All bitmap fill URLs | 1 | ✅ 2026-07-19 |
| 3 | `GET /v1/images/:key` (5 ids, png@2x) | Frame renders | 1 | ✅ 2026-07-19 |
| — | `GET /v1/files/:key/comments` | Comment pins (returned 0) | 2 (separate pool) | ✅ 2026-07-19 |
| 4–6 | reserved | contingency only | 1 | 🔒 ~3 remaining this month |

Token: `~/.figma-token` (chmod 600, never committed).

## Coverage tracker — all 11 top-level frames (Page 1, the only page)

| Frame | ID | Size | JSON | Render @2x | Tree dump | Visually reviewed |
|-------|----|------|:----:|:----------:|:---------:|:-----------------:|
| Web View (desktop) | 1:34 | 1440×4738 | ✅ | ✅ `renders/1-34.png` | ✅ `tree-desktop.txt` | ✅ |
| Mobile Responsive View | 1:279 | 393×4972 | ✅ | ✅ `renders/1-279.png` | ✅ `tree-mobile.txt` | ✅ |
| Nav - Solutions (default) | 1:459 | 1400×444 | ✅ | ✅ `renders/1-459.png` | ✅ `tree-nav-solutions.txt` | ✅ |
| Nav - Solutions (hover) | 1:481 | 1400×444 | ✅ | ✅ `renders/1-481.png` | ✅ `tree-nav-solutions.txt` | ✅ |
| Card hover states ×3 | 2:36 | 457×1380 | ✅ | ✅ `renders/2-36.png` | ✅ `tree-card-hover.txt` | ✅ |
| Note: Sticky Tab Navigation | 1:277 | note | ✅ | n/a (text) | ✅ `designer-notes.txt` | ✅ |
| Note: Card Section | 2:3 | note | ✅ | n/a | ✅ | ✅ |
| Note: Tech Stack | 2:5 | note | ✅ | n/a | ✅ | ✅ |
| Note: Play Button | 1:510 | note | ✅ | n/a | ✅ | ✅ |
| Note: header menu | 1:512 | note | ✅ | n/a | ✅ | ✅ |
| Note: Hover view | 1:514 | note | ✅ | n/a | ✅ | ✅ |

Completeness proofs: 489/489 nodes in JSON · 29/29 node-referenced images on disk (55 downloaded; 26 extra are unreferenced leftovers) · 0 Figma comment pins · hidden nodes identified (see Quirks) · prototype interactions checked (1 empty stub on mobile Header, nothing meaningful) · all named vectors carry `fillGeometry` (SVG-reconstructable offline).

## Design tokens

**Fonts** (all Google Fonts):
- Bricolage Grotesque — display/headings. w800 at 72 (hero D), 48 (hero M, showcase D), 32 (H2 D / showcase M), 30 (menu tiles), 28/24 (H2 M), 21 (We-Are M), 120 ("01" M numeral; desktop "01" is a 147×117 vector); w600/w400 18 (eyebrows, notes).
- Manrope — body/UI. w700 14 (nav, buttons, footer D), w400/500 18 (body D), 14 (body M), w300 16/14 (hero sub), w800 14 ("Book a meeting").
- Inter & ABeeZee — ONLY in mobile leftovers/status bar. Do not ship.

**Colors**:
| Token | Value | Role |
|-------|-------|------|
| accent | `#33F987` | green highlights, buttons, hover headings, logo "META" |
| dark surface | `#161616` | header/mega-menu panel, footer, active tab pill, default card heading |
| deep green | `#032019` | hero/mobile-top background, card hover bg |
| tile black | `#000000` | mega-menu tiles |
| white | `#FFFFFF` | light sections, cards, body-on-dark |
| light gray | `#F8F8F8` / `#E9EDF0` | tab/cards section bg (D/M), logo tiles |
| showcase green | `#21A356`-ish flat green (mobile sampled; verify exact node fill at build time) | AmiCredible section |
| button gray | `#505050` | "Book a meeting" pill |

**Radii**: 25 (header bar/panel), 20 (menu tiles), 15 (cards, buttons, logo tiles). Common pill buttons: pad 10/35, r=15.

## Section inventory (desktop order; mobile = same order, single column)

> **Reading note (added 2026-07-20, D-028):** this list enumerates the artboard's *vertical
> stack*, not the page's Sections. Items 5–7 (sticky tabs + "01" block, value cards, AmiCredible
> showcase) are one tabbed Section: the tab bar switches a panel whose body is all three, which
> is why note 1:277 scopes the sticky bar to "this section (until the Tech Stack section)" and
> why only "01" is drawn. MS-6 initially misread items 5/6/7 as three independent Sections —
> see D-028 before building against this inventory.

1. **Nav** — floating rounded bar; logo (vector, geometry captured) + Solutions/Showcase/Contact + "Book a meeting". Mobile: pill nav + hamburger only (no open state designed).
2. **Hero** — dark green; 72px headline with per-character green spans (captured as style overrides: green `#33F987` vs white); sub-copy + "Book for Demo"; photo block (1400×571, notch cutout holding circular play button → video modal, popup design is ours) + translucent METATECH watermark. Mobile: play button sits above photo.
3. **Trusted-by** — 2×4 logo grid (Databricks, GCloud, UiPath, Alteryx, Alteryx, Figma, AWS, GCloud — duplicates ARE in the design). Mobile: 2 cols × 4 rows.
4. **We Are />** — bold statement, bold-into-regular run-on text (as designed).
5. **Sticky tabs + "01" block** — pill tab bar (Data + AI active dark / Custom Software / Tech Staffing), sticky until past Tech Stack section (note 1:277). One numbered block only ("01" / "Data + AI Settings Innovation" + copy + CTA). No 02/03 anywhere. Mobile: tab row overflows viewport («Tech Staf» clipped) → horizontally scrollable.
6. **Value cards** — 3 white cards (457×450 fixed, r=15, heading `#161616`); hover → `#032019` bg, `#33F987` heading, white body appears (full copy captured for all 3 in frame 2:36). Note 2:3: animate light→dark per card. Mobile shows only card 1 (open question).
7. **AmiCredible showcase** — green section; white logo (bitmap captured); heading/copy/ghost "Explore more →"; tablet photo card + 4 carousel dot indicators (2nd elongated = active; no arrows).
8. **Tech Stacks** — heading block + 3 rows × 6 logo tiles (18 captured: React, Next, Tailwind, TS, Angular, Vue / Go, Python, Node, .NET, Ruby, PHP / Django, Laravel, Flutter, MySQL, MongoDB, HTML5). Note 2:5: vertical marquee — top & bottom rows same direction, middle opposite. Mobile: rows bleed off both edges, per-row offsets.
9. **Footer** — dark; copyright «@2022-2026 MetaTech LLC // All Rights Reserved» (green spans) + Privacy/Terms + 4 socials; giant gradient METATECH wordmark bleeding off bottom.

## Interaction spec (from designer notes + state frames)

| Interaction | Source | Spec |
|---|---|---|
| Mega-menu | note 1:512 + 1:459/1:481 | Hover "Solutions" → panel extends from header (#161616, r=25); 3 black tiles (order by x: **Custom Software / Data+AI / Tech Staff**), green headings; hovering a tile fades in its full-bleed image + heading→white (1:481 shows all three hovered = composite reference, not runtime state). Tile images are among downloaded bitmaps. |
| Sticky tabs | note 1:277 | Tab bar sticky through section, released after Tech Stack section. |
| Card hover | note 2:3 + 2:36 | Light→dark animate per card; spec above. |
| Logo marquee | note 2:5 | Rows scroll vertically… (sic — rows are horizontal strips; motion direction: top/bottom same, middle opposite). Treat exact axis as build-time judgment; mobile edge-bleed supports horizontal marquee reading. |
| Play button | note 1:510 | Click → video popup; popup design at our discretion. |
| Menu tile preview | note 1:514 | Image preview per solution option, individually on hover. |

## Quirks & do-not-build artifacts

- Mobile frame includes iOS status bar (`_StatusBar-time` instance, notch/wifi/battery vectors, ABeeZee "4:14 PM") — device chrome, not product UI.
- Hidden leftovers in mobile JSON: TEXT «Get Started!» (1:281), Frame 118 (1:306), plus a visible-in-JSON gamification banner («🏆 You're ranked #122!…» / «See Leaderboard →», Inter) — foreign artifacts; exclude.
- Copy oddities faithful to the design: "Data + AI **Settings** Innovation" (likely typo for "Setting"?), "@2022-2026" (not ©), We-Are bold-run-on punctuation, duplicated Alteryx/UiPath/GCloud logo tiles.
- Layer-name vs text mismatch: footer layer named "DataCrunch LLC", rendered text "MetaTech LLC" (text wins).

## Open questions → resolve in /plan (each becomes a recorded decision)

1. Mobile value cards: stack all 3, or carousel, or faithfully show only card 1?
2. ~~Tabs "Custom Software"/"Tech Staffing": no designed content (no 02/03) — swap content with placeholder copy, or keep only 01 and treat tabs as anchors?~~ **Resolved by D-016 + D-028:** real tab switcher; each tab swaps a whole panel (intro + cards + showcase), with the two undesigned panels' content authored. "No 02/03 anywhere" is evidence *for* the switcher — only one panel is ever on screen.
3. Hamburger menu open state: undes igned — invent (record as assumption).
4. Marquee axis (horizontal strips vs note's "vertically") + speeds; reduced-motion fallback.
5. Mega-menu behavior details: trigger/dismiss timing, mobile equivalent (none designed), keyboard/touch a11y.
6. Animation durations/easings: unspecified everywhere — define a motion system, record as ADR.
7. Copy typos: reproduce faithfully (pixel-perfect mandate) vs fix (note in README). 
8. Publish `design/figma/` in the public repo? (company IP consideration.)
9. Card hover: bg/text transition choreography; body reveal style.

## Artifact map

```
design/
  EXTRACTION.md            ← this file
  figma/
    file.json              complete node tree + vector geometry (793 KB) — source of truth
    fills.json             imageRef → S3 URL map (URLs expire; images already saved)
    renders.json           render request/URL record
    comments.json          comment-pin check (empty)
    images/                55 bitmaps keyed by imageRef (logos, photos, menu tile images)
    renders/               5 frame renders @2x + slices/ (14 top-anchored 2000px viewing segments)
    tree-desktop.txt       greppable layout dumps (sizes, auto-layout, padding, text, fonts)
    tree-mobile.txt
    tree-nav-solutions.txt
    tree-card-hover.txt
    designer-notes.txt     all 6 annotation texts
```
