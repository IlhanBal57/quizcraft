import { create } from 'zustand';
import { Quiz, Question, AnswerKey } from '../types';

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<number, AnswerKey>;
  startTime: number | null;
  setQuiz: (quiz: Quiz) => void;
  setAnswer: (index: number, answer: AnswerKey) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  reset: () => void;
  getProgress: () => number;
  getAnsweredCount: () => number;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,

  setQuiz: (quiz) => set({
    currentQuiz: quiz,
    currentQuestionIndex: 0,
    answers: {},
    startTime: Date.now(),
  }),

  setAnswer: (index, answer) => set((state) => ({
    answers: { ...state.answers, [index]: answer },
  })),

  nextQuestion: () => set((state) => {
    const maxIndex = (state.currentQuiz?.questionCount || 1) - 1;
    return {
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, maxIndex),
    };
  }),

  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
  })),

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  reset: () => set({
    currentQuiz: null,
    currentQuestionIndex: 0,
    answers: {},
    startTime: null,
  }),

  getProgress: () => {
    const state = get();
    if (!state.currentQuiz) return 0;
    return ((state.currentQuestionIndex + 1) / state.currentQuiz.questionCount) * 100;
  },

  getAnsweredCount: () => {
    const state = get();
    return Object.keys(state.answers).length;
  },
}));
