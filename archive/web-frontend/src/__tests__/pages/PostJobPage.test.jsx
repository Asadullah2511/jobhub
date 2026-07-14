import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostJobPage from '../../pages/employer/PostJobPage';
import axios from '../../lib/axios';

vi.mock('../../lib/axios');

describe('PostJobPage - Hiring Mode Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both hiring mode options', () => {
    render(<PostJobPage />);

    expect(screen.getByText('Permanent Role')).toBeInTheDocument();
    expect(screen.getByText('Short-Term Task')).toBeInTheDocument();
  });

  it('permanent mode is selected by default', () => {
    render(<PostJobPage />);

    const permanentButton = screen.getByText('Permanent Role').closest('button');
    expect(permanentButton).toHaveClass('border-primary-500');
  });

  it('switches to short-term mode when clicked', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const shortTermButton = screen.getByText('Short-Term Task').closest('button');
    await user.click(shortTermButton);

    expect(shortTermButton).toHaveClass('border-accent-500');
  });

  it('changes job type options when switching mode', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    // Default permanent mode
    expect(screen.getByRole('combobox', { name: /job type/i })).toHaveTextContent('Full-time');

    // Switch to short-term
    const shortTermButton = screen.getByText('Short-Term Task').closest('button');
    await user.click(shortTermButton);

    await waitFor(() => {
      const select = screen.getByRole('combobox', { name: /job type/i });
      expect(select).toHaveTextContent('One-time Task');
    });
  });

  it('submits form with correct hiring mode', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<PostJobPage />);

    await user.type(screen.getByLabelText(/job title/i), 'Test Job');
    await user.type(screen.getByLabelText(/description/i), 'This is a test job description');
    await user.type(screen.getByLabelText(/location/i), 'Lahore');

    await user.click(screen.getByRole('button', { name: /post job/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/jobs',
        expect.objectContaining({
          title: 'Test Job',
          hiringMode: 'permanent',
        })
      );
    });
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<PostJobPage />);

    await user.type(screen.getByLabelText(/job title/i), 'Test Job');
    await user.type(screen.getByLabelText(/description/i), 'This is a test job description');
    await user.type(screen.getByLabelText(/location/i), 'Lahore');

    await user.click(screen.getByRole('button', { name: /post job/i }));

    await waitFor(() => {
      expect(screen.getByText('Job posted successfully!')).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to create job' } },
    });

    render(<PostJobPage />);

    await user.type(screen.getByLabelText(/job title/i), 'Test Job');
    await user.type(screen.getByLabelText(/description/i), 'This is a test job description');
    await user.type(screen.getByLabelText(/location/i), 'Lahore');

    await user.click(screen.getByRole('button', { name: /post job/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create job/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    await user.click(screen.getByRole('button', { name: /post job/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('clears form when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const titleInput = screen.getByLabelText(/job title/i);
    await user.type(titleInput, 'Test Job');

    expect(titleInput).toHaveValue('Test Job');

    await user.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });
});
