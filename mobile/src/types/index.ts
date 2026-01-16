export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Question {
  id: number;
  quizId: number;
  index: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctKey?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  imageUrl?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  quizId: string;
  categoryId: number;
  subcategoryId: number;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questions: Question[];
  scoreCorrect?: number;
  scorePercentage?: number;
  durationSeconds?: number;
  status?: string;
  computedRankAtSubmit?: number;
}

export interface QuizResult {
  id: number;
  quizId: string;
  userId: number;
  scoreCorrect: number;
  scorePercentage: number;
  durationSeconds: number;
  computedRankAtSubmit: number;
  submittedAt: string;
  category: string;
  subcategory: string;
  difficulty: string;
  questionCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  email: string;
  scoreCorrect: number;
  scorePercentage: number;
  durationSeconds: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileStats {
  totalQuizzes: number;
  avgScore: number;
  bestScore: number;
  totalTime: number;
}

export interface ProfileData {
  stats: ProfileStats;
  history: QuizResult[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type AnswerKey = 'A' | 'B' | 'C' | 'D';
