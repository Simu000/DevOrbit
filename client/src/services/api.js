import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making API call to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Auto-logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Your existing functions...
async function fetchRegisteredUsers(data) {
  try {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function fetchLoginUsers(data) {
  try {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

// Export both the functions and the api instance
export { api };
export default {
  fetchRegisteredUsers,
  fetchLoginUsers,
};