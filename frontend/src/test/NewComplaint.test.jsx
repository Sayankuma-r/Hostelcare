import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Student One', hostel: 'Main Hostel', block: 'B', roomNumber: '204' },
  }),
}))

vi.mock('../services/api', () => ({
  default: { post },
  getErrorMessage: (error) => error.message,
}))

import NewComplaint from '../pages/student/NewComplaint'

const renderForm = () => render(
  <MemoryRouter initialEntries={['/student/complaints/new']}>
    <Routes>
      <Route path="/student/complaints/new" element={<NewComplaint />} />
      <Route path="/student/complaints/:id" element={<p>Complaint details view</p>} />
    </Routes>
  </MemoryRouter>
)

describe('NewComplaint', () => {
  beforeEach(() => {
    post.mockReset()
  })

  it('submits the form and opens the created complaint', async () => {
    post.mockResolvedValue({ data: { complaint: { _id: 'complaint-1' } } })
    renderForm()

    fireEvent.change(screen.getByLabelText('Complaint title'), { target: { value: 'Broken shower in room' } })
    fireEvent.change(screen.getByLabelText('Describe the issue'), { target: { value: 'The shower has leaked since yesterday morning.' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Plumbing' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit complaint' }))

    expect(await screen.findByText('Complaint details view')).toBeInTheDocument()
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))

    const formData = post.mock.calls[0][1]
    expect(formData.get('hostel')).toBe('Main Hostel')
    expect(formData.get('block')).toBe('B')
    expect(formData.get('roomNumber')).toBe('204')
    expect(formData.get('category')).toBe('Plumbing')
  })

  it('rejects unsupported image types before upload', async () => {
    renderForm()
    const input = document.getElementById('image')
    const file = new File(['not an image'], 'document.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a JPEG, PNG, or WebP image.')
    expect(post).not.toHaveBeenCalled()
  })
})
