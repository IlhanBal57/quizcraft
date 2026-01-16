import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Backend API URL - Platform bazlı seçim
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api'; // Web browser
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api'; // Android Emulator
  } else {
    return 'http://localhost:3001/api'; // iOS Simulator
  }
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Token ekleme
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token read error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigation will be handled by auth store
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
};

// Quiz API
export const quizAPI = {
  start: (config: {
    categoryId: number;
    subcategoryId: number;
    difficulty: string;
    questionCount: number;
  }) => api.post('/quiz/start', config),
  submit: (quizId: string, data: { answers: any[]; durationSeconds: number }) =>
    api.post(`/quiz/${quizId}/submit`, data),
  getQuiz: (quizId: string) => api.get(`/quiz/${quizId}`),
  answerQuestion: (quizId: string, data: { questionIndex: number; answer: string }) =>
    api.post(`/quiz/${quizId}/answer`, data),
};

// Leaderboard API
export const leaderboardAPI = {
  getByConfig: (params: {
    categoryId: number;
    subcategoryId: number;
    difficulty: string;
    questionCount: number;
  }) => api.get('/leaderboard/config', { params }),
  getCategoryTop: (categoryId: number) =>
    api.get(`/leaderboard/category/${categoryId}/top`),
  getAllCategories: () => api.get('/leaderboard/all-categories'),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  getHistory: (page = 1, limit = 10) =>
    api.get('/profile/history', { params: { page, limit } }),
};

// Admin API
export const adminAPI = {
  getUsers: (params: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  getUserQuizzes: (userId: number) =>
    api.get(`/admin/user/${userId}/quizzes`),
  getUser: (userId: number) =>
    api.get(`/admin/user/${userId}`),
  updateUserRole: (userId: number, role: 'user' | 'admin') =>
    api.patch(`/admin/user/${userId}/role`, { role }),
  updateUser: (userId: number, data: { email?: string; password?: string }) =>
    api.patch(`/admin/user/${userId}`, data),
  deleteUser: (userId: number) =>
    api.delete(`/admin/user/${userId}`),
};

export default api;
