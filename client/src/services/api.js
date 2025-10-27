import axios from 'axios';

// ✅ Use environment variable for backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function fetchRegisteredUsers(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function fetchLoginUsers(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export default {
  fetchRegisteredUsers,
  fetchLoginUsers,
};
