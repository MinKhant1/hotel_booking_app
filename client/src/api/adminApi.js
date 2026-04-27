import axios from 'axios';

export const adminApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('hotel_admin_auth');
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.token) {
        config.headers.Authorization = `Bearer ${data.token}`;
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});
