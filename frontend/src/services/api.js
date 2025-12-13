import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const userAPI = {
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  createUser: (data) => api.post('/users', data),
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
};

export const storeAPI = {
  createStore: (data) => api.post('/stores', data),
  getStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  getMyRatings: () => api.get('/stores/my-ratings'),
};

export const ratingAPI = {
  submitRating: (data) => api.post('/ratings', data),
};

export default api;
