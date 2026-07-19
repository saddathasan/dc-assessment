import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

describe('api foundation', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toContain('/api/nope')
  })

  it('?fail=true simulates a 500 for error-state demos', async () => {
    const res = await request(app).get('/api/health?fail=true')
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Simulated failure' })
  })
})
