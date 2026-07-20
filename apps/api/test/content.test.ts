import request from 'supertest'
import { describe, expect, it } from 'vitest'
import type {
  FooterContent,
  HeroContent,
  NavigationContent,
  SolutionsContent,
  TechStackContent,
  TrustedByContent,
  WeAreContent,
} from '@metatech/shared'
import { app } from '../src/app.js'

// The typed data barrel (src/data/index.ts) binds each JSON file to its
// Contract type at compile time (with documented literal-widening casts);
// these tests are the authoritative runtime layer: every endpoint responds
// 200 with the exact extracted content.

// One endpoint per Section (D-007). Solutions is the tabbed Section, so the
// value cards and showcase ride inside it rather than having their own routes
// (D-028.4) — the retired slugs are pinned as 404s below.
const SECTION_ENDPOINTS = [
  '/api/navigation',
  '/api/hero',
  '/api/trusted-by',
  '/api/we-are',
  '/api/solutions',
  '/api/tech-stack',
  '/api/footer',
] as const

const get = async <T>(path: string): Promise<T> => {
  const res = await request(app).get(path)
  expect(res.status).toBe(200)
  expect(res.headers['content-type']).toContain('application/json')
  return res.body as T
}

const joined = (spans: Array<{ text: string }>) => spans.map((s) => s.text).join('')

