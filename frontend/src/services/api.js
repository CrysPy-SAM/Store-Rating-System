// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ 
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  // Fixed endpoint for store owner ratings
  getMyRatings: () => api.get('/stores/owner/ratings'),
};

export const ratingAPI = {
  submitRating: (data) => api.post('/ratings', data),
};

export default api;