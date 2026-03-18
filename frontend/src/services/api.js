import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      if (response.status === 401) {
        // Token expired or unauthorized -> Logout
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      } else {
        // Other API errors
        const message = response.data?.message || response.data?.error || 'Something went wrong. Please try again.';
        toast.error(message);
      }
    } else {
      // Network errors (AI service or Backend down)
      toast.error('Server unreachable. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export const predictDisease = async (symptoms, userId) => {
  const response = await api.post('/symptoms/predict', { symptoms, userId });
  return response.data;
};

export const chatWithBot = async (message) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

export const analyzeReport = async (fileData, fileName, userId) => {
  const response = await api.post('/reports/upload', { fileData, fileName, userId });
  return response.data;
};

export default api;
