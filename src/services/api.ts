import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getChats: async () => {
    const response = await api.get('/api/chats');
    return response.data;
  },

  createChat: async (data: { title: string; aiModel: string }) => {
    const response = await api.post('/api/chats', data);
    return response.data;
  },

  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, content: string) => {
    const response = await api.post(`/api/chats/${chatId}/messages`, { content });
    return response.data;
  },
};

export default api;