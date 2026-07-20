// The Tech Stack marquee (MS-9): three horizontal logo strips that scroll in
// alternating directions per note 2:5, decoded from the artboard in D-029.
// Desktop rows are nodes 1:174/1:207/1:226, mobile 2:38/2:47/2:53 — each one
// frame of a uniform 250px-pitch strip, which is what this rebuilds.
import { useId, useState } from 'react'
import type { LogoTile, TechStackRow } from '@metatech/shared'

/**
 * Resting offset per row, in px — the phase the artboard drew each strip at.
 * Recovered from the trimmed end tiles (250 − first-tile width) and confirmed by
 * every logo's optical centre; see the D-029 table. The Fidelity Gate forces
 * reduced motion, so these are the values it screenshots and must match.
 */
const ROW_PHASES = [
  { desktop: '36px', mobile: '42px' },
  { desktop: '76px', mobile: '82px' },
  { desktop: '34px', mobile: '40px' },
]

/**
 * Copies of the six-tile set laid end to end. Four covers the widest viewport we
 * verify (~2000px) at both ends of a cycle: one cycle is consumed by the base
 * offset that lets the right-travelling row move without exposing its left edge.
 */
const STRIP_COPIES = 4

/**
 * Rendered logo width per breakpoint, px. Desktop values are the design's own
 * boxes (nodes 1:176..1:244), every one of which matches its asset's intrinsic
 * aspect — so width alone fixes the box and heights follow. Mobile pins the six
 * the artboard draws (React/Go unscaled, Python 0.94, Next.js/Django/Laravel
 * ~0.8165) and derives the rest at 0.8165, since those tiles sit off the mobile
 * canvas and have no design truth (D-029 trade-off). Tailwind is the exception:
 * its 200px mark deliberately overflows its tile and is mask-cropped (node
 * 1:183), so mobile keeps that 1.333 logo-to-tile ratio rather than the scale.
 */
const LOGO_WIDTH: Record<string, { desktop: string; mobile: string }> = {
  React: { desktop: '130px', mobile: '130px' },
  'Next.js': { desktop: '132px', mobile: '107.78px' },
  'Tailwind CSS': { desktop: '200px', mobile: '133px' },
  TypeScript: { desktop: '138px', mobile: '112.7px' },
  Angular: { desktop: '147px', mobile: '120px' },
  'Vue.js': { desktop: '120px', mobile: '98px' },
  Go: { desktop: '107px', mobile: '107px' },
  Python: { desktop: '169px', mobile: '159px' },
  'Node.js': { desktop: '148px', mobile: '120.8px' },
  '.NET': { desktop: '124px', mobile: '101.2px' },
  Ruby: { desktop: '216px', mobile: '176.4px' },
  PHP: { desktop: '111px', mobile: '90.6px' },
  Django: { desktop: '128px', mobile: '104.6px' },
  Laravel: { desktop: '138px', mobile: '112.6px' },
  Flutter: { desktop: '140px', mobile: '114.3px' },
  MySQL: { desktop: '150px', mobile: '122.5px' },
  MongoDB: { desktop: '185px', mobile: '151px' },
  HTML5: { desktop: '70px', mobile: '57.2px' },
}

/** One 250px tile: the design's #f8f8f8 / r15 plate with its logo centred and clipped to it. */
function MarqueeTile({ logo, announced }: { logo: LogoTile; announced: boolean }) {
  const width = LOGO_WIDTH[logo.name]
  return (
    <div
      data-testid="marquee-tile"
      className="flex h-full w-[250px] shrink-0 items-center justify-center overflow-hidden rounded-card bg-surface"
    >
      {/* An unmapped name renders at intrinsic size — loud in the Fidelity Gate. */}
      <img
        src={logo.image.src}
        // Loop copies repeat the same logos; announcing them again would read the
        // whole stack three extra times, so only the first copy carries alt text.
        alt={announced ? logo.image.alt : ''}
        aria-hidden={!announced}
        style={
          {
            '--logo-w-desktop': width?.desktop,
            '--logo-w-mobile': width?.mobile,
          } as React.CSSProperties
        }
        className="max-w-none w-[var(--logo-w-mobile)] lg:w-[var(--logo-w-desktop)]"
      />
    </div>
  )
}

/** One scrolling row: a clipped viewport over the repeated strip, offset to its artboard phase. */
function MarqueeRow({ row, index }: { row: TechStackRow; index: number }) {
  const phase = ROW_PHASES[index]
  return (
    <div
      data-testid="marquee-row"
      data-direction={row.direction}
      // The design carries no mask (clipsContent is false everywhere) — the
      // marquee viewport is ours to add. It stays inside this Section so it can
      // never become a scroll container for the Solutions sticky scope (D-029.4).
      className="marquee-row h-[100px] overflow-hidden lg:h-[150px]"
      style={
        {
          '--phase-desktop': phase.desktop,
          '--phase-mobile': phase.mobile,
        } as React.CSSProperties
      }
    >
      {/* h-full so the tiles' own h-full resolves against the row rather than
          collapsing to their logo's intrinsic height. */}
      <div className="marquee-strip flex h-full w-max gap-[10px]">
        {Array.from({ length: STRIP_COPIES }).flatMap((_, copy) =>
          row.logos.map((logo, position) => (
            <MarqueeTile key={`${copy}-${position}`} logo={logo} announced={copy === 0} />
          )),
        )}
      </div>
    </div>
  )
}

/**
 * The three-row marquee band plus its pause mechanism. Rows also pause on hover
 * and focus-within (CSS), but WCAG 2.2.2 needs a control that does not depend on
 * pointing: this one is off-screen until focused, because the design draws no
 * pause affordance and none was wanted (D-029.5).
 */
export function TechStackMarquee({ rows }: { rows: TechStackRow[] }) {
  const [paused, setPaused] = useState(false)
  const labelId = useId()

  return (
    <div
      data-testid="marquee"
      data-paused={String(paused)}
      role="group"
      aria-labelledby={labelId}
      // 3 rows + 2 gaps fills the 470 desktop band exactly; the mobile band is
      // 360 with the rows packed top, leaving the design's 40px of slack (2:37).
      className="flex h-[360px] flex-col gap-[10px] lg:h-[470px]"
    >
      <span id={labelId} className="sr-only">
        Technologies we build with
      </span>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
        className="sr-only focus:not-sr-only focus:mx-5 focus:mb-2 focus:inline-flex focus:h-10 focus:items-center focus:rounded-card focus:bg-ink focus:px-4 focus:text-[14px]/[24px] focus:font-semibold focus:text-white"
      >
        {paused ? 'Resume logo animation' : 'Pause logo animation'}
      </button>
      {rows.map((row, index) => (
        <MarqueeRow key={index} row={row} index={index} />
      ))}
    </div>
  )
}
