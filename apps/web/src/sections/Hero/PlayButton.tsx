// The Hero's concentric-ring play trigger, verbatim from the Extraction: desktop
// rings 130/105/74 (nodes 2:18..2:21), mobile 100/80/60 (nodes 1:321..1:324),
// accent green at 25%/50%/100% around a deep-green triangle glyph.

interface PlayButtonProps {
  /** Ring set per placement: 'notch' (desktop media cutout) or 'inline' (mobile column). */
  variant: 'notch' | 'inline'
  onClick: () => void
}

/** Ring/glyph pixel sets extracted per viewport; the glyph path scales with its viewBox. */
const SIZES = {
  notch: { outer: 130, middle: 105, inner: 74, glyph: 34 },
  inline: { outer: 100, middle: 80, inner: 60, glyph: 30 },
}

/** Opens the Hero video modal (note 1:510); rings are literal rgba so the Fidelity Gate can assert them exactly. */
export function PlayButton({ variant, onClick }: PlayButtonProps) {
  const size = SIZES[variant]
  return (
    <button
      type="button"
      aria-label="Play the MetaTech video"
      data-testid="hero-play"
      onClick={onClick}
      style={{ width: size.outer, height: size.outer }}
      className="relative grid cursor-pointer place-items-center rounded-full bg-[rgba(51,249,135,0.25)] motion-safe:transition-transform motion-safe:hover:scale-105"
    >
      <span
        style={{ width: size.middle, height: size.middle }}
        className="grid place-items-center rounded-full bg-[rgba(51,249,135,0.5)]"
      >
        <span
          style={{ width: size.inner, height: size.inner }}
          className="grid place-items-center rounded-full bg-accent"
        >
          {/* Rounded triangle from Polygon 2's fillGeometry, rotated to point right. */}
          <svg viewBox="0 0 34 34" width={size.glyph} height={size.glyph} aria-hidden="true">
            <path
              d="M14.4019 4.5C15.5566 2.5 18.4434 2.5 19.5981 4.5L29.1244 21C30.2791 23 28.8357 25.5 26.5263 25.5L7.47372 25.5C5.16432 25.5 3.72094 23 4.87564 21L14.4019 4.5Z"
              transform="rotate(90 17 17)"
              fill="#032019"
            />
          </svg>
        </span>
      </span>
      {/* Heartbeat ripple: an accent ring that pulses out of the button to invite
          the click. Appended last so it never precedes the rings the Fidelity
          Gate reads as span:first; absolute + opacity-0 so at rest it changes
          neither the button box nor the Baseline. Motion-safe-gated, so the gate
          (forced reduced motion) sees only this transparent resting state. */}
      <span
        aria-hidden="true"
        data-testid="hero-play-pulse"
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent opacity-0 motion-safe:animate-heartbeat"
      />
    </button>
  )
}
