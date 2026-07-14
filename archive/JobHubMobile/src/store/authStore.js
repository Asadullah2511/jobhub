import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authAPI from '../api/auth';

/**
 * Authentication Store
 * Manages user authentication state
 */

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  // Actions

  /**
   * Login user
   */
  login: async (identifier, password) => {
    set({ loading: true, error: null });

    try {
      const response = await authAPI.login(identifier, password);

      if (response.success) {
        const { user, token } = response.data;

        // Save to AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        return { success: true, user, token };
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    set({ loading: true, error: null });

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        const { user, token } = response.data;

        // Save to AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        return { success: true, user, token };
      }

      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // Clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Load user from AsyncStorage (on app start)
   */
  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
        return { success: true, user, token };
      }

      return { success: false, message: 'No saved session' };
    } catch (error) {
      console.error('Load user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Refresh user profile
   */
  refreshProfile: async () => {
    try {
      const response = await authAPI.getProfile();

      if (response.success) {
        const user = response.data;

        // Update AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({ user });
        return { success: true, user };
      }

      throw new Error(response.message || 'Failed to refresh profile');
    } catch (error) {
      console.error('Refresh profile error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user in store (after profile edit)
   */
  updateUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser },
    }));
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
