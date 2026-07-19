// The Express app shared by every runtime: server.ts listens locally,
// worker.ts wraps it for Cloudflare (D-011). Middleware order is the contract:
// helmet → simulateNetwork (demo affordances) → routes → 404 → error handler.
import express from 'express'
import helmet from 'helmet'
import type { HealthPayload } from '@metatech/shared'
import { simulateNetwork } from './middleware/simulateNetwork.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { contentRouter } from './routes/content.js'

export const app = express()

app.use(helmet())
app.use(simulateNetwork)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' } satisfies HealthPayload)
})

app.use(contentRouter)

app.use(notFound)
app.use(errorHandler)
