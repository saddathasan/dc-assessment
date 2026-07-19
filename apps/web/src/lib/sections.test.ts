// Proves the demo-param forwarding contract (D-012): only ?delay and ?fail
// travel from the page URL to API calls; everything else is dropped.
import { describe, expect, it } from 'vitest'
import { demoQueryString } from './sections'

describe('demoQueryString', () => {
  it('forwards the ?delay and ?fail demo params to API calls', () => {
    expect(demoQueryString('?delay=2000')).toBe('?delay=2000')
    expect(demoQueryString('?fail=true')).toBe('?fail=true')
    expect(demoQueryString('?delay=500&fail=true')).toBe('?delay=500&fail=true')
  })

  it('drops everything else', () => {
    expect(demoQueryString('')).toBe('')
    expect(demoQueryString('?utm_source=x')).toBe('')
    expect(demoQueryString('?delay=500&utm_source=x')).toBe('?delay=500')
  })
})
