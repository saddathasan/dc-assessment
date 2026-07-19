import express from 'express'
import helmet from 'helmet'
import type { HealthPayload } from '@metatech/shared'
import { simulateNetwork } from './middleware/simulateNetwork.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(helmet())
app.use(simulateNetwork)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' } satisfies HealthPayload)
})

app.use(notFound)
app.use(errorHandler)
