import { createClient } from './client';

const userClient = createClient('/api/users');

export const userApi = {
  login: (data) => userClient.post('/auth/login', data),
  register: (data) => userClient.post('/auth/register', data),
  getMe: () => userClient.get('/users/me'),
  updateMe: (data) => userClient.put('/users/me', data),
  getAllUsers: () => userClient.get('/users'),
  toggleAdmin: (id) => userClient.put(`/users/${id}/admin`)
};
