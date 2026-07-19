import { SectionBoundary } from '../../components/ui/SectionBoundary'
import { useSectionQuery } from '../../hooks/useSectionQuery'
import { HeroSkeleton } from './HeroSkeleton'

/* MS-1 proof of the data layer: raw contract data through SectionBoundary; MS-2 makes it pixel-true. */
export function Hero() {
  const query = useSectionQuery('hero')
  return (
    <section className="bg-deep text-white">
      <SectionBoundary query={query} skeleton={<HeroSkeleton />}>
        {(hero) => (
          <div className="px-[50px] py-10">
            <h1 className="max-w-[664px] font-display text-hero font-extrabold">
              {hero.headline.map((span) => (
                <span key={span.text} className={span.accent ? 'text-accent' : undefined}>
                  {span.text}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[388px] font-sans text-body font-light">{hero.subcopy}</p>
            <a
              href={hero.cta.href}
              className="mt-6 inline-block rounded-card bg-accent px-[35px] py-[10px] font-sans text-ui font-bold text-ink"
            >
              {hero.cta.label}
            </a>
            <img
              src={hero.media.image.src}
              alt={hero.media.image.alt}
              className="mt-20 w-full rounded-bar"
            />
          </div>
        )}
      </SectionBoundary>
    </section>
  )
}
