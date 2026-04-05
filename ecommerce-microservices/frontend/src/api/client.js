import axios from 'axios';

export const createClient = (baseURL) => {
  const client = axios.create({ baseURL });
  
  client.interceptors.request.use((config) => {
    try {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.user_id) {
          config.headers['X-User-Id'] = user.user_id;
        }
      }
    } catch (e) {
      console.error('Error attaching X-User-Id:', e);
    }
    return config;
  });
  
  return client;
};
