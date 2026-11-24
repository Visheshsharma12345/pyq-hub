import axios from 'axios';

// In production (Vercel) the API is on the same domain at /api
// In dev, Vite proxies /api → localhost:5000
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach token from storage on every request if not already set
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          original.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (_) {
          // refresh failed — let caller handle 401
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
