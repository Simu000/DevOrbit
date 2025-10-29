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

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
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
    return Promise.reject(error);
  }
);

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

// Add this for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

export default {
  fetchRegisteredUsers,
  fetchLoginUsers,
};