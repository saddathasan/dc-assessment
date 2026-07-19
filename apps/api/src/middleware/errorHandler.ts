import type { NextFunction, Request, Response } from 'express'

interface HttpError extends Error {
  status?: number
}

// Terminal error middleware: every thrown or rejected handler ends here as a
// JSON ApiError. Express 5 forwards rejected async handlers automatically —
// no try/catch needed in routes. Only 5xx errors are logged; 4xx are expected.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const error: HttpError = err instanceof Error ? err : new Error(String(err))
  const status = error.status ?? 500
  if (status >= 500) console.error(error)
  res.status(status).json({ error: error.message })
}
