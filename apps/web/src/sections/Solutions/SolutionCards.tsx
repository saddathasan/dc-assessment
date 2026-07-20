// The value-card row inside a Solutions panel (MS-7): three cards that animate
// light→dark on individual hover, revealing their body copy (designer note 2:3).
// Light state = desktop nodes 1:132..1:142, dark state = off-artboard frame 2:36;
// mobile (1:380/1:381) has no hover, so the dark treatment is its resting state
// and the three cards ride a swipe carousel (D-015). Swaps with the tab (D-028).
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

/** One card: white→#032019 flip on hover/focus at 1440, always dark below lg (D-015). */
function SolutionCardItem({ card }: { card: ValueCard }) {
  return (
    // `group` drives the flip. Mobile rests in the dark state, so the light
    // classes are lg-only and the flip is gated to hover-capable pointers —
    // a tap must not leave a card stuck mid-flip (D-010).
    // The 1px #E3E3E3 edge is an inset ring, not a border: Figma's INSIDE stroke
    // paints over the frame without consuming padding, so a CSS border would
    // shrink the content box to 395 and shift every child 1px (measured; the
    // stroke is render-verified present on the dark card too).
    // Mobile padding is 23 all round, not the frame's declared 28 bottom: the
    // text group (1:382) is absolutely positioned and overruns that padding,
    // resting 23 from the card's bottom edge — honouring 28 puts the body 5px high.
    <li
      tabIndex={0}
      className="group h-[350px] w-[353px] shrink-0 snap-center rounded-[15px] bg-deep shadow-[inset_0_0_0_1px_#e3e3e3] p-[23px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-[450px] lg:w-[457px] lg:bg-white lg:p-[30px] lg:hover:bg-deep lg:focus-visible:bg-deep"
    >
      {/* At rest the body is collapsed to zero height, so `justify-center`
          centers the heading alone in the content box exactly as the light
          design does; expanding the body flips the column to top/bottom
          pinning (the design's SPACE_BETWEEN). */}
      {/* Mobile text block is 322 wide (node 1:382), which deliberately overruns
          the card's 23px right padding by 15px — deriving the width from padding
          instead re-wraps the body and misses the design by whole lines. */}
      <div className="flex h-full w-[322px] flex-col justify-between lg:w-auto lg:justify-center lg:group-hover:justify-between lg:group-focus-visible:justify-between">
        {/* Title 1:136/1:139/1:142 → 1:267/1:271/1:275: Bricolage 800 32, ls −1.6.
            Light is centered ink, dark is left-aligned accent green. Line-height
            stays 42 through the flip: the design's light state uses 42 on the two
            wrapping titles and its dark state 36 on all three, and re-flowing the
            heading mid-animation to save 6px reads as a glitch — the resting
            state the Baseline diffs is the one held exact. */}
        <h3 className="font-display text-[24px]/[30px] font-extrabold tracking-[-1.2px] text-accent lg:text-center lg:text-[32px]/[42px] lg:tracking-[-1.6px] lg:text-ink lg:transition-colors lg:duration-300 lg:group-hover:text-left lg:group-hover:text-accent lg:group-focus-visible:text-left lg:group-focus-visible:text-accent">
          {card.heading}
        </h3>
        {/* Body reveal via grid-rows 0fr→1fr (D-010's chosen CSS-only pattern):
            it animates a real height without a magic pixel value, and the copy
            stays in the DOM for search and assistive tech at every state. */}
        <div className="grid grid-rows-[1fr] lg:grid-rows-[0fr] lg:transition-[grid-template-rows] lg:duration-300 lg:group-hover:grid-rows-[1fr] lg:group-focus-visible:grid-rows-[1fr]">
          <p className="overflow-hidden font-sans text-[18px]/[24px] font-medium text-white lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
            {card.body}
          </p>
        </div>
      </div>
    </li>
  )
}
