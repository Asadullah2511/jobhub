import api, { setAuthToken } from '../utils/api';
import * as SecureStore from 'expo-secure-store';

export const login = async (identifier, password) => {
  const response = await api.post('/auth/login', { identifier, password });
  // Backend returns: { success: true, data: { token, user } }
  const { token, user } = response.data.data || response.data;

  await SecureStore.setItemAsync('token', token);
  await SecureStore.setItemAsync('user', JSON.stringify(user));
  setAuthToken(token);

  return { token, user };
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  // Backend returns: { success: true, data: { token, user } }
  const { token, user } = response.data.data || response.data;

  await SecureStore.setItemAsync('token', token);
  await SecureStore.setItemAsync('user', JSON.stringify(user));
  setAuthToken(token);

  return { token, user };
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
