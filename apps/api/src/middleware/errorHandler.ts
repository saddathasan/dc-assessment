import type { NextFunction, Request, Response } from 'express'

interface HttpError extends Error {
  status?: number
}

// Express 5 forwards rejected async handlers here automatically.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const error: HttpError = err instanceof Error ? err : new Error(String(err))
  const status = error.status ?? 500
  if (status >= 500) console.error(error)
  res.status(status).json({ error: error.message })
}
