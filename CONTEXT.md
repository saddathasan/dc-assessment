# MetaTech Landing (dc-assessment)

The assessment build of the "MetaTech" marketing landing page: a React SPA fed by an Express
content API, implemented pixel-faithfully from an extracted Figma design under a timed window.

## Language

**Assessment Brief**:
The requirements document (`docs/Assessment_Senior_Frontend_Engineer.md`) whose rubric drives all
scope and priority decisions.
_Avoid_: spec (reserved for the TRD), requirements doc

**Extraction**:
The one-shot Figma data pull in `design/` (node JSON, images, renders) plus its audit
(`design/EXTRACTION.md`); the single source of design truth — never the live Figma file.
_Avoid_: "the Figma" (implies a live dependency we deliberately don't have)

**Section**:
One of the 9 vertical page regions: Navigation, Hero, Trusted By, We Are, Solutions, Value Cards,
Showcase, Tech Stack, Footer. Each Section owns exactly one API endpoint and its own
loading/error UI.
_Avoid_: block, area, module

**Solution**:
One of MetaTech's three strategic pillars — Data + AI, Custom Software, Tech Staffing. A Solution
renders on two Surfaces with different copy; its shared identity is a `SolutionId` in the Content
Contract, but payloads stay denormalized per Section.
_Avoid_: service, pillar, offering

**Surface**:
A distinct place where a domain concept renders. A Solution has two Surfaces: its Mega-menu Tile
and its Solution Block.

**Mega-menu**:
The panel that extends from Navigation when "Solutions" is hovered/tapped; holds three Tiles whose
background images reveal individually on hover.

**Solution Block**:
A numbered content block ("01", "02", "03") in the Solutions Section — one per Solution, shown by
the Tab Bar.

**Tab Bar**:
The pill navigation (one tab per Solution) that pins while scrolling the Solutions Section and
releases after the Tech Stack Section (Designer Note 1:277).
_Avoid_: sticky nav (that's a behavior, not the thing)

**Value Card**:
One of three cards (Data Integrity First / Workflows Before Automation / Governance With Same
Standard). Light with heading-only at rest, dark with body copy on hover (desktop); permanently
dark inside a swipe carousel (mobile).

**Designer Note**:
One of the 6 canvas annotations in the design file specifying interaction intent. Treated as
requirements, equal in authority to the visuals.

**Extracted Content**:
Copy and values taken verbatim from the Extraction.

**Authored Content**:
Content we wrote where the design is silent (Solution Blocks 02/03, hamburger menu). Every piece
is flagged as authored in the README.

**Content Contract**:
The shared TypeScript types defining every Section's payload — the compile-time agreement between
API and frontend.
_Avoid_: schema, models

**Baseline**:
A Figma render from the Extraction used as the reference image in the Fidelity Gate.

**Fidelity Gate**:
The acceptance criterion for "matches the design": per-Section visual diff ≤ 5% against the
Baseline at 1440px and 393px, plus exact numeric assertions on computed styles (D-021).

**Milestone (MS-N)**:
A session-sized unit of work owning acceptance criteria and tests; maps 1:1 to a GitHub issue and
an `ms/N-<slug>` branch. Not GitHub's "Milestone" object — we use plain issues.
_Avoid_: phase, sprint

**The Window**:
The delivery constraint: 36 hours hard limit from 2026-07-19 ~19:00 (+06), 24-hour target.

## Flagged ambiguities

- **"Solutions" (resolved)**: a bare "solutions" is banned. Use **Solution** (the pillar),
  **Solutions Section** (the tabbed page region), or **Mega-menu** (the nav surface).
- **"Milestone" (resolved)**: always ours (MS-N), never GitHub's Milestone feature, never the
  Assessment Brief's four timed phases — call those "brief phases".

## Example dialogue

> **Dev:** The Mega-menu tiles won't load because `/api/solutions` is down.
> **Expert:** That can't be why — Mega-menu Tiles ship inside `/api/navigation`; the Solutions
> Section endpoint only feeds the Tab Bar and Solution Blocks. They're the same three Solutions,
> but each Surface's copy travels with its own Section payload.
> **Dev:** Right — and Block 02 is Authored Content, so if the copy sounds off, that's ours to
> fix, not the Extraction's.
