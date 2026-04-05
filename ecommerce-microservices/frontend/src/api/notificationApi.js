import { createClient } from './client';

const notificationClient = createClient('/api/notifications');

export const notificationApi = {
  getAllNotifications: () => notificationClient.get('/notifications'),
  getUserNotifications: (userId) => notificationClient.get(`/notifications/${userId}`),
};
