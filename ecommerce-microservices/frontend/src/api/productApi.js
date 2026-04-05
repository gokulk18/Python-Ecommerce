import client from './client';

export const getProducts = async (params = {}) => {
  const { data } = await client.get('/api/products/products', { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await client.get(`/api/products/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await client.post('/api/products/products', productData);
  return data;
};
