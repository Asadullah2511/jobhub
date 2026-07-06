import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL for Expo
// IMPORTANT: Replace with YOUR computer's local IP address
// Find it: Windows (ipconfig) | Mac/Linux (ifconfig)
// Your phone and computer must be on the same WiFi network
const API_URL = __DEV__
  ? 'http://192.168.0.107:5000/api'  // ← YOUR LOCAL IP
  : 'https://your-production-url.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }

    // Log request in development
    if (__DEV__) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }

    // Return response.data.data if it exists (your standardized format)
    return response.data.success ? response.data : response.data;
  },
  async (error) => {
    if (__DEV__) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Token expired or invalid - logout user
      if (status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // You can emit event here to navigate to login
      }

      // Return standardized error
      return Promise.reject({
        success: false,
        message: data.message || 'Something went wrong',
        errorCode: data.errorCode || 'UNKNOWN_ERROR',
        details: data.details,
        status
      });
    }

    // Network error
    if (error.request) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      });
    }

    // Something else happened
    return Promise.reject({
      success: false,
      message: error.message || 'An unexpected error occurred',
      errorCode: 'UNEXPECTED_ERROR'
    });
  }
);

export default apiClient;
export { API_URL };
