import api, { setAuthToken } from '../utils/api';
import * as SecureStore from 'expo-secure-store';

export const login = async (identifier, password) => {
  try {
    console.log('🔐 Attempting login...');
    const response = await api.post('/auth/login', { identifier, password });
    console.log('✅ Login response received:', response.data);

    // Backend returns: { success: true, data: { token, user } }
    const { token, user } = response.data.data || response.data;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setAuthToken(token);

    console.log('✅ Login successful for user:', user.user_id);
    return { token, user };
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('📝 Attempting registration for:', userData.user_id);
    const response = await api.post('/auth/register', userData);
    console.log('✅ Registration response received:', response.data);

    // Backend returns: { success: true, data: { token, user } }
    const { token, user } = response.data.data || response.data;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setAuthToken(token);

    console.log('✅ Registration successful for user:', user.user_id);
    return { token, user };
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
  setAuthToken(null);
};

export const getStoredAuth = async () => {
  const token = await SecureStore.getItemAsync('token');
  const userStr = await SecureStore.getItemAsync('user');

  if (token && userStr) {
    const user = JSON.parse(userStr);
    setAuthToken(token);
    return { token, user };
  }

  return null;
};
