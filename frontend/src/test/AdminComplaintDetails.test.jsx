import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))
const complaint = {
  _id: 'complaint-1',
  complaintId: 'HC-1',
  title: 'Water leak',
  description: 'Water is leaking in the washroom.',
  category: 'Plumbing',
  priority: 'High',
  status: 'SUBMITTED',
  hostel: 'Main Hostel',
  block: 'B',
  roomNumber: '204',
  createdAt: '2026-11-12T10:00:00.000Z',
  studentId: { name: 'Student One', email: 'student@example.com' },
  assignedTo: null,
  statusHistory: [],
}

vi.mock('../services/api', () => ({
  default: { get, patch },
  getErrorMessage: (error) => error.message,
  getUploadUrl: (path) => path,
}))

import AdminComplaintDetails from '../pages/admin/AdminComplaintDetails'

describe('AdminComplaintDetails', () => {
  beforeEach(() => {
    get.mockImplementation((url) => (
      url === '/admin/users'
        ? Promise.resolve({ data: { users: [{ _id: 'staff-1', name: 'Staff One' }] } })
        : Promise.resolve({ data: { complaint: { ...complaint } } })
    ))
    patch.mockReset().mockResolvedValue({ data: { complaint: { ...complaint } } })
  })

  it('assigns the complaint to the selected staff member', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/complaints/complaint-1']}>
        <Routes>
          <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText('Water leak')
    fireEvent.change(screen.getByLabelText('Staff member'), { target: { value: 'staff-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Assign complaint' }))

    await waitFor(() => expect(patch).toHaveBeenCalledWith('/complaints/complaint-1/assign', { staffId: 'staff-1' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Complaint assigned successfully.')
  })
})
