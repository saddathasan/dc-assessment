// Hero Section (MS-3): the deep-green intro band, verbatim from the Extraction —
// desktop nodes 1:55..2:34, mobile 1:311..2:35. The media block is clipped by the
// design's own notch path and carries the play button into the video modal (D-018).
import { useState } from 'react'
import type { HeroContent } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { HeroSkeleton } from './HeroSkeleton'
import { PlayButton } from './PlayButton'
import { VideoModal } from './VideoModal'

/** The page's Hero Section: data-fed statics plus the play-button → modal flow (D-025 slice). */
export function Hero() {
  const query = useSectionQuery('hero')
  return (
    <section aria-label="Introduction" className="bg-deep text-white">
      <SectionBoundary query={query} skeleton={<HeroSkeleton />}>
        {(hero) => <HeroLayout content={hero} />}
      </SectionBoundary>
    </section>
  )
}

/**
 * Exact notch cutout from the design (node 2:10 fillGeometry): r=35 corners with a
 * 90px-deep S-curved bite for the play button. objectBoundingBox units (the path is
 * scaled by 1/1400 × 1/571) keep the shape proportional at fluid widths.
 */
function NotchClipPath() {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0">
      <defs>
        <clipPath id="hero-notch" clipPathUnits="objectBoundingBox">
          <path
            transform="scale(0.000714285714, 0.00175131349)"
            d="M1400 536C1400 555.33 1384.33 571 1365 571L35 571C15.67 571 0 555.33 0 536L0 35C0 15.67 15.67 0 35 0L571.192 0C590.448 0 605.451 16.1247 612.781 33.9308C626.328 66.8356 658.708 90 696.5 90L704.5 90C742.292 90 774.672 66.8356 788.219 33.9308C795.549 16.1247 810.552 0 829.808 0L1365 0C1384.33 0 1400 15.67 1400 35L1400 536Z"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

/** Loaded-state Hero: copy column, notched media block, watermark, and modal state. */
function HeroLayout({ content }: { content: HeroContent }) {
  const [videoOpen, setVideoOpen] = useState(false)
  const openVideo = () => setVideoOpen(true)

  return (
    // The band caps at the design's 1440 and centers on wider viewports — the
    // page convention the nav set; the deep green bleeds via the section behind.
    // Mobile keeps the design's 62px gap under the header (hero y=194.76 vs
    // header end 133 in file.json): the foreign banner there is excluded, its
    // space is design geometry and stays (D-026). Desktop is flush (y=120).
    <div className="mx-auto pt-[62px] lg:max-w-[1440px] lg:pt-0">
      {/* Copy block: below lg it fills the viewport with the design's 28.5px side
          margins (336 wide at exactly 393 — never a hard cap, which shrank big
          phones and stranded tablets); at 1440 a 400px-tall row whose items-center
          produces the design's 212/239 top offsets. */}
      <div className="w-full px-[28.5px] lg:flex lg:h-[400px] lg:items-center lg:gap-[180px] lg:px-[50px]">
        {/* Sizes use the slash form (not leading-*): a leading utility would pin
            --tw-leading globally and defeat the lg token's paired line-height. */}
        <h1 className="font-display text-[48px]/[48px] font-extrabold tracking-[-0.05em] capitalize lg:w-[664px] lg:text-hero">
          {content.headline.map((span, index) => (
            // Spans have no identity beyond position, so the index is the honest key.
            <span key={index} className={span.accent ? 'text-accent' : undefined}>
              {span.text}
            </span>
          ))}
        </h1>
        <div className="mt-5 lg:mt-0 lg:w-[388px]">
          <p className="font-sans text-[14px]/[20px] font-light lg:text-body">
            {content.subcopy}
          </p>
          {/* Both pills are fixed boxes from the design — 130x40 (node 1:319) and
              160x50 (1:61) — with the label centered, so Chromium's slightly
              narrower text metrics can't drift the geometry off the Extraction. */}
          <a
            href={content.cta.href}
            className="mt-[30px] inline-flex h-10 w-[130px] items-center justify-center rounded-[10px] bg-accent font-sans text-ui font-bold tracking-[-0.05em] text-ink transition-opacity hover:opacity-85 lg:mt-5 lg:h-[50px] lg:w-[160px] lg:rounded-card lg:px-[35px] lg:py-[10px]"
          >
            {content.cta.label}
          </a>
          {/* Mobile placement: the play button sits in the column, above the photo. */}
          <div className="mt-[50px] lg:hidden">
            <PlayButton variant="inline" onClick={openVideo} />
          </div>
        </div>
      </div>

      {/* Media block: 380x200 r=20 plain photo card on mobile; at 1440 the
          1400x571 notched block (gap 80 under the copy row) with the play button
          riding the cutout, centered on the top edge. */}
      <div
        data-testid="hero-media"
        className="relative mx-[6.5px] mt-5 aspect-[380/200] lg:mx-5 lg:mt-20 lg:aspect-auto lg:h-[571px]"
      >
        <NotchClipPath />
        <div className="absolute inset-0 overflow-hidden rounded-tile lg:rounded-none lg:[clip-path:url(#hero-notch)]">
          {/* The photo replicates the design's FILL placement: a rect larger than
              the mask, offset (-3,-10)/383x255 at the 393 artboard — expressed as
              percentages of the card below lg so it scales with the fluid width;
              fixed px at lg where the capped band bounds the block at 1400. */}
          <img
            src={content.media.image.src}
            alt={content.media.image.alt}
            data-testid="hero-photo"
            fetchPriority="high"
            className="absolute top-[-5%] left-[-0.7895%] h-[127.5%] w-[100.7895%] max-w-none object-cover lg:top-[-95px] lg:left-[calc(50%-702px)] lg:h-[934px] lg:w-[1402px]"
          />
          {/* Diagonal dark→green→dark wash over the photo (nodes 2:15/2:30). */}
          <div
            aria-hidden="true"
            data-testid="hero-overlay"
            className="absolute inset-0 bg-[linear-gradient(118deg,#161616_25%,#06ff70_48.08%,#161616_75.48%)] opacity-35 lg:bg-[linear-gradient(112.4deg,#161616_25%,#06ff70_48.08%,#161616_75.48%)] lg:opacity-30"
          />
        </div>
        {/* Desktop placement: ring center on the media's top edge, anchored to the
            notch center (~50% of the block, =635 at 1400) so button and scaled
            clip path stay married at every width — never a fixed artboard offset. */}
        <div className="absolute top-[-65px] left-[calc(50%-65px)] hidden lg:block">
          <PlayButton variant="notch" onClick={openVideo} />
        </div>
        {/* Translucent METATECH wordmark along the photo's bottom (white @40%,
            baked into the asset); the design lets it spill 3px past the block. */}
        <img
          src="/images/metatech-watermark.svg"
          alt=""
          aria-hidden="true"
          data-testid="hero-watermark"
          className="absolute top-[78%] left-[13.816%] h-[22%] w-[72.368%] max-w-none lg:top-[415px] lg:left-[calc(50%-501px)] lg:h-[159px] lg:w-[1001px]"
        />
      </div>

      {videoOpen && <VideoModal video={content.video} onClose={() => setVideoOpen(false)} />}
    </div>
  )
}
