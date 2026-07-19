import { render, screen } from '@testing-library/react'
import { TokenDemo } from './TokenDemo'

describe('TokenDemo', () => {
  it('renders the token proof page with display headline and CTA', () => {
    render(<TokenDemo />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building Intelligence')
    expect(screen.getByRole('button', { name: 'Book for Demo' })).toBeInTheDocument()
  })
})
