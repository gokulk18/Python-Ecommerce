import axios from 'axios';

// Dynamically determine the host so we don't hardcode the public IP
const host = window.location.hostname;

// Base instances for our 4 microservices
export const userApi = axios.create({ baseURL: `http://${host}:8001` });
export const productApi = axios.create({ baseURL: `http://${host}:8002` });
export const orderApi = axios.create({ baseURL: `http://${host}:8003` });
export const notificationApi = axios.create({ baseURL: `http://${host}:8004` });

// Add interceptor to inject JWT token into requests
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userApi.interceptors.request.use(attachToken);
productApi.interceptors.request.use(attachToken);
orderApi.interceptors.request.use(attachToken);
notificationApi.interceptors.request.use(attachToken);
