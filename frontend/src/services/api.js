import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || { message: 'Request failed' });
    }
);

export const api = {
    auth: {
        register: async (userData) => {
            try {
                return await axiosInstance.post('/users/register', userData);
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        login: async (credentials) => axiosInstance.post('/users/login', credentials),
        logout: async () => axiosInstance.post('/users/logout'),
    },
    users: {
        getProfile: async () => axiosInstance.get('/users/profile'),
        deleteUser: async (userId) => axiosInstance.delete(`/users/delete/${userId}`),
        updateProfile: async (data) => axiosInstance.put('/users/update', data),
    },
    admin: {
        getUsers: async () => axiosInstance.get('/users'),
        updateUser: async (userId, data) => axiosInstance.put(`/users/update/${userId}`, data),
        deleteUser: async (userId) => axiosInstance.delete(`/users/delete/${userId}`),
        getStats: async () => axiosInstance.get('/admin/stats'),
    },
};

export default api;
