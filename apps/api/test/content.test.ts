import request from 'supertest'
import { describe, expect, it } from 'vitest'
import type {
  FooterContent,
  HeroContent,
  NavigationContent,
  ShowcaseContent,
  SolutionsContent,
  TechStackContent,
  TrustedByContent,
  ValueCardsContent,
  WeAreContent,
} from '@metatech/shared'
import { app } from '../src/app.js'

// Compile-time layer of the contract lives in the route modules (data JSON
// `satisfies` each payload type); these tests are the runtime layer: every
// endpoint responds 200 with the exact extracted content.

const SECTION_ENDPOINTS = [
  '/api/navigation',
  '/api/hero',
  '/api/trusted-by',
  '/api/we-are',
  '/api/solutions',
  '/api/value-cards',
  '/api/showcase',
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

  it('GET /api/solutions matches SolutionsContent', async () => {
    const solutions = await get<SolutionsContent>('/api/solutions')
    expect(solutions.tabs.map((t) => t.id)).toEqual(['data-ai', 'custom-software', 'tech-staffing'])
    expect(solutions.tabs.map((t) => t.label)).toEqual([
      'Data + AI',
      'Custom Software',
      'Tech Staffing',
    ])
    expect(solutions.blocks.map((b) => b.number)).toEqual(['01', '02', '03'])
    expect(solutions.blocks.map((b) => b.id)).toEqual(solutions.tabs.map((t) => t.id))

    const [dataAi, customSoftware, techStaffing] = solutions.blocks
    // D-017.1: "Settings" typo corrected to "Driven"
    expect(dataAi.heading).toBe('Data + AI Driven Innovation')
    expect(dataAi.body).toBe(
      'Our Data and AI services combine engineering, analytics, and applied AI to help organizations understand data, predict outcomes, and automate decisions. From trusted analytics to production grade AI systems, we deliver intelligence that works in the real world.',
    )
    expect(dataAi.authored).toBeFalsy()
    // D-016: blocks 02/03 are Authored Content, flagged as such
    for (const block of [customSoftware, techStaffing]) {
      expect(block.authored).toBe(true)
      expect(block.heading).toBeTruthy()
      expect(block.body).toBeTruthy()
    }
    for (const block of solutions.blocks) {
      expect(block.cta.label).toBe('Book a consultation')
    }
  })

  it('GET /api/value-cards matches ValueCardsContent', async () => {
    const valueCards = await get<ValueCardsContent>('/api/value-cards')
    expect(valueCards.cards.map((c) => c.heading)).toEqual([
      'Data Integrity First',
      'Workflows Before Automation',
      'Governance With Same Standard',
    ])
    expect(valueCards.cards[0].body).toBe(
      'AI outputs are only as reliable as the data feeding them. We design, validate, and strengthen your data foundation from the ground up. Garbage in, garbage out is not a risk we take with your business.',
    )
    expect(valueCards.cards[1].body).toBe(
      'Before we build anything, we map your business workflows end to end by surveying the ambiguity. We understand the decisions being made, the people making them, and the systems involved. That clarity determines how and where automation creates real leverage, not just activity.',
    )
    expect(valueCards.cards[2].body).toBe(
      'We implement data governance frameworks that carry the same accountability as human oversight. Your agents operate within defined boundaries. Auditability, control, and compliance are built in, not added on.',
    )
  })

  it('GET /api/showcase matches ShowcaseContent', async () => {
    const showcase = await get<ShowcaseContent>('/api/showcase')
    expect(showcase.logo.src).toMatch(/^\/images\//)
    expect(showcase.heading).toBe('An AI-powered credibility checking platform')
    expect(showcase.body).toBe(
      'that helps users verify claims, analyze sources, and make informed decisions with Quick Check, Deep Check, and Image Check features.',
    )
    // D-017.5: double space before the arrow normalized
    expect(showcase.cta.label).toBe('Explore more →')
    expect(showcase.slides).toHaveLength(4)
    for (const slide of showcase.slides) {
      expect(slide.image.src).toMatch(/^\/images\//)
    }
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

  it('section endpoints honor the ?fail=true error demo', async () => {
    const res = await request(app).get('/api/hero?fail=true')
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Simulated failure' })
  })
})
