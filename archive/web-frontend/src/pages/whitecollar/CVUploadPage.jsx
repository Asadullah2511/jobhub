import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';

export default function CVUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    skills: '',
    experience: '',
    education: '',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document (.pdf, .docx)');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setParsing(true);
      setError('');

      const formData = new FormData();
      formData.append('cv', file);

      const response = await axios.post('/profile/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data.data || response.data;
      setParsedData(data);
      setEditedData({
        skills: data.skills || '',
        experience: data.experience || '',
        education: data.education || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/profile', {
        skills: editedData.skills,
        experience: editedData.experience,
        education: editedData.education,
      });

      alert('Profile updated successfully!');
      navigate('/whitecollar/job-matching');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  const handleSkipToMatching = () => {
    navigate('/whitecollar/job-matching');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Upload Your CV</h1>
        <p className="text-neutral-600 mb-8">
          Upload your resume and we'll extract your skills, experience, and education
        </p>

        {!parsedData ? (
          /* Upload Section */
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-lg">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center mb-6 hover:border-primary-400 transition-colors">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {file ? file.name : 'Select your CV'}
              </h3>
              <p className="text-neutral-600 mb-4">
                PDF or Word document, max 5MB
              </p>
              <label className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (parsing ? 'Parsing...' : 'Uploading...') : 'Upload & Parse CV'}
              </button>
              <button
                onClick={handleSkipToMatching}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        ) : (
          /* Parsed Results Section */
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              ✓ CV parsed successfully! Review and edit the extracted information below.
            </div>

            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Extracted Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  {editMode ? '👁️ Preview' : '✏️ Edit'}
                </button>
              </div>

              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Skills
                  </label>
                  {editMode ? (
                    <textarea
                      value={editedData.skills}
                      onChange={(e) => setEditedData({ ...editedData, skills: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter skills separated by commas"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-neutral-50 rounded-lg">
                      {editedData.skills || parsedData.skills ? (
                        <div className="flex flex-wrap gap-2">
                          {(editedData.skills || parsedData.skills).split(',').map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500">No skills extracted</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Experience
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedData.experience}
                      onChange={(e) => setEditedData({ ...editedData, experience: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 5 Years"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-neutral-50 rounded-lg">
                      <p className="text-neutral-900">
                        {editedData.experience || parsedData.experience || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Education
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedData.education}
                      onChange={(e) => setEditedData({ ...editedData, education: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Bachelor's Degree"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-neutral-50 rounded-lg">
                      <p className="text-neutral-900">
                        {editedData.education || parsedData.education || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Save & Find Matching Jobs
                </button>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                    setEditedData({ skills: '', experience: '', education: '' });
                  }}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Upload Different CV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
