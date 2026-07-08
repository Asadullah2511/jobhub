import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from '../../lib/axios';

const calculateMatchScore = (jobSkills, userSkills) => {
  if (!jobSkills || !userSkills) return 0;

  const jobSkillsArray = jobSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const userSkillsArray = userSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  if (jobSkillsArray.length === 0) return 0;

  const matches = jobSkillsArray.filter(skill =>
    userSkillsArray.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );

  return Math.round((matches.length / jobSkillsArray.length) * 100);
};

export default function JobMatchingPage() {
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [sortBy, setSortBy] = useState('match'); // 'match' or 'date'

  useEffect(() => {
    fetchUserProfile();
    fetchJobs();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setUserProfile(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/jobs', {
        params: { hiringMode: 'permanent' },
      });
      const jobsList = response.data.data || response.data || [];
      setJobs(jobsList);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (window.confirm('Apply to this job?')) {
      try {
        await axios.post(`/jobs/${jobId}/apply`);
        alert('Application submitted successfully!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to apply. Please try again.');
      }
    }
  };

  const jobsWithScores = jobs.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job.skills || job.requirements, userProfile?.skills),
  }));

  const sortedJobs = [...jobsWithScores].sort((a, b) => {
    if (sortBy === 'match') {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.created_at || b.postedDate) - new Date(a.created_at || a.postedDate);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading job matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Job Matches</h1>
            <p className="text-neutral-600">
              {userProfile?.skills
                ? `Jobs ranked by skill match with your profile`
                : 'Upload your CV to see personalized matches'}
            </p>
          </div>
          {!userProfile?.skills && (
            <Link
              to="/whitecollar/cv-upload"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Upload CV
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-neutral-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="match">Best Match</option>
              <option value="date">Most Recent</option>
            </select>

            {userProfile?.skills && (
              <div className="ml-auto text-sm text-neutral-600">
                Your skills: <span className="font-medium">{userProfile.skills.split(',').length} skills</span>
              </div>
            )}
          </div>
        </div>

        {/* Job List */}
        {sortedJobs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Jobs Available</h2>
            <p className="text-neutral-600">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedJobs.map((job) => {
              const jobId = job.job_id || job.id;
              const matchScore = job.matchScore;

              return (
                <div
                  key={jobId}
                  className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-neutral-900">{job.title}</h3>
                        {matchScore > 0 && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              matchScore >= 70
                                ? 'bg-success-100 text-success-700'
                                : matchScore >= 40
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {matchScore}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-700 mb-3">{job.company || 'Company'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <span>📍</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <span>💰</span>
                      <span>{job.salary || 'Negotiable'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <span>🕐</span>
                      <span>{job.jobType || 'Full-time'}</span>
                    </div>
                  </div>

                  <p className="text-neutral-700 mb-4 line-clamp-2">{job.description}</p>

                  {job.requirements && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.split(',').slice(0, 5).map((req, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {req.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApply(jobId)}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Apply Now
                    </button>
                    <button className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                      Save Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
