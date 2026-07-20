import type { NextFunction, Request, Response } from 'express'

// Demo affordance for the frontend's loading/error states (D-012):
// ?delay=<ms> postpones the response, ?fail=true returns a 500.
export function simulateNetwork(req: Request, _res: Response, next: NextFunction) {
  // Capped at 10s so a mistyped delay can't hang a request indefinitely.
  const delayMs = Math.min(Number(req.query.delay ?? 0) || 0, 10_000)
  const shouldFail = req.query.fail === 'true'

  setTimeout(() => {
    if (shouldFail) {
      next(Object.assign(new Error('Simulated failure'), { status: 500 }))
      return
    }
    next()
  }, delayMs)
}
