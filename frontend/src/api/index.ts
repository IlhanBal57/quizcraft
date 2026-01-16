import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

// Quiz API calls
export const fetchQuizzes = async () => {
  const response = await apiClient.get('/quizzes');
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await apiClient.post('/quizzes', quizData);
  return response.data;
};

// Question API calls
export const fetchQuestions = async (quizId) => {
  const response = await apiClient.get(`/quizzes/${quizId}/questions`);
  return response.data;
};

export const createQuestion = async (quizId, questionData) => {
  const response = await apiClient.post(`/quizzes/${quizId}/questions`, questionData);
  return response.data;
};

// Result API calls
export const submitQuizResult = async (resultData) => {
  const response = await apiClient.post('/results', resultData);
  return response.data;
};

export const fetchResults = async (quizId) => {
  const response = await apiClient.get(`/quizzes/${quizId}/results`);
  return response.data;
};