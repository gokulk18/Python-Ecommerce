import { createClient } from './client';

const productClient = createClient('/api/products');

export const productApi = {
  getProducts: (params) => productClient.get('', { params }),
  getAllProducts: () => productClient.get('/all'),
  getProduct: (id) => productClient.get(`/${id}`),
  createProduct: (data) => productClient.post('', data),
  updateProduct: (id, data) => productClient.put(`/${id}`, data),
  deleteProduct: (id) => productClient.delete(`/${id}`)
};
