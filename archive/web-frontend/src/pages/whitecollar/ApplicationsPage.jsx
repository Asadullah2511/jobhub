import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

const statusConfig = {
  pending: { label: 'Applied', color: 'primary', icon: '📝' },
  reviewed: { label: 'Under Review', color: 'secondary', icon: '👀' },
  shortlisted: { label: 'Shortlisted', color: 'success', icon: '✨' },
  rejected: { label: 'Rejected', color: 'error', icon: '❌' },
  hired: { label: 'Hired', color: 'success', icon: '🎉' },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'shortlisted', etc.

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/jobs/applications/my-applications');
      const apps = response.data.data || response.data || [];
      setApplications(apps);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => (app.status || 'pending').toLowerCase() === filter);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => (a.status || 'pending') === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    hired: applications.filter(a => a.status === 'hired').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Applications</h1>
        <p className="text-neutral-600 mb-8">Track the status of your job applications</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { key: 'all', label: 'Total', icon: '📊' },
            { key: 'pending', label: 'Applied', icon: '📝' },
            { key: 'reviewed', label: 'Reviewed', icon: '👀' },
            { key: 'shortlisted', label: 'Shortlisted', icon: '✨' },
            { key: 'rejected', label: 'Rejected', icon: '❌' },
            { key: 'hired', label: 'Hired', icon: '🎉' },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                filter === stat.key
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-neutral-900">{statusCounts[stat.key]}</div>
              <div className="text-xs text-neutral-600">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Applications Table */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
            </h2>
            <p className="text-neutral-600 mb-6">
              {filter === 'all'
                ? 'Start applying to jobs to track your applications here'
                : `You don't have any applications with this status`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Applications
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredApplications.map((app) => {
                    const appId = app.id || app.application_id;
                    const status = (app.status || 'pending').toLowerCase();
                    const config = statusConfig[status] || statusConfig.pending;

                    return (
                      <tr key={appId} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {app.job_title || app.title || 'Job Title'}
                            </div>
                            <div className="text-sm text-neutral-600">
                              {app.location || 'Location not specified'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-900">
                          {app.company || 'Company Name'}
                        </td>
                        <td className="px-6 py-4 text-neutral-600">
                          {new Date(app.applied_at || app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 bg-${config.color}-100 text-${config.color}-700 rounded-full text-sm font-medium`}
                          >
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {applications.length > 0 && (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl p-6 shadow-lg">
              <div className="text-sm text-neutral-600 mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-neutral-900">
                {statusCounts.hired > 0
                  ? `${Math.round((statusCounts.hired / statusCounts.all) * 100)}%`
                  : '0%'}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl p-6 shadow-lg">
              <div className="text-sm text-neutral-600 mb-1">Active Applications</div>
              <div className="text-3xl font-bold text-neutral-900">
                {statusCounts.pending + statusCounts.reviewed + statusCounts.shortlisted}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl p-6 shadow-lg">
              <div className="text-sm text-neutral-600 mb-1">Response Rate</div>
              <div className="text-3xl font-bold text-neutral-900">
                {statusCounts.all > 0
                  ? `${Math.round(((statusCounts.all - statusCounts.pending) / statusCounts.all) * 100)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
