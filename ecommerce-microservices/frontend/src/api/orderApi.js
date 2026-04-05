import { createClient } from './client';

const orderClient = createClient('/api/orders');

export const orderApi = {
  createOrder: (data) => orderClient.post('', data),
  getOrders: () => orderClient.get(''),
  getAllOrders: () => orderClient.get('/all'),
  getOrder: (id) => orderClient.get(`/${id}`),
  updateStatus: (id, status) => orderClient.put(`/${id}/status`, { status }),
  cancelOrder: (id) => orderClient.put(`/${id}/cancel`)
};
