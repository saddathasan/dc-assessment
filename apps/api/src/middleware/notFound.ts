import type { Request, Response } from 'express'

// Terminal JSON 404: mounted after every route so unmatched paths never fall
// through to Express's default HTML error page.
export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` })
}
