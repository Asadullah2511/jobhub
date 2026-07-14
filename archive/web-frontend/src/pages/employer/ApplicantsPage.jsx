import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../lib/axios';
import ApplicantKanban from '../../components/employer/ApplicantKanban';

export default function ApplicantsPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  useEffect(() => {
    const jobIdParam = searchParams.get('jobId');
    if (jobIdParam && jobs.length > 0) {
      const job = jobs.find(j => j.job_id === parseInt(jobIdParam) || j.id === parseInt(jobIdParam));
      if (job) setSelectedJob(job);
    } else if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, searchParams]);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/jobs/my-jobs');
      const jobsList = response.data.data || response.data || [];
      setJobs(jobsList);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 mb-8">Applicant Management</h1>
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Jobs Posted Yet</h2>
            <p className="text-neutral-600 mb-6">Post a job to start receiving applications</p>
            <a
              href="/employer/post-job"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Post a Job
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Applicant Management</h1>
        <p className="text-neutral-600 mb-8">Review and manage job applications</p>

        {/* Job Selector */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg mb-6">
          <label htmlFor="job-select" className="block text-sm font-medium text-neutral-700 mb-2">
            Select Job
          </label>
          <select
            id="job-select"
            value={selectedJob?.job_id || selectedJob?.id || ''}
            onChange={(e) => {
              const job = jobs.find(j => (j.job_id || j.id) === parseInt(e.target.value));
              setSelectedJob(job);
            }}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {jobs.map((job) => {
              const jobId = job.job_id || job.id;
              return (
                <option key={jobId} value={jobId}>
                  {job.title} - {job.location} ({job.status || 'Active'})
                </option>
              );
            })}
          </select>
        </div>

        {/* Kanban Board */}
        {selectedJob && (
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">{selectedJob.title}</h2>
              <p className="text-neutral-600">{selectedJob.location} • {selectedJob.jobType || 'Full-time'}</p>
            </div>

            <ApplicantKanban jobId={selectedJob.job_id || selectedJob.id} />
          </div>
        )}
      </div>
    </div>
  );
}
