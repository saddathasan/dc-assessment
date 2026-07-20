// Content routes: one GET per Section (D-007) — fine-grained, so each Section
// loads, fails, and demos independently. Payloads come from the typed data
// barrel (bundled at build time; no fs at runtime — Workers, D-011).
import { Router } from 'express'
import * as content from '../data/index.js'

// Slug → payload map; the loop below turns each entry into GET /api/<slug>.
// No value-cards or showcase route: both are per-tab content of the Solutions
// panel and ship inside /api/solutions (D-028.4).
const sections = {
  navigation: content.navigation,
  hero: content.hero,
  'trusted-by': content.trustedBy,
  'we-are': content.weAre,
  solutions: content.solutions,
  'tech-stack': content.techStack,
  footer: content.footer,
}

export const contentRouter = Router()

for (const [slug, payload] of Object.entries(sections)) {
  contentRouter.get(`/api/${slug}`, (_req, res) => {
    res.json(payload)
  })
}
