import { createClient } from './client';

const adminClient = createClient('/api/admin');

export const adminApi = {
  getStats: () => adminClient.get('/stats'),
  getDashboardData: () => adminClient.get('/dashboard')
};
