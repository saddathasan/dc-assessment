import { Router } from 'express'
import * as content from '../data/index.js'

// One endpoint per Section (D-007): fine-grained, independently demo-able.
const sections = {
  navigation: content.navigation,
  hero: content.hero,
  'trusted-by': content.trustedBy,
  'we-are': content.weAre,
  solutions: content.solutions,
  'value-cards': content.valueCards,
  showcase: content.showcase,
  'tech-stack': content.techStack,
  footer: content.footer,
}

export const contentRouter = Router()

for (const [slug, payload] of Object.entries(sections)) {
  contentRouter.get(`/api/${slug}`, (_req, res) => {
    res.json(payload)
  })
}
