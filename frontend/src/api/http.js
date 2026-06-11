import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      const { data } = await http.post('/auth/refresh');
      localStorage.setItem('accessToken', data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return http(original);
    }
    throw error;
  }
);
