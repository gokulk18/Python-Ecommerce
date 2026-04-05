import client from './client';

export const login = async (credentials) => {
  const { data } = await client.post('/api/users/auth/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await client.post('/api/users/auth/register', userData);
  return data;
};

export const getProfile = async () => {
  const { data } = await client.get('/api/users/users/me');
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await client.put('/api/users/users/me', userData);
  return data;
};
