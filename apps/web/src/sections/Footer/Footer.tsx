// Footer Section (MS-10): the dark band that closes the page — desktop node
// 1:248 (1440x358 at y=4380, flush under Tech Stack's 3530+850), mobile 1:441
// (393x482 at y=4490). One copyright line with an accented company name, the
// legal and social links, and the METATECH mark beneath them.
//
// The two artboards disagree structurally and in content — desktop lays the
// three groups across one 1264 row, mobile stacks them with rules between and
// draws the socials in a different order (D-030) — so this is a two-tree
// Section like Trusted By, not one tree with lg: overrides.
import type { FooterContent, Link, RichTextSpan } from '@metatech/shared'
import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { FooterSkeleton } from './FooterSkeleton'
import { FooterWordmark } from './FooterWordmark'

/** The page's Footer Section: copyright, links and wordmark from /api/footer (D-025 slice). */
export function Footer() {
  const query = useSectionQuery('footer')
  return (
    <footer className="bg-ink text-white">
      <SectionBoundary query={query} skeleton={<FooterSkeleton />}>
        {(footer) => <FooterLayout content={footer} />}
      </SectionBoundary>
    </footer>
  )
}

/** Loaded-state Footer: the breakpoint's own link arrangement over the shared wordmark. */
function FooterLayout({ content }: { content: FooterContent }) {
  return (
    // The band's height is the sum of its parts at both widths — mobile
    // 390 + 30 + 62 = 482, desktop 92 + 39 + 227 = 358 — so it is left to the
    // content rather than pinned, and footer.spec.ts asserts the total.
    <div className="flex flex-col gap-[30px] lg:gap-[39px]">
      <FooterStack content={content} />
      <FooterBar content={content} />
      {content.showWordmark && <FooterWordmark />}
    </div>
  )
}

/**
 * The mobile arrangement (node 1:442): legal links, socials and copyright in one
 * 30px-inset column, with the artboard's two 20x1 rules bracketing the socials.
 */
function FooterStack({ content }: { content: FooterContent }) {
  return (
    <div className="px-[30px] lg:hidden">
      {/* 50 between the link column and the copyright (1:443), 30 between the
          link groups and their rules (1:444), 20 inside each group. */}
      <div className="flex flex-col gap-[50px]">
        <div className="flex flex-col gap-[30px]">
          <LinkList links={content.legalLinks} testId="footer-legal-mobile" />
          <Rule />
          <LinkList links={content.socialLinksMobile} testId="footer-social-mobile" />
          <Rule />
        </div>
        <Copyright spans={content.copyright} testId="footer-copyright-mobile" />
      </div>
    </div>
  )
}

/**
 * The desktop arrangement (node 1:250): copyright, legal and socials strung
 * across the 1264 row that sits 68 below the band's top edge.
 */
function FooterBar({ content }: { content: FooterContent }) {
  return (
    // w-full is load-bearing, not noise: mx-auto inside the flex column would
    // otherwise beat align-items:stretch and shrink the row to fit-content.
    <div className="mx-auto hidden w-full max-w-[1440px] px-[88px] pt-[68px] lg:block">
      {/* Columns rather than the frame's literal itemSpacing=214: Frame 112
          hugs its children, so the 214s only reproduce the drawn layout while
          Chromium measures the text at exactly Figma's 323/193/320 — it does
          not, and the error then accumulates rightward. Each group is hug-width
          and left-anchored in the design (x=88/625/1032), so pinning the column
          starts at 0/537/944 of the 1264 row puts every group's first glyph
          where the artboard draws it, whatever the text measures.
          The ratios are fr rather than px so the row survives the 1024..1440
          band, which the artboards do not cover: 537:407:320 resolves to
          exactly those px at 1440 and shrinks proportionally below it. Fixed
          px columns kept the artboard's x but ran the socials off a 1280
          laptop, where overflow-x-clip hid the damage instead of showing it. */}
      <div className="grid grid-cols-[minmax(0,537fr)_minmax(0,407fr)_minmax(0,320fr)] items-center">
        <Copyright spans={content.copyright} testId="footer-copyright-desktop" />
        {/* 28 between the legal pair (1:256 ends 705, 1:255 starts 733) and 30
            between the socials (1:257 itemSpacing). */}
        <LinkList links={content.legalLinks} testId="footer-legal-desktop" horizontal gap="28px" />
        <LinkList links={content.socialLinks} testId="footer-social-desktop" horizontal gap="30px" />
      </div>
    </div>
  )
}

/** One 20x1 white rule (nodes 1:448/1:454); mobile-only, and decorative. */
function Rule() {
  return <div aria-hidden className="h-px w-5 rounded-full bg-white" />
}

/** The copyright line: spans concatenate inline so only the company name is accented. */
function Copyright({ spans, testId }: { spans: RichTextSpan[]; testId: string }) {
  return (
    <p
      data-testid={testId}
      className="font-sans text-ui font-bold tracking-[-0.7px] whitespace-nowrap"
    >
      {spans.map((span, index) => (
        <span key={index} className={span.accent ? 'text-accent' : undefined}>
          {span.text}
        </span>
      ))}
    </p>
  )
}

/**
 * A list of footer links, underlined as both artboards draw them. Explicit
 * role="list" because flex + Preflight's list-style:none drops the implicit one.
 */
function LinkList({
  links,
  testId,
  horizontal = false,
  gap,
}: {
  links: Link[]
  testId: string
  horizontal?: boolean
  gap?: string
}) {
  return (
    <ul
      role="list"
      data-testid={testId}
      style={gap ? { gap } : undefined}
      // Mobile sets 18/24 at -0.9 (1:446), desktop 14/24 at -0.7 (1:255); the
      // vertical stack's own 20px gap is the artboard's, so it stays a class.
      className={
        horizontal
          ? 'flex font-sans text-ui font-bold tracking-[-0.7px]'
          : 'flex flex-col gap-5 font-sans text-card-body font-bold tracking-[-0.9px]'
      }
    >
      {links.map((link) => (
        <li key={link.label}>
          {/* hover:text-accent is the house treatment for links on a dark band
              (Navigation 1:26, HamburgerOverlay); the artboards draw no hover. */}
          <a
            href={link.href}
            className="underline transition-colors hover:text-accent"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
