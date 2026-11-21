import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

const { get, authUser, login, logout } = vi.hoisted(() => ({
  get: vi.fn(),
  authUser: { value: { name: 'Warden', role: 'admin' } },
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../services/api', () => ({
  default: { get, post: vi.fn(), patch: vi.fn() },
  getErrorMessage: (error) => error.message,
}))

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: authUser.value,
    login,
    logout,
  }),
}))

import App from '../App'

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    authUser.value = { name: 'Warden', role: 'admin' }
    login.mockReset()
    logout.mockReset()
    get.mockImplementation((path) => {
      if (path === '/admin/users') {
        return Promise.resolve({
          data: {
            users: [{ _id: 'student-1', name: 'Student One', email: 'student@example.com', role: 'student', createdAt: '2026-01-01' }],
            total: 1,
            pages: 1,
          },
        })
      }
      if (path === '/notifications') return Promise.resolve({ data: { notifications: [], unreadCount: 0 } })
      return Promise.resolve({ data: { status: 'ok' } })
    })
  })

  it('renders the HostelCare landing page', async () => {
    render(<App />)
    expect(screen.getAllByText('HostelCare')).toHaveLength(2)
    expect(screen.getByText('Report. Track. Resolve.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Report an issue' })).toHaveAttribute('href', '/register')
    expect(await screen.findByText(/API: online/)).toBeInTheDocument()
  })

  it('opens the separate registered-users panel at /admin', async () => {
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(await screen.findByText('Registered users')).toBeInTheDocument()
    expect(await screen.findByText('student@example.com')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
    expect(screen.queryByText('Admin overview')).not.toBeInTheDocument()
  })

  it('shows the admin sign-in page at /admin instead of redirecting signed-out users home', async () => {
    authUser.value = null
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Administrator sign in' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })
})
