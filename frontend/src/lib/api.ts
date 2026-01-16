import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

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
