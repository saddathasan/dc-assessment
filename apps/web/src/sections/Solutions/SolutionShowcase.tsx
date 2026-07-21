// The product showcase inside a Solutions panel (MS-8): the green band closing
// the tab body, with a device carousel. Desktop nodes 1:144..1:164, mobile
// 1:386..1:409. Swaps with the tab (D-028); authored panels have no exported
// logo and fall back to a wordmark of the product name (D-028.5).
import { useState } from 'react'
import type { ShowcaseContent } from '@metatech/shared'

/**
 * Figma STRETCH is a crop window, not a distortion: the fill's imageTransform
 * [[sx,0,tx],[0,sy,ty]] says which slice of the bitmap the frame shows, so the
 * image is drawn 1/s of the frame and offset by −t (see D-021 notes, MS-4).
 */
const DEVICE_CROP = { sx: 0.6315657496452332, sy: 0.8688206076622009, tx: 0.2842046022415161, ty: 0.06558968871831894 }

/** The panel's showcase band: logo/copy column beside the device carousel (D-028). */
export function SolutionShowcase({ showcase }: { showcase: ShowcaseContent }) {
  const [active, setActive] = useState(0)

  return (
    // Band 1:146/1:387: #17A955 full-bleed, content capped at the design's 1440.
    // The node also carries a DUOTONE noise effect at 0.1 alpha — below the
    // gate's threshold and not reproducible in CSS without an asset, so it is
    // deliberately not built.
    // The gray canvas shows through above the band: the artboard leaves 73px
    // between the card row's end (2756) and the band's start (2829), and 29px
    // on mobile (2851 → 2880).
    <div className="mt-[29px] bg-green-700 lg:mt-[73px]">
      <div className="mx-auto max-w-[1440px] lg:flex lg:h-[700px] lg:items-center">
        {/* Copy column 1:147: 680 wide at x=30, so it occupies 30..710 and the
            media column starts at exactly 710 — modelled as a 710-wide column
            with a 30 left inset rather than a centred row, which keeps the
            design's 30px gutters on both sides (1440 − 30 − 680 − 700 = 30).
            Its 601-tall stack is centred in the band —
            logo, then a 230 gap, then the copy. Below lg the design splits that
            into two fixed blocks (1:388 at 200 tall, 1:392 at 300). */}
        <div className="lg:flex lg:h-[601px] lg:w-[710px] lg:shrink-0 lg:flex-col lg:justify-between lg:pl-[30px]">
          <div className="flex h-[200px] items-start px-5 pt-10 lg:h-auto lg:px-0 lg:pt-0">
          {showcase.logo ? (
            <img
              src={showcase.logo.src}
              alt={showcase.logo.alt}
              className="h-[30px] w-[209px] object-contain object-left lg:h-10 lg:w-[279px]"
            />
          ) : (
            // Authored panels ship no logo bitmap, so the product name stands in
            // as a wordmark at the mark's height (D-028.5).
            <p className="flex h-[30px] items-center font-display text-[26px] font-extrabold tracking-[-1.3px] text-white lg:h-10 lg:text-[34px]">
              {showcase.name}
            </p>
          )}
          </div>
          <div className="flex h-[300px] items-center px-5 lg:h-auto lg:px-0">
          <div className="lg:w-[539px]">
            <h3 className="font-display text-[32px]/[38px] font-extrabold tracking-[-1.6px] text-white lg:text-[48px]/[54px] lg:tracking-[-2.4px]">
              {showcase.heading}
            </h3>
            {/* Body 1:153 is FIXED at 542 — 3px wider than its 539 parent, an
                intentional overhang the design draws; reproduced so the two
                lines break where the render breaks them. */}
            <p className="mt-5 font-sans text-[14px]/[20px] font-medium tracking-[-0.42px] text-white lg:mt-[15px] lg:w-[542px] lg:text-[18px]/[27px] lg:tracking-[-0.54px]">
              {showcase.body}
            </p>
            {/* CTA 1:154/1:397: ghost pill, 2px white@35% inset stroke. */}
            <a
              href={showcase.cta.href}
              className="mt-[30px] inline-flex h-10 w-[140px] items-center justify-center rounded-[10px] font-sans text-[14px]/[24px] font-bold tracking-[-0.7px] text-line shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)] transition-colors hover:bg-white/10 lg:mt-[50px] lg:h-[50px] lg:w-[169px] lg:rounded-card"
            >
              {showcase.cta.label}
            </a>
          </div>
          </div>
        </div>
        {/* Media block 1:399: 400 tall below lg with the device bottom-packed
            20 from the edge; at 1440 the carousel sits in the 700-wide column. */}
        <div className="flex h-[400px] items-end justify-center pb-5 lg:block lg:h-auto lg:pb-0">
          <ShowcaseCarousel showcase={showcase} active={active} onActive={setActive} />
        </div>
      </div>
    </div>
  )
}

/** Device carousel: scroll-snap slides under a bottom scrim, with elongated-active dots. */
function ShowcaseCarousel({
  showcase,
  active,
  onActive,
}: {
  showcase: ShowcaseContent
  active: number
  onActive: (index: number) => void
}) {
  return (
    // Media frame 1:157/1:400: 700x650 at 1440, 363x337 below — the device art
    // is a crop of one capture (D-023.1 reuses it across the slides).
    <div className="relative h-[337px] w-[363px] shrink-0 overflow-hidden rounded-card lg:mt-0 lg:h-[650px] lg:w-[700px] lg:rounded-bar">
      <ul
        onScroll={(event) => {
          const el = event.currentTarget
          onActive(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {showcase.slides.map((slide, index) => (
          <li key={index} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
            {/* Absolutely positioned so the offsets resolve per axis: a
                percentage margin resolves against the container's WIDTH on every
                side, which silently mis-registers the vertical crop. */}
            <img
              src={slide.image.src}
              alt={slide.image.alt}
              className="absolute max-w-none"
              style={{
                width: `${100 / DEVICE_CROP.sx}%`,
                height: `${100 / DEVICE_CROP.sy}%`,
                left: `${(-DEVICE_CROP.tx * 100) / DEVICE_CROP.sx}%`,
                top: `${(-DEVICE_CROP.ty * 100) / DEVICE_CROP.sy}%`,
              }}
            />
          </li>
        ))}
      </ul>
      {/* Scrim 1:160/1:403: black→transparent upward at 70%, so the dots stay
          legible over whatever the capture shows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-black/70 to-transparent lg:h-[129px]"
      />
      {/* Dot rail 1:161/1:405: the active dot is elongated, not recoloured. */}
      <ul className="absolute bottom-5 left-5 flex items-center gap-[5px] lg:bottom-[38px] lg:left-[34px]">
        {showcase.slides.map((_slide, index) => (
          <li key={index}>
            <span
              aria-hidden
              className={`block h-[6px] rounded-bar motion-safe:transition-all lg:h-[10px] ${
                index === active ? 'w-[50px] bg-white' : 'w-5 bg-white/50'
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
