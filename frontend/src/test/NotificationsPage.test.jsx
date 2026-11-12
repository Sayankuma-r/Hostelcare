import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))
vi.mock('../services/api', () => ({
  default: { get, patch },
  getErrorMessage: (error) => error.message,
}))
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'student' } }),
}))

import NotificationsPage from '../pages/shared/NotificationsPage'

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue({
      data: {
        unreadCount: 1,
        notifications: [{
          _id: 'notification-1',
          message: 'Your complaint was assigned.',
          isRead: false,
          createdAt: '2026-11-12T10:00:00.000Z',
          complaintId: { _id: 'complaint-1', complaintId: 'HC-1' },
        }],
      },
    })
    patch.mockResolvedValue({ data: { success: true } })
  })

  it('shows a notification and marks it as read', async () => {
    render(<MemoryRouter><NotificationsPage /></MemoryRouter>)

    expect(await screen.findByText('Your complaint was assigned.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))

    await waitFor(() => {
      expect(patch).toHaveBeenCalledWith('/notifications/notification-1/read')
    })
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument()
  })
})
