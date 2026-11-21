import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../services/api', () => ({
  default: { get },
  getErrorMessage: (error) => error.message,
}))

import AdminStudents from '../pages/admin/AdminStudents'

describe('Admin registered users', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({
      data: {
        users: [{
          _id: 'student-1',
          name: 'Student One',
          email: 'student@example.com',
          role: 'student',
          hostel: 'Main Hostel',
          block: 'B',
          roomNumber: '204',
          phone: '5550100',
          createdAt: '2026-01-10T00:00:00.000Z',
        }],
        total: 26,
        pages: 2,
      },
    })
  })

  it('displays registered account details and retrieves the next page', async () => {
    render(<AdminStudents />)

    expect(await screen.findByText('student@example.com')).toBeInTheDocument()
    expect(screen.getByText('Main Hostel · Block B · Room 204')).toBeInTheDocument()
    expect(screen.getByText('26 registered')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(get).toHaveBeenLastCalledWith('/admin/users', {
      params: { role: 'all', search: '', page: 2, limit: 25 },
    }))
  })

  it('filters registered accounts by role', async () => {
    render(<AdminStudents />)
    await screen.findByText('student@example.com')

    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by user role' }), {
      target: { value: 'staff' },
    })

    await waitFor(() => expect(get).toHaveBeenLastCalledWith('/admin/users', {
      params: { role: 'staff', search: '', page: 1, limit: 25 },
    }))
  })
})
