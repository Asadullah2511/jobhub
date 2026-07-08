import apiClient from './client';

/**
 * Authentication API
 * All endpoints return standardized responses from backend
 */

const authAPI = {
  /**
   * Login user
   * @param {string} identifier - Username or phone number
   * @param {string} password - User password
   * @returns {Promise} { success, data: { user, token }, message }
   */
  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} { success, data: { user, token }, message }
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} { success, data: user }
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise} { success, message }
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise} { success, message }
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authAPI;
