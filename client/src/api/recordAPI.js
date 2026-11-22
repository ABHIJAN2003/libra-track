import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is expired/invalid, send the user to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const loginUser = (data) => api.post('/auth/login', data);
export const getRecords = (params) => api.get('/records', { params });
export const getStats = () => api.get('/records/stats');
export const getRecord = (id) => api.get(`/records/${id}`);
export const createRecord = (data) => api.post('/records', data);
export const updateRecord = (id, data) => api.put(`/records/${id}`, data);
export const updateStatus = (id, status) => api.patch(`/records/${id}/status`, { status });
export const deleteRecord = (id) => api.delete(`/records/${id}`);
