import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'student', hostel: 'Main Hostel', block: 'B' } }),
}))

vi.mock('../services/api', () => ({
  default: { get, patch },
  getErrorMessage: (error) => error.message,
}))

import AnnouncementsPage from '../pages/shared/AnnouncementsPage'
import AnnouncementDetails from '../pages/shared/AnnouncementDetails'

describe('Announcement pages', () => {
  beforeEach(() => {
    get.mockReset()
    patch.mockReset()
  })

  it('shows unread relevant announcements and links to their detail page', async () => {
    get.mockResolvedValue({
      data: {
        unreadCount: 1,
        announcements: [{
          _id: 'announcement-1',
          title: 'Water maintenance tomorrow',
          content: 'Water supply will be interrupted for maintenance.',
          category: 'Water',
          priority: 'High',
          isRead: false,
          createdAt: '2026-11-20T00:00:00.000Z',
        }],
      },
    })
    render(
      <MemoryRouter initialEntries={['/student/announcements']}>
        <Routes>
          <Route path="/student/announcements" element={<AnnouncementsPage />} />
          <Route path="/student/announcements/:id" element={<p>Announcement details route</p>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Water maintenance tomorrow')).toBeInTheDocument()
    expect(screen.getByText('1 unread announcement for you.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: /Water maintenance tomorrow/ }))
    expect(await screen.findByText('Announcement details route')).toBeInTheDocument()
  })

  it('loads the detail and marks an unread announcement as read', async () => {
    get.mockResolvedValue({
      data: {
        announcement: {
          _id: 'announcement-2',
          title: 'Power outage notice',
          content: 'Power will be interrupted from 9 AM to 10 AM.',
          category: 'Electricity',
          priority: 'Medium',
          isRead: false,
          createdAt: '2026-11-20T00:00:00.000Z',
        },
      },
    })
    patch.mockResolvedValue({ data: { success: true } })
    render(
      <MemoryRouter initialEntries={['/student/announcements/announcement-2']}>
        <Routes>
          <Route path="/student/announcements/:id" element={<AnnouncementDetails />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'Power outage notice' })).toBeInTheDocument()
    await waitFor(() => expect(patch).toHaveBeenCalledWith('/announcements/announcement-2/read'))
    expect(screen.getByText('Power will be interrupted from 9 AM to 10 AM.')).toBeInTheDocument()
  })
})
