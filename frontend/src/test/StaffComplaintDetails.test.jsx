import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))
let currentComplaint

vi.mock('../services/api', () => ({
  default: { get, patch },
  getErrorMessage: (error) => error.message,
  getUploadUrl: (path) => path,
}))

import StaffComplaintDetails from '../pages/staff/StaffComplaintDetails'

describe('StaffComplaintDetails', () => {
  beforeEach(() => {
    currentComplaint = {
      _id: 'complaint-1',
      complaintId: 'HC-1',
      title: 'Water leak',
      description: 'Water is leaking in the washroom.',
      category: 'Plumbing',
      priority: 'High',
      status: 'ASSIGNED',
      hostel: 'Main Hostel',
      block: 'B',
      roomNumber: '204',
      createdAt: '2026-11-12T10:00:00.000Z',
      studentId: { name: 'Student One' },
      statusHistory: [],
    }
    get.mockImplementation(() => Promise.resolve({ data: { complaint: { ...currentComplaint } } }))
    patch.mockImplementation(async (_url, payload) => {
      currentComplaint.status = payload.status
      currentComplaint.resolutionNote = payload.remarks || ''
      return { data: { complaint: { ...currentComplaint } } }
    })
  })

  it('starts assigned work and resolves it with staff notes', async () => {
    render(
      <MemoryRouter initialEntries={['/staff/complaints/complaint-1']}>
        <Routes>
          <Route path="/staff/complaints/:id" element={<StaffComplaintDetails />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText('Water leak')
    fireEvent.click(screen.getByRole('button', { name: /Accept & start work/ }))
    await screen.findByLabelText('Resolution notes')
    expect(patch).toHaveBeenNthCalledWith(1, '/complaints/complaint-1/status', {
      status: 'IN_PROGRESS',
      remarks: 'Work accepted and started',
    })

    fireEvent.change(screen.getByLabelText('Resolution notes'), { target: { value: 'Replaced the damaged pipe and tested it.' } })
    fireEvent.click(screen.getByRole('button', { name: /Mark as resolved/ }))

    await waitFor(() => {
      expect(patch).toHaveBeenNthCalledWith(2, '/complaints/complaint-1/status', {
        status: 'RESOLVED',
        remarks: 'Replaced the damaged pipe and tested it.',
      })
    })
    expect(await screen.findByText('Replaced the damaged pipe and tested it.')).toBeInTheDocument()
  })
})
