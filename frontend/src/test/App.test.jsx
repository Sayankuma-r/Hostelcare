import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { status: 'ok' } }) },
}))

import App from '../App'

describe('App', () => {
  it('renders the HostelCare landing page', async () => {
    render(<App />)
    expect(screen.getByText('HostelCare')).toBeInTheDocument()
    expect(screen.getByText('Report. Track. Resolve.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Student registration' })).toHaveAttribute('href', '/register')
    expect(await screen.findByText(/API: online/)).toBeInTheDocument()
  })
})
