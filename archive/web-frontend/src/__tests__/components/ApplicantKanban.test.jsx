import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicantKanban from '../../components/employer/ApplicantKanban';
import axios from '../../lib/axios';

vi.mock('../../lib/axios');

const mockApplications = [
  {
    id: 1,
    application_id: 1,
    applicant_name: 'John Doe',
    applicant_email: 'john@example.com',
    status: 'new',
    applied_at: '2026-07-01T00:00:00Z',
    cv_summary: 'Experienced developer',
    skills: ['React', 'Node.js'],
  },
  {
    id: 2,
    application_id: 2,
    applicant_name: 'Jane Smith',
    applicant_email: 'jane@example.com',
    status: 'reviewed',
    applied_at: '2026-07-02T00:00:00Z',
    skills: ['Vue', 'Python'],
  },
];

describe('ApplicantKanban', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four kanban columns', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockApplications } });

    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
      expect(screen.getByText('Shortlisted')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  it('displays applicants in correct columns', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockApplications } });

    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows CV summary when available', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockApplications } });

    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Experienced developer')).toBeInTheDocument();
    });
  });

  it('displays skills as tags', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockApplications } });

    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  it('changes status when dropdown is changed', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockApplications } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const user = userEvent.setup();
    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'shortlisted');

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/jobs/applications/1/status',
        { status: 'shortlisted' }
      );
    });
  });

  it('shows loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ApplicantKanban jobId={1} />);

    expect(screen.getByText('Loading applications...')).toBeInTheDocument();
  });

  it('shows error message on fetch failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<ApplicantKanban jobId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load applications')).toBeInTheDocument();
    });
  });
});
