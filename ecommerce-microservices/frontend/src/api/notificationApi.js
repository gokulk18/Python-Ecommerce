import client from './client';

export const getNotifications = async (userId) => {
  const { data } = await client.get(`/api/notifications/notifications/${userId}`);
  return data;
};