describe('content endpoints', () => {
  it.each(SECTION_ENDPOINTS)('%s responds 200 with JSON', async (path) => {
    await get(path)
  })

  it('GET /api/navigation matches NavigationContent', async () => {
    const nav = await get<NavigationContent>('/api/navigation')
    expect(nav.links.map((l) => l.label)).toEqual(['Solutions', 'Showcase', 'Contact'])
    expect(nav.cta.label).toBe('Book a meeting')
    // Mega-menu tiles in design x-order (EXTRACTION interaction spec)
    expect(nav.megaMenu.tiles.map((t) => t.solution)).toEqual([
      'custom-software',
      'data-ai',
      'tech-staffing',
    ])
    expect(nav.megaMenu.tiles.map((t) => t.title)).toEqual([
      'Custom Software Development',
      'Data+AI First Innovation',
      'Tech Staff Augmentation',
    ])
    for (const tile of nav.megaMenu.tiles) {
      expect(tile.image.src).toMatch(/^\/images\//)
      expect(tile.image.alt).toBeTruthy()
    }
  })

  it('GET /api/hero matches HeroContent', async () => {
    const hero = await get<HeroContent>('/api/hero')
    expect(joined(hero.headline)).toBe('Building Intelligence to Power Scalable Innovation')
    expect(hero.headline.filter((s) => s.accent).map((s) => s.text)).toEqual([
      'Intelligence to Power',
    ])
    expect(hero.subcopy).toBe(
      'MetaTech integrates custom software engineering, advanced data and AI systems, and strategic staff augmentation to power scalable, high impact digital transformation.',
    )
    expect(hero.cta.label).toBe('Book for Demo')
    expect(hero.media.image.src).toMatch(/^\/images\//)
    expect(['youtube', 'file']).toContain(hero.video.provider)
    expect(hero.video.src).toBeTruthy()
  })

  it('GET /api/trusted-by matches TrustedByContent', async () => {
    const trusted = await get<TrustedByContent>('/api/trusted-by')
    expect(joined(trusted.heading)).toBe('Trusted by product teams and enterprise innovators.')
    expect(trusted.heading.filter((s) => s.accent).map((s) => s.text)).toEqual([
      'Trusted by',
      'innovators.',
    ])
    // 8 tiles incl. the designed Alteryx/Google Cloud duplicates (D-017.4)
    expect(trusted.logos.map((l) => l.name)).toEqual([
      'Databricks',
      'Google Cloud',
      'UiPath',
      'Alteryx',
      'Alteryx',
      'Figma',
      'Amazon Web Services',
      'Google Cloud',
    ])
    for (const logo of trusted.logos) {
      expect(logo.image.src).toMatch(/^\/images\//)
    }
    // The mobile artboard rearranges the wall with different designed duplicates
    // (UiPath/Alteryx twice, Google Cloud once — nodes 1:338..1:357, D-017.4),
    // so it carries its own tile list.
    expect(trusted.logosMobile.map((l) => l.name)).toEqual([
      'Databricks',
      'Google Cloud',
      'Alteryx',
      'UiPath',
      'Figma',
      'Amazon Web Services',
      'Alteryx',
      'UiPath',
    ])
    for (const logo of trusted.logosMobile) {
      expect(logo.image.src).toMatch(/^\/images\//)
    }
  })

  it('GET /api/we-are matches WeAreContent', async () => {
    const weAre = await get<WeAreContent>('/api/we-are')
    expect(weAre.eyebrow).toBe('We Are />')
    expect(weAre.statement[0].bold).toBe(true)
    // D-017.3: run-on punctuated with a colon after "pillars"
    expect(weAre.statement[0].text).toBe(
      'Engineering business solutions through three strategic pillars: ',
    )
    expect(weAre.statement[1].bold).toBeFalsy()
    expect(weAre.statement[1].text).toBe(
      'AI powered delivery combining intelligent software engineering, data driven insight, and elite talent to accelerate scale, quality, and competitive advantage.',
    )
  })

  it('GET /api/solutions carries one full panel per tab', async () => {
    const solutions = await get<SolutionsContent>('/api/solutions')
    expect(solutions.tabs.map((t) => t.id)).toEqual(['data-ai', 'custom-software', 'tech-staffing'])
    expect(solutions.tabs.map((t) => t.label)).toEqual([
      'Data + AI',
      'Custom Software',
      'Tech Staffing',
    ])
    // One panel per tab, in tab order — the number is the tab's index (D-028.2).
    expect(solutions.panels.map((p) => p.id)).toEqual(solutions.tabs.map((t) => t.id))
    expect(solutions.panels.map((p) => p.number)).toEqual(['01', '02', '03'])

    const [dataAi, customSoftware, techStaffing] = solutions.panels
    // D-017.1: "Settings" typo corrected to "Driven"
    expect(dataAi.heading).toBe('Data + AI Driven Innovation')
    expect(dataAi.body).toBe(
      'Our Data and AI services combine engineering, analytics, and applied AI to help organizations understand data, predict outcomes, and automate decisions. From trusted analytics to production grade AI systems, we deliver intelligence that works in the real world.',
    )
    expect(dataAi.authored).toBeFalsy()
    // D-016/D-028.5: panels 02/03 are Authored Content, flagged as such
    for (const panel of [customSoftware, techStaffing]) {
      expect(panel.authored).toBe(true)
      expect(panel.heading).toBeTruthy()
      expect(panel.body).toBeTruthy()
    }
    for (const panel of solutions.panels) {
      expect(panel.cta.label).toBe('Book a consultation')
    }
  })

  it('every solutions panel carries its own three value cards', async () => {
    const { panels } = await get<SolutionsContent>('/api/solutions')

    // The designed set (frame 2:36) belongs to the Data + AI panel; the other
    // two panels carry authored cards on the identical design.
    expect(panels[0].cards.map((c) => c.heading)).toEqual([
      'Data Integrity First',
      'Workflows Before Automation',
      'Governance With Same Standard',
    ])
    expect(panels[0].cards[0].body).toBe(
      'AI outputs are only as reliable as the data feeding them. We design, validate, and strengthen your data foundation from the ground up. Garbage in, garbage out is not a risk we take with your business.',
    )
    expect(panels[0].cards[1].body).toBe(
      'Before we build anything, we map your business workflows end to end by surveying the ambiguity. We understand the decisions being made, the people making them, and the systems involved. That clarity determines how and where automation creates real leverage, not just activity.',
    )
    expect(panels[0].cards[2].body).toBe(
      'We implement data governance frameworks that carry the same accountability as human oversight. Your agents operate within defined boundaries. Auditability, control, and compliance are built in, not added on.',
    )

    for (const panel of panels) {
      expect(panel.cards).toHaveLength(3)
      for (const card of panel.cards) {
        expect(card.heading).toBeTruthy()
        expect(card.body).toBeTruthy()
      }
    }
    // Card headings are unique across the whole Section — authored panels must
    // not silently reuse the designed set.
    const headings = panels.flatMap((p) => p.cards.map((c) => c.heading))
    expect(new Set(headings).size).toBe(headings.length)
  })

  it('every solutions panel carries its own showcase', async () => {
    const { panels } = await get<SolutionsContent>('/api/solutions')

    const [dataAi] = panels
    expect(dataAi.showcase.logo?.src).toMatch(/^\/images\//)
    expect(dataAi.showcase.name).toBe('AmiCredible')
    expect(dataAi.showcase.heading).toBe('An AI-powered credibility checking platform')
    expect(dataAi.showcase.body).toBe(
      'that helps users verify claims, analyze sources, and make informed decisions with Quick Check, Deep Check, and Image Check features.',
    )

    for (const panel of panels) {
      const { showcase } = panel
      expect(showcase.name).toBeTruthy()
      expect(showcase.heading).toBeTruthy()
      expect(showcase.body).toBeTruthy()
      // D-017.5: double space before the arrow normalized
      expect(showcase.cta.label).toBe('Explore more →')
      // D-023.1: 4 slides so the carousel's 4 dots have somewhere to go
      expect(showcase.slides).toHaveLength(4)
      for (const slide of showcase.slides) {
        expect(slide.image.src).toMatch(/^\/images\//)
        expect(slide.image.alt).toContain(showcase.name)
      }
    }
    // D-028.5: only the designed panel ships a logo asset; authored panels fall
    // back to a wordmark of `name`, so a missing logo must stay legal.
    expect(panels.filter((p) => p.showcase.logo === undefined)).toHaveLength(2)
  })

  it('GET /api/tech-stack matches TechStackContent', async () => {
    const techStack = await get<TechStackContent>('/api/tech-stack')
    expect(techStack.eyebrow).toBe('Tech Stacks />')
    expect(techStack.heading).toBe('Built With Modern Technologies')
    expect(techStack.body).toBe(
      'We use modern, reliable technologies to design, build, and scale high-performance software systems. Our team works with proven tools to deliver secure, scalable, production-ready solutions.',
    )
    expect(techStack.rows).toHaveLength(3)
    for (const row of techStack.rows) {
      expect(row.logos).toHaveLength(6)
    }
    expect(techStack.rows.map((r) => r.logos.map((l) => l.name))).toEqual([
      ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Angular', 'Vue.js'],
      ['Go', 'Python', 'Node.js', '.NET', 'Ruby', 'PHP'],
      ['Django', 'Laravel', 'Flutter', 'MySQL', 'MongoDB', 'HTML5'],
    ])
    // Designer note 2:5 — top & bottom rows same direction, middle opposite
    const [top, middle, bottom] = techStack.rows.map((r) => r.direction)
    expect(top).toBe(bottom)
    expect(middle).not.toBe(top)
  })

  it('GET /api/footer matches FooterContent', async () => {
    const footer = await get<FooterContent>('/api/footer')
    // D-017.2: "@2022-2026" corrected to the real copyright symbol
    expect(joined(footer.copyright)).toBe('©2022-2026 MetaTech LLC // All Rights Reserved')
    expect(footer.copyright.filter((s) => s.accent).map((s) => s.text)).toEqual(['MetaTech LLC '])
    expect(footer.legalLinks.map((l) => l.label)).toEqual(['Privacy Policy', 'Terms of Use'])
    expect(footer.socialLinks.map((l) => l.label)).toEqual([
      'Facebook',
      'Linkedin',
      'Instagram',
      'Youtube',
    ])
    expect(footer.showWordmark).toBe(true)
  })

  it.each(['/api/value-cards', '/api/showcase'])(
    '%s is gone — folded into /api/solutions (D-028.4)',
    async (path) => {
      const res = await request(app).get(path)
      expect(res.status).toBe(404)
    },
  )

  it('section endpoints honor the ?fail=true error demo', async () => {
    const res = await request(app).get('/api/hero?fail=true')
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Simulated failure' })
  })
})
