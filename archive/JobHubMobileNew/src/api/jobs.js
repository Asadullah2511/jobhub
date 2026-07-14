import apiClient from './client';

/**
 * Jobs API
 * Handles all job-related endpoints
 */

const jobsAPI = {
  /**
   * Get jobs list with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.type - Job type ('blue' or 'white')
   * @param {string} params.search - Search query
   * @returns {Promise} { success, data: jobs[], pagination }
   */
  getJobs: async (params = {}) => {
    try {
      const response = await apiClient.get('/jobs', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise} { success, data: job }
   */
  getJobById: async (jobId) => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get nearby jobs based on location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in km (default: 10)
   * @param {string} search - Optional search query
   * @returns {Promise} { success, data: jobs[] }
   */
  getNearbyJobs: async (lat, lng, radius = 10, search = '') => {
    try {
      const response = await apiClient.get('/jobs/nearby', {
        params: { lat, lng, radius, search },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get matched jobs for current user
   * @param {string} type - Job type ('blue' or 'white')
   * @param {string} search - Optional search query
   * @returns {Promise} { success, data: jobs[] }
   */
  getMatchedJobs: async (type, search = '') => {
    try {
      const response = await apiClient.get('/jobs/match', {
        params: { type, search },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new job (Employer only)
   * @param {Object} jobData - Job data
   * @returns {Promise} { success, data: job, message }
   */
  createJob: async (jobData) => {
    try {
      const response = await apiClient.post('/jobs', jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete job (Employer only)
   * @param {string} jobId - Job ID
   * @returns {Promise} { success, message }
   */
  deleteJob: async (jobId) => {
    try {
      const response = await apiClient.delete(`/jobs/${jobId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply for a job
   * @param {string} jobId - Job ID
   * @param {Object} applicationData - Application data
   * @param {string} applicationData.resume_url - Resume URL (optional)
   * @param {string} applicationData.cover_letter - Cover letter (optional)
   * @returns {Promise} { success, data: application, message }
   */
  applyForJob: async (jobId, applicationData = {}) => {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/apply`, applicationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get my jobs (Employer)
   * @returns {Promise} { success, data: jobs[] }
   */
  getMyJobs: async () => {
    try {
      const response = await apiClient.get('/jobs/my-jobs');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get my applications (Worker)
   * @returns {Promise} { success, data: applications[] }
   */
  getMyApplications: async () => {
    try {
      const response = await apiClient.get('/jobs/applications/my-applications');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get job applications (Employer)
   * @param {string} jobId - Job ID
   * @returns {Promise} { success, data: applications[] }
   */
  getJobApplications: async (jobId) => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}/applications`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update application status (Employer)
   * @param {string} applicationId - Application ID
   * @param {string} status - New status ('Shortlisted', 'Rejected', 'In Progress', 'Completed')
   * @returns {Promise} { success, data: application, message }
   */
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await apiClient.put(`/jobs/applications/${applicationId}/status`, {
        status,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default jobsAPI;
