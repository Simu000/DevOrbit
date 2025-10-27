import axios from 'axios';

async function fetchRegisteredUsers(data) {
    try {
        const response= await axios.post('http://localhost:3000/auth/register',data);
        return response.data;
    } catch (error) {
        throw error;
    }
  
}
async function fetchLoginUsers(data) {
    try {
        const response= await axios.post('http://localhost:3000/auth/login',data);
        return response.data;
    } catch (error) {
        throw error;
    }
  
}

export default {
    fetchRegisteredUsers,
    fetchLoginUsers
};