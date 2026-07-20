// The value-card row inside a Solutions panel (MS-7): three cards that animate
// light→dark on individual hover, revealing their body copy (designer note 2:3).
// Light state = desktop nodes 1:132..1:142, dark state = off-artboard frame 2:36;
// mobile (1:380/1:381) has no hover, so the dark treatment is its resting state
// and the three cards ride a swipe carousel (D-015). Swaps with the tab (D-028).
import { useState } from 'react'
import type { ValueCard } from '@metatech/shared'

/**
 * The panel's card row: hover-flip trio at 1440, permanently-dark swipe carousel
 * below lg. Cards are focusable so :focus-visible mirrors hover (D-010 a11y).
 */
export function SolutionCards({ cards }: { cards: ValueCard[] }) {
  return (
    // Row 1:132/1:133: 1440x450 band, three 457-wide cards with a 16 gutter,
    // centered — the design's 18.5 side inset is that centering, not padding.
    // Below lg the row becomes a scroll-snap carousel inside the 393x394 block
    // (1:380, 20px padding), each card 353 wide like the single designed one.
    <ul
      data-testid="solution-cards"
      className="flex h-[394px] snap-x snap-mandatory items-center gap-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-auto lg:h-[450px] lg:max-w-[1440px] lg:snap-none lg:justify-center lg:gap-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {cards.map((card) => (
        <SolutionCardItem key={card.heading} card={card} />
      ))}
    </ul>
  )
}

/**
 * One card. The light and dark states are two separately-laid-out layers that
 * cross-fade, rather than one layer whose alignment mutates: `text-align` and
 * `justify-content` do not animate, so mutating them snapped the heading into
 * its new place on frame 1 while the colours eased over 300ms. Cross-fading
 * matches the mega-menu tiles' reveal (opacity only, nothing moves) and renders
 * each design state exactly, since neither is a tween of the other. The two
 * fades are staggered (light out over 150ms, dark in over 200ms after a 150ms
 * delay) so the heading is never legible in both places at once — an
 * overlapping dissolve ghosts it, which an image reveal like the mega menu's
 * never has to contend with.
 */
function SolutionCardItem({ card }: { card: ValueCard }) {
  const [revealed, setRevealed] = useState(false)

  return (
    // State-driven like MegaMenuPanel, so pointer and keyboard drive one flag
    // and the CSS stays a single `data-revealed` switch. Mobile rests dark, so
    // every light/flip class is lg-gated.
    // The 1px #E3E3E3 edge is an inset ring, not a border: Figma's INSIDE stroke
    // paints over the frame without consuming padding, so a CSS border would
    // shrink the content box to 395 and shift every child 1px (measured; the
    // stroke is render-verified present on the dark card too).
    // Mobile padding is 23 all round, not the frame's declared 28 bottom: the
    // text group (1:382) is absolutely positioned and overruns that padding,
    // resting 23 from the card's bottom edge — honouring 28 puts the body 5px high.
    <li
      tabIndex={0}
      data-revealed={revealed}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      className="group relative h-[350px] w-[353px] shrink-0 snap-center rounded-card bg-deep p-[23px] shadow-[inset_0_0_0_1px_#e3e3e3] transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-[450px] lg:w-[457px] lg:bg-white lg:p-[30px] lg:data-[revealed=true]:bg-deep"
    >
      {/* Light layer (nodes 1:135..1:142): heading centred in the content box,
          ink on white. Presentational only — the dark layer below carries the
          accessible heading and body, so this duplicate is hidden from AT. */}
      <div
        aria-hidden
        className="absolute inset-[30px] hidden items-center transition-opacity duration-150 ease-out group-data-[revealed=true]:opacity-0 lg:flex"
      >
        <p className="w-full text-center font-display text-[32px]/[42px] font-extrabold tracking-[-1.6px] text-ink">
          {card.heading}
        </p>
      </div>
      {/* Dark layer (frame 2:36): heading pinned to the top of the content box,
          body to the bottom. In flow below lg (the mobile resting state), an
          absolutely-positioned cross-fade layer at 1440 — where `h-auto` must
          undo the mobile `h-full`, which otherwise resolves against the card
          and overflows the inset box by the padding (measured: body 30px past
          the card's bottom edge). */}
      <div className="flex h-full flex-col justify-between lg:absolute lg:inset-[30px] lg:h-auto lg:opacity-0 lg:transition-opacity lg:delay-150 lg:duration-200 lg:ease-out lg:group-data-[revealed=true]:opacity-100">
        {/* Mobile text block is 322 wide (node 1:382), which deliberately overruns
            the card's 23px right padding by 15px — deriving the width from padding
            instead re-wraps the body and misses the design by whole lines. */}
        <h3 className="w-[322px] font-display text-[24px]/[30px] font-extrabold tracking-[-1.2px] text-accent lg:w-auto lg:text-[32px]/[42px] lg:tracking-[-1.6px]">
          {card.heading}
        </h3>
        <p className="w-[322px] font-sans text-[18px]/[24px] font-medium text-white lg:w-auto">
          {card.body}
        </p>
      </div>
    </li>
  )
}
