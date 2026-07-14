import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

const columns = [
  { id: 'new', title: 'New', color: 'primary' },
  { id: 'reviewed', title: 'Reviewed', color: 'secondary' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'success' },
  { id: 'rejected', title: 'Rejected', color: 'error' },
];

export default function ApplicantKanban({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/jobs/${jobId}/applications`);
      const apps = response.data.data || response.data || [];
      setApplications(apps);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`/jobs/applications/${applicationId}/status`, {
        status: newStatus,
      });
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId || app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => {
      const appStatus = app.status?.toLowerCase() || 'new';
      return appStatus === status || (status === 'new' && appStatus === 'pending');
    });
  };

  const renderApplicantCard = (app) => {
    const appId = app.id || app.application_id;

    return (
      <div
        key={appId}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-neutral-900">{app.applicant_name || app.name || 'Applicant'}</h4>
            <p className="text-sm text-neutral-600">{app.applicant_email || app.email || 'No email'}</p>
          </div>
          <span className="text-xs text-neutral-500">
            {new Date(app.applied_at || app.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* CV Summary */}
        {app.cv_summary && (
          <div className="bg-neutral-50 rounded p-3 mb-3">
            <p className="text-xs font-medium text-neutral-700 mb-1">CV Summary:</p>
            <p className="text-xs text-neutral-600 line-clamp-3">{app.cv_summary}</p>
          </div>
        )}

        {/* Skills */}
        {app.skills && app.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {app.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {app.skills.length > 3 && (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                +{app.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Status Actions */}
        <div className="flex gap-2">
          <select
            value={app.status || 'new'}
            onChange={(e) => updateApplicationStatus(appId, e.target.value)}
            className="flex-1 text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
          >
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnApps = getApplicationsByStatus(column.id);

        return (
          <div key={column.id} className="bg-neutral-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">{column.title}</h3>
              <span className={`px-2 py-1 bg-${column.color}-100 text-${column.color}-700 rounded-full text-xs font-semibold`}>
                {columnApps.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnApps.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No applicants</p>
              ) : (
                columnApps.map(renderApplicantCard)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
