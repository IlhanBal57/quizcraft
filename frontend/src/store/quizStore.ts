import { create } from 'zustand';
import { Quiz, QuizQuestion, QuizResult } from '../types';

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  startTime: number | null;
  result: QuizResult | null;
  setQuiz: (quiz: Quiz) => void;
  setAnswer: (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => void;
  nextQuestion: () => void;
  setResult: (result: QuizResult) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,
  result: null,
  setQuiz: (quiz) => set({ currentQuiz: quiz, startTime: Date.now(), currentQuestionIndex: 0, answers: {} }),
  setAnswer: (questionIndex, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionIndex]: answer },
    })),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),
  setResult: (result) => set({ result }),
  reset: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      result: null,
    }),
}));
