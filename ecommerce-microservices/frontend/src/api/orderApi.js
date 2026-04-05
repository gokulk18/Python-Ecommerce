import client from './client';

export const createOrder = async (orderData) => {
  const { data } = await client.post('/api/orders/orders', orderData);
  return data;
};

export const getOrders = async () => {
  const { data } = await client.get('/api/orders/orders');
  return data;
};

export const getOrder = async (id) => {
  const { data } = await client.get(`/api/orders/orders/${id}`);
  return data;
};

export const cancelOrder = async (id) => {
  const { data } = await client.put(`/api/orders/orders/${id}/cancel`);
  return data;
};
