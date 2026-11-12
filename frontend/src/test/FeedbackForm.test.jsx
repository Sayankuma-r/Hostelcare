import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('../services/api', () => ({
  default: { post },
  getErrorMessage: (error) => error.message,
}))

import FeedbackForm from '../components/FeedbackForm'

describe('FeedbackForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits the rating and comment, then displays the saved feedback', async () => {
    const savedFeedback = {
      rating: 4,
      comment: 'The issue was fixed well.',
      createdAt: '2026-11-12T10:00:00.000Z',
    }
    const onSubmitted = vi.fn()
    post.mockResolvedValue({ data: { feedback: savedFeedback } })

    const { unmount } = render(<FeedbackForm complaintId="complaint-1" feedback={null} onSubmitted={onSubmitted} />)

    fireEvent.click(screen.getByRole('button', { name: '4 stars' }))
    fireEvent.change(screen.getByLabelText('Your comments'), { target: { value: savedFeedback.comment } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit feedback' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/feedback', {
        complaintId: 'complaint-1',
        rating: 4,
        comment: savedFeedback.comment,
      })
    })
    expect(onSubmitted).toHaveBeenCalledWith(savedFeedback)

    unmount()
    render(<FeedbackForm complaintId="complaint-1" feedback={savedFeedback} onSubmitted={onSubmitted} />)
    expect(screen.getByText('Your feedback')).toBeInTheDocument()
    expect(screen.getByText(savedFeedback.comment)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit feedback' })).not.toBeInTheDocument()
  })
})
